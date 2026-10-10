"use client";

import Image from "next/image";
import { type DragEvent, useRef, useState } from "react";
import { API, type CompanySummary, type ItemKind, KIND_NAME } from "@/lib/api";
import { Button } from "./button";
import { cn } from "./cn";
import { formatDate } from "./report-utils";

/** Item kinds are never colored: neutral mono tags only. */
export function ItemTag({ kind }: { kind: ItemKind | string }) {
  return (
    <span className="inline-flex h-5 items-center rounded-[2px] border border-rule px-1.5 font-mono text-[10px] leading-4 text-graphite uppercase">
      {KIND_NAME[kind] ?? kind}
    </span>
  );
}

/** Drop a file, or paste an email / call notes. `compact` is the strip at the top of the inbox. */
export function DropStrip({
  onDrop,
  busy,
  label = "Drop a deck, email, screenshot or notes",
  dashed = false,
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
          "flex items-center justify-between gap-3 rounded-[2px] border px-3 py-3 transition-colors duration-150 ease-out",
          dashed ? "border-dashed" : "",
          over ? "border-ink bg-surface" : "border-rule",
        )}
      >
        <span className="text-[13px] leading-5 text-graphite">{busy ? "Reading…" : label}</span>
        <span className="flex shrink-0 gap-2">
          <Button variant="quiet" className="h-7 px-2 text-xs" disabled={busy} onClick={() => fileRef.current?.click()}>
            File
          </Button>
          <Button variant="quiet" className="h-7 px-2 text-xs" disabled={busy} onClick={() => setPasting(pasting ? null : "email")}>
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
          <div className="flex gap-3 text-xs">
            {(["email", "notes"] as const).map((kind) => (
              <label key={kind} className={cn("cursor-pointer", pasting === kind ? "text-ink" : "text-graphite")}>
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
            className="mt-2 block w-full rounded-[2px] border border-rule bg-surface p-3 text-[13px] leading-5 text-ink placeholder:text-graphite"
          />
          <Button type="submit" className="mt-2 h-8" disabled={busy}>
            File it
          </Button>
        </form>
      )}
    </div>
  );
}

/** First visit (empty inbox): what this is, and a one-click example so nobody starts from a blank page. */
export function Welcome({ onExample, loading }: { onExample: () => void; loading: boolean }) {
  return (
    <section className="mt-4 overflow-hidden rounded-xl bg-tray">
      <Image src="/art/hero.webp" alt="" width={760} height={380} priority className="h-36 w-full object-cover" />
      <div className="p-4">
        <h2 className="font-serif text-2xl leading-7 tracking-tight text-ink">Drop anything about a company</h2>
        <p className="mt-2 text-[13px] leading-5 text-graphite">
          Decks, founder emails, call notes, screenshots, slides. Each item is filed under its company, and every claim
          is checked against SEC filings, LinkedIn and the press, and against everything else you&apos;ve dropped.
          You get the questions to ask the founder, and a daily briefing you can listen to or talk to.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={onExample} disabled={loading}>
            {loading ? "Loading the example…" : "Try it with an example"}
          </Button>
          <a href={`${API}/samples/`} target="_blank" rel="noreferrer" className="text-xs text-ink underline underline-offset-4">
            Or download test files
          </a>
        </div>
        <p className="mt-3 text-[11px] leading-4 text-graphite">
          The example is a fictional company (Acme AI) plus public funding claims from two real startups. This inbox is
          private to this browser.
        </p>
      </div>
    </section>
  );
}

function statusLine(c: CompanySummary): string {
  const parts = [];
  if (c.discrepancies) parts.push(`${c.discrepancies} discrepanc${c.discrepancies === 1 ? "y" : "ies"}`);
  if (c.contradictions) parts.push(`${c.contradictions} contradiction${c.contradictions === 1 ? "" : "s"}`);
  return parts.join(" · ") || "Nothing flagged";
}

/** Inbox rows: name, unseen dot, item-kind tags, status summary, last updated. Same edge bar as status rows. */
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
    <ul className="mt-2">
      {companies.map((c) => {
        const flagged = c.discrepancies + c.contradictions > 0;
        const unseen = c.last_item_at && (!seen[c.id] || seen[c.id] < c.last_item_at);
        return (
          <li key={c.id} className="relative border-b border-rule">
            <span aria-hidden="true" className={cn("absolute top-4 bottom-4 -left-3 w-0.5", flagged ? "bg-signal" : "bg-graphite/40")} />
            <button type="button" onClick={() => onOpen(c.id)} className="group w-full py-4 text-left">
              <span className="flex items-baseline justify-between gap-3">
                <span className="flex items-center gap-2 text-sm leading-5 font-medium text-ink">
                  {unseen && <span aria-label="new items" className="h-1.5 w-1.5 rounded-full bg-ink" />}
                  <span className="underline decoration-transparent underline-offset-4 group-hover:decoration-current">{c.name}</span>
                </span>
                <span className="shrink-0 text-[11px] leading-4 text-graphite">{formatDate(c.updated_at)}</span>
              </span>
              <span className="mt-2 flex flex-wrap gap-1">
                {c.item_kinds.map((kind) => (
                  <ItemTag key={kind} kind={kind} />
                ))}
              </span>
              <span className={cn("mt-2 block text-xs leading-4", flagged ? "text-signal" : "text-graphite")}>{statusLine(c)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
