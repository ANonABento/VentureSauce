"use client";

/**
 * ⌘V or drop anything, anywhere in the panel, and it gets filed.
 *
 * Kept in its own file so panel/UI reskins don't drop it: the panel only needs `usePasteToFile(...)`.
 *
 * What it takes (from the clipboard or a drop):
 * - files: screenshots, copied images, PDFs, PPTX, .eml, .txt → filed as-is (several at once are filed in turn)
 * - a link → the backend downloads the file or reads the page (a company's homepage opens it if it's in the inbox)
 * - a company name → opens that company if it's in the inbox
 * - any other text (an email, call notes) → filed as an email when it has mail headers, else as notes
 * Inside a text box only files are taken over, so normal typing and pasting keep working.
 */

import { useEffect, useRef } from "react";

export type FileInput = { file?: File; text?: string; url?: string; kind?: "email" | "notes"; companyId?: string };

export type Pasted =
  | { kind: "files"; files: File[] }
  | { kind: "url"; url: string }
  | { kind: "name"; name: string }
  | { kind: "text"; text: string; mail: boolean };

// Anything with a scheme, or a bare domain like acme-ai.com/deck.pdf.
const URL_RE = /^(https?:\/\/\S+|([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/\S*)?)$/i;

/** What a clipboard or drop holds, or null when there's nothing to file. */
export function classify(data: DataTransfer, inTextBox: boolean): Pasted | null {
  const files = Array.from(data.files ?? []);
  if (files.length) return { kind: "files", files: files.map(nameScreenshot) };
  if (inTextBox) return null;
  // A dragged link carries text/uri-list; a copied one is plain text.
  const uri = (data.getData("text/uri-list") || "").split("\n").find((l) => l && !l.startsWith("#"));
  const text = (uri || data.getData("text/plain") || "").trim();
  if (!text) return null;
  if (!/\s/.test(text) && URL_RE.test(text)) return { kind: "url", url: text };
  if (text.length <= 60 && !text.includes("\n") && text.split(/\s+/).length <= 6) return { kind: "name", name: text };
  if (text.length < 20) return null;
  return { kind: "text", text, mail: /^(from|subject):/im.test(text) };
}

/** Screenshots arrive as "image.png"; give them a name that says what they are. */
function nameScreenshot(file: File): File {
  if (!file.type.startsWith("image/") || !/^image\.\w+$/.test(file.name)) return file;
  return new File([file], `pasted-screenshot.${file.type.split("/")[1] || "png"}`, { type: file.type });
}

/** A bare homepage (no path) is about a company, not a document. */
const isHomepage = (url: string) => {
  try {
    const u = new URL(url.includes("://") ? url : `https://${url}`);
    return u.pathname === "/" && !u.search;
  } catch {
    return false;
  }
};

export function usePasteToFile({
  enabled,
  companyId,
  onFile,
  openCompany,
  onMessage,
}: {
  /** Off while a job runs or on screens where filing makes no sense. */
  enabled: boolean;
  /** On a company screen, new items go under it. */
  companyId?: string;
  onFile: (input: FileInput) => Promise<void> | void;
  /** Opens a company by name or URL if it's in the inbox; resolves false if it isn't. */
  openCompany: (q: { company?: string; url?: string }) => Promise<boolean>;
  onMessage: (message: string) => void;
}) {
  // Handlers read the latest props without re-binding listeners on every render.
  const props = useRef({ enabled, companyId, onFile, openCompany, onMessage });
  useEffect(() => {
    props.current = { enabled, companyId, onFile, openCompany, onMessage };
  });

  useEffect(() => {
    async function handle(pasted: Pasted) {
      const { companyId, onFile, openCompany, onMessage } = props.current;
      if (pasted.kind === "files") {
        for (const file of pasted.files) await onFile({ file, companyId });
      } else if (pasted.kind === "url") {
        if (isHomepage(pasted.url) && (await openCompany({ url: pasted.url }))) return;
        await onFile({ url: pasted.url, companyId });
      } else if (pasted.kind === "name") {
        if (!(await openCompany({ company: pasted.name }))) {
          onMessage(`${pasted.name} isn't in your inbox yet. Drop its deck, a founder email or a link.`);
        }
      } else {
        await onFile({ text: pasted.text, kind: pasted.mail ? "email" : undefined, companyId });
      }
    }

    function onPaste(event: ClipboardEvent) {
      if (!props.current.enabled || !event.clipboardData) return;
      const target = event.target as HTMLElement | null;
      const typing = !!target && (target.isContentEditable || ["INPUT", "TEXTAREA"].includes(target.tagName));
      const pasted = classify(event.clipboardData, typing);
      if (!pasted) return;
      event.preventDefault();
      void handle(pasted);
    }

    // Without this a file dropped outside the drop strip would open in the panel and replace it.
    function onDragOver(event: DragEvent) {
      if (props.current.enabled) event.preventDefault();
    }

    function onDrop(event: DragEvent) {
      if (!props.current.enabled || !event.dataTransfer) return;
      const files = event.dataTransfer.files?.length ?? 0;
      // The drop strip already filed a dropped file; links dropped on it (it ignores those) are ours.
      if (files && event.defaultPrevented) return;
      const pasted = classify(event.dataTransfer, false);
      event.preventDefault();
      if (pasted) void handle(pasted);
    }

    document.addEventListener("paste", onPaste);
    document.addEventListener("dragover", onDragOver);
    document.addEventListener("drop", onDrop);
    return () => {
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("dragover", onDragOver);
      document.removeEventListener("drop", onDrop);
    };
  }, []);
}
