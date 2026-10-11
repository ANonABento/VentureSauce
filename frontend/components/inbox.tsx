"use client";

import { type DragEvent, useRef, useState } from "react";
import {
  EnvelopeSimple,
  FileText,
  Image as ImageIcon,
  Note,
  Notepad,
  UploadSimple,
} from "@phosphor-icons/react/dist/ssr";
import { motion } from "motion/react";
import { type CompanySummary, type ItemKind, KIND_NAME } from "@/lib/api";
import { DUR, EASE_ENTER, RISE, STAGGER } from "@/lib/motion";
import { Button } from "./button";
import { cn } from "./cn";
import { FILE_ACCEPT } from "./drop-zone";
import { JOB_FLOW } from "./loading-steps";
import { formatDate } from "./report-utils";
import { SignalStrip, SourceFlow } from "./viz";

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

/** Item kinds as icons only (names in the tooltip and for screen readers): the row stays a glance. */
export function KindIcons({ kinds }: { kinds: (ItemKind | string)[] }) {
  return (
    <span className="inline-flex items-center gap-1 text-graphite">
      {kinds.map((kind) => {
        const Icon = KIND_ICON[kind] ?? FileText;
        const name = KIND_NAME[kind] ?? kind;
        return (
          <span key={kind} title={name} className="inline-flex">
            <Icon aria-hidden="true" size={14} weight="duotone" />
            <span className="sr-only">{name}</span>
          </span>
        );
      })}
    </span>
  );
}

type DropInput = { file?: File; text?: string; kind?: "email" | "notes" };

/** Paste a founder email or call notes. Shared by the drop strip and the first-run card. */
export function PasteForm({
  onDrop,
  busy,
  kind,
  onKind,
  onDone,
}: {
  onDrop: (input: DropInput) => void;
  busy?: boolean;
  kind: "email" | "notes";
  onKind: (kind: "email" | "notes") => void;
  onDone: () => void;
}) {
  const [text, setText] = useState("");
  return (
    <form
      className="text-left"
      onSubmit={(event) => {
        event.preventDefault();
        if (!text.trim()) return;
        onDrop({ text: text.trim(), kind });
        setText("");
        onDone();
      }}
    >
      <div className="flex gap-1 text-xs">
        {(["email", "notes"] as const).map((option) => (
          <label
            key={option}
            className={cn(
              "inline-flex h-6 cursor-pointer items-center rounded-full px-3 font-medium transition-colors duration-150",
              kind === option ? "bg-ink text-paper" : "bg-tray text-graphite",
            )}
          >
            <input type="radio" className="sr-only" checked={kind === option} onChange={() => onKind(option)} />
            {option === "email" ? "Founder email" : "My call notes"}
          </label>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={5}
        aria-label={kind === "email" ? "Founder email" : "Call notes"}
        placeholder={kind === "email" ? "Paste the founder's email…" : "Paste your notes from the call…"}
        className="mt-2 block w-full rounded-lg border border-rule-strong bg-surface p-3 text-[13px] leading-5 text-ink placeholder:text-graphite"
      />
      <div className="mt-2 flex gap-2">
        <Button type="submit" size="sm" disabled={busy}>
          File it
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Back
        </Button>
      </div>
    </form>
  );
}

/**
 * Drop a file, or paste an email / call notes. v2 always draws the dashed drop
 * outline, so `dashed` is accepted for compatibility but no longer changes the look.
 */
export function DropStrip({
  onDrop,
  busy,
  step,
  label = "Drop a deck or email",
}: {
  onDrop: (input: DropInput) => void;
  busy?: boolean;
  /** The running job's JOB_FLOW step; while busy the strip becomes the source flow. */
  step?: number;
  label?: string;
  dashed?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [pasting, setPasting] = useState<null | "email" | "notes">(null);

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
          "flex min-h-[58px] items-center justify-between gap-3 rounded-xl border border-dashed px-3 py-3 transition-colors duration-150 ease-out",
          // Drag-over is one of amber's four sanctioned uses.
          over ? "border-accent bg-accent-wash" : busy ? "border-transparent bg-tray" : "border-rule-strong bg-surface",
        )}
      >
        {busy ? (
          <SourceFlow steps={JOB_FLOW} current={step ?? 0} className="mx-1" />
        ) : (
        <>
        <span className="flex min-w-0 items-center gap-2">
          <UploadSimple aria-hidden="true" size={18} weight="light" className="shrink-0 text-data" />
          <span className="text-[13px] leading-5 text-graphite">{label}</span>
        </span>
        <span className="flex shrink-0 gap-1.5">
          <Button variant="quiet" size="xs" disabled={busy} onClick={() => fileRef.current?.click()}>
            Choose
          </Button>
          <Button variant="quiet" size="xs" disabled={busy} onClick={() => setPasting(pasting ? null : "email")}>
            Paste
          </Button>
        </span>
        </>
        )}
        <input
          ref={fileRef}
          type="file"
          hidden
          accept={FILE_ACCEPT}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onDrop({ file });
            event.target.value = "";
          }}
        />
      </div>
      {pasting && !busy && (
        <div className="mt-2">
          <PasteForm onDrop={onDrop} busy={busy} kind={pasting} onKind={setPasting} onDone={() => setPasting(null)} />
        </div>
      )}
    </div>
  );
}

/** Inbox rows (v2 + decision 30): serif name, unseen dot, signal strip and kind icons. No sentences. */
export function CompanyList({
  companies,
  seen,
  onOpen,
}: {
  companies: CompanySummary[];
  seen: Record<string, string>;
  onOpen: (company: CompanySummary) => void;
}) {
  if (!companies.length) return null;
  return (
    <section className="mt-6">
      <h2 className="text-sm leading-5 font-medium text-ink">
        Companies <span className="text-data">{companies.length}</span>
      </h2>
      <ul className="mt-3 space-y-2">
        {companies.map((c, index) => {
          const unseen = c.last_item_at && (!seen[c.id] || seen[c.id] < c.last_item_at);
          const flags = c.discrepancies + c.contradictions;
          return (
            <motion.li
              key={c.id}
              className="fragment"
              initial={{ opacity: 0, y: RISE }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.reveal, ease: EASE_ENTER, delay: 0.1 + index * STAGGER }}
            >
              <button
                type="button"
                onClick={() => onOpen(c)}
                className="group block w-full rounded-lg px-3.5 py-3 text-left transition-[background-color,box-shadow] duration-150 ease-out hover:bg-paper"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2">
                    <motion.span
                      layoutId={`company-name-${c.id}`}
                      className="truncate font-serif text-lg leading-[21px] text-ink underline decoration-transparent underline-offset-4 group-hover:decoration-current"
                    >
                      {c.name}
                    </motion.span>
                    {unseen && <span aria-label="new items" className="h-1.5 w-1.5 shrink-0 rounded-full bg-data" />}
                  </span>
                  {flags > 0 && (
                    <span aria-hidden="true" className="shrink-0 font-serif text-lg leading-6 text-signal">
                      {flags}
                    </span>
                  )}
                </span>
                <span className="mt-2 flex items-center justify-between gap-3">
                  <motion.span layoutId={`company-strip-${c.id}`} className="flex">
                    <SignalStrip discrepancies={c.discrepancies} contradictions={c.contradictions} delay={0.2 + index * STAGGER} />
                  </motion.span>
                  <span className="flex shrink-0 items-center gap-2 text-[11px] leading-4 text-graphite">
                    <KindIcons kinds={c.item_kinds} />
                    {formatDate(c.updated_at)}
                  </span>
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
