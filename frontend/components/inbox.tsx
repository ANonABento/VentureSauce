"use client";

import { type DragEvent, useRef, useState } from "react";
import {
  CheckCircle,
  EnvelopeSimple,
  FileText,
  Image as ImageIcon,
  Note,
  Notepad,
  UploadSimple,
  WarningDiamond,
  XCircle,
} from "@phosphor-icons/react/dist/ssr";
import { type CompanySummary, type ItemKind, KIND_NAME } from "@/lib/api";
import { Button } from "./button";
import { cn } from "./cn";
import { formatDate } from "./report-utils";

const KIND_ICON: Record<string, typeof FileText> = {
  pdf: FileText,
  pdf_scanned: FileText,
  slides: FileText,
  image: ImageIcon,
  email: EnvelopeSimple,
  notes: Notepad,
  text: Note,
};

/** Item kinds are never colored: neutral sentence-case pills with a duotone kind icon. */
export function ItemTag({ kind }: { kind: ItemKind | string }) {
  const Icon = KIND_ICON[kind];
  return (
    <span className="inline-flex h-5 items-center gap-1 rounded-full bg-tray px-2 text-[11px] leading-4 font-medium text-graphite">
      {Icon && <Icon aria-hidden="true" size={12} weight="duotone" className="shrink-0" />}
      {KIND_NAME[kind] ?? kind}
    </span>
  );
}

/**
 * Drop a file, or paste an email / call notes. v2 always draws the dashed drop
 * outline, so `dashed` is accepted for compatibility but no longer changes the look.
 */
export function DropStrip({
  onDrop,
  busy,
  label = "Drop a deck, email, screenshot or notes",
}: {
  onDrop: (input: { file?: File; text?: string; kind?: "email" | "notes" }) => void;
  busy?: boolean;
  label?: string;
  dashed?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [pasting, setPasting] = useState<null | "email" | "notes">(null);
  const [text, setText] = useState("");

  function onDropFile(event: DragEvent) {
    event.preventDefault();
    setOver(false);
    const file = event.dataTransfer.files[0];
    if (file) onDrop({ file });
  }

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDropFile}
        className={cn(
          "flex items-center justify-between gap-3 rounded-xl border border-dashed px-3 py-3 transition-colors duration-150 ease-out",
          // Drag-over is one of amber's four sanctioned uses.
          over ? "border-accent bg-accent-wash" : "border-rule-strong bg-surface",
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <UploadSimple aria-hidden="true" size={18} weight="light" className="shrink-0 text-data" />
          <span className="text-[13px] leading-5 text-graphite">{busy ? "Reading…" : label}</span>
        </span>
        <span className="flex shrink-0 gap-1.5">
          <Button variant="quiet" className="h-7 px-3 text-xs" disabled={busy} onClick={() => fileRef.current?.click()}>
            Choose
          </Button>
          <Button variant="quiet" className="h-7 px-3 text-xs" disabled={busy} onClick={() => setPasting(pasting ? null : "email")}>
            Paste
          </Button>
        </span>
        <input
          ref={fileRef}
          type="file"
          hidden
          accept=".pdf,.pptx,.png,.jpg,.jpeg,.webp,.eml,.txt,.md"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onDrop({ file });
            event.target.value = "";
          }}
        />
      </div>
      {pasting && (
        <form
          className="mt-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!text.trim()) return;
            onDrop({ text: text.trim(), kind: pasting });
            setText("");
            setPasting(null);
          }}
        >
          <div className="flex gap-1 text-xs">
            {(["email", "notes"] as const).map((kind) => (
              <label
                key={kind}
                className={cn(
                  "inline-flex h-6 cursor-pointer items-center rounded-full px-3 font-medium",
                  pasting === kind ? "bg-ink text-paper" : "bg-tray text-graphite",
                )}
              >
                <input type="radio" className="sr-only" checked={pasting === kind} onChange={() => setPasting(kind)} />
                {kind === "email" ? "Founder email" : "My call notes"}
              </label>
            ))}
          </div>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={5}
            placeholder={pasting === "email" ? "Paste the founder's email…" : "Paste your notes from the call…"}
            className="mt-2 block w-full rounded-lg border border-rule-strong bg-surface p-3 text-[13px] leading-5 text-ink placeholder:text-graphite"
          />
          <Button type="submit" className="mt-2 h-8" disabled={busy}>
            File it
          </Button>
        </form>
      )}
    </div>
  );
}

const PILL = "inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-xs leading-4 font-medium";

/** Status as word + icon, never colour alone: brick for discrepancies and contradictions, neutral otherwise. */
function StatusPills({ company: c }: { company: CompanySummary }) {
  if (!c.discrepancies && !c.contradictions) {
    return (
      <span className={cn(PILL, "bg-tray text-graphite")}>
        <CheckCircle aria-hidden="true" size={14} weight="light" />
        Nothing flagged
      </span>
    );
  }
  return (
    <>
      {c.discrepancies > 0 && (
        <span className={cn(PILL, "bg-signal-wash text-signal")}>
          <XCircle aria-hidden="true" size={14} weight="light" />
          {c.discrepancies} discrepanc{c.discrepancies === 1 ? "y" : "ies"}
        </span>
      )}
      {c.contradictions > 0 && (
        <span className={cn(PILL, "bg-signal-wash text-signal")}>
          <WarningDiamond aria-hidden="true" size={14} weight="light" />
          {c.contradictions} contradiction{c.contradictions === 1 ? "" : "s"}
        </span>
      )}
    </>
  );
}

/** Inbox rows (v2): one white fragment per company with serif name, unseen dot, kinds and status pills. */
export function CompanyList({
  companies,
  seen,
  onOpen,
}: {
  companies: CompanySummary[];
  seen: Record<string, string>;
  onOpen: (id: string) => void;
}) {
  if (!companies.length) {
    return (
      <p className="mt-6 text-[13px] leading-5 text-graphite">
        Nothing filed yet. Drop a deck, a founder email or your call notes above: each item is filed under its company
        and every claim is checked.
      </p>
    );
  }
  return (
    <section className="mt-6">
      <h2 className="text-sm leading-5 font-medium text-ink">
        Companies <span className="text-data">{companies.length}</span>
      </h2>
      <ul className="mt-3 space-y-2">
        {companies.map((c) => {
          const unseen = c.last_item_at && (!seen[c.id] || seen[c.id] < c.last_item_at);
          return (
            <li key={c.id} className="fragment">
              <button type="button" onClick={() => onOpen(c.id)} className="group block w-full px-3.5 py-3 text-left">
                <span className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-serif text-lg leading-6 text-ink underline decoration-transparent underline-offset-4 group-hover:decoration-current">
                      {c.name}
                    </span>
                    {unseen && <span aria-label="new items" className="h-1.5 w-1.5 shrink-0 rounded-full bg-data" />}
                  </span>
                  <span className="shrink-0 text-xs leading-4 text-graphite">{formatDate(c.updated_at)}</span>
                </span>
                {(c.domain || c.item_kinds.length > 0) && (
                  <span className="mt-1 flex flex-wrap items-center gap-1 text-xs leading-4 text-graphite">
                    {c.domain && <span className="mr-1 truncate">{c.domain}</span>}
                    {c.item_kinds.map((kind) => (
                      <ItemTag key={kind} kind={kind} />
                    ))}
                  </span>
                )}
                <span className="mt-2.5 flex flex-wrap gap-1.5">
                  <StatusPills company={c} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
