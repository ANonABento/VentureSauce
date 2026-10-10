"use client";

import { type DragEvent, type FormEvent, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MagnifyingGlass, UploadSimple } from "@phosphor-icons/react/dist/ssr";
import { DUR, EASE_ENTER, EASE_STATE, RISE, SPRING } from "@/lib/motion";
import { Button } from "./button";
import { cn } from "./cn";
import { PasteForm } from "./inbox";
import { JOB_FLOW } from "./loading-steps";
import { SourceFlow } from "./viz";

type DropInput = { file?: File; text?: string; kind?: "email" | "notes" };

/**
 * The empty inbox (decision 32): the landscape with the drop card over it.
 * On drop the art breaks into its dot grid and the card becomes the source
 * flow, so the brand art turns into the pipeline that checks the claims.
 */
export function FirstRun({
  onDrop,
  busy,
  step,
  onLookup,
  compact = false,
}: {
  onDrop: (input: DropInput) => void;
  busy: boolean;
  step: number;
  /** Resolves to a message to show when the company isn't in the inbox. Omit to hide the lookup. */
  onLookup?: (name: string) => Promise<string | null>;
  /** A shorter art band, for when the page also carries the history below. */
  compact?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [pasting, setPasting] = useState<null | "email" | "notes">(null);
  const [name, setName] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);
  const [filed, setFiled] = useState<string | null>(null);

  function drop(input: DropInput) {
    setFiled(input.file?.name ?? (input.kind === "notes" ? "Call notes" : "Founder email"));
    onDrop(input);
  }

  function onDropFile(event: DragEvent) {
    event.preventDefault();
    setOver(false);
    const file = event.dataTransfer.files[0];
    if (file) drop({ file });
  }

  async function lookup(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !onLookup) return;
    setLooking(true);
    setNote(await onLookup(name.trim()));
    setLooking(false);
  }

  return (
    <div>
      {/* The tray shows through once the art has dissolved. */}
      <motion.div
        className={cn("relative overflow-hidden rounded-xl bg-tray", compact ? "h-[128px]" : "h-[176px]")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DUR.reveal, ease: EASE_ENTER }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- a static local asset; next/image adds nothing here */}
        <img
          src="/art/landscape.webp"
          alt=""
          className={cn("h-full w-full object-cover object-[50%_35%]", busy && "dissolve")}
        />
      </motion.div>

      <motion.div
        onDragOver={(event) => {
          event.preventDefault();
          if (!busy) setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDropFile}
        className={cn(
          // Fixed min height: swapping to the source flow never makes the card jump.
          "fragment relative mx-3 -mt-16 flex min-h-[244px] flex-col justify-center rounded-xl border px-5 py-6 text-center transition-colors duration-150 ease-out",
          // Drag-over is one of amber's four sanctioned uses.
          over ? "border-accent" : "border-transparent",
        )}
        initial={{ opacity: 0, y: RISE * 2 }}
        animate={{ opacity: 1, y: over ? -3 : 0 }}
        transition={{ ...SPRING, delay: over ? 0 : 0.12 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {busy ? (
            <motion.div
              key="flow"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DUR.base, ease: EASE_STATE, delay: 0.05 }}
            >
              <p className="font-serif text-xl leading-6 tracking-[-0.01em] text-ink">Checking every claim</p>
              {filed && <p className="mt-1 truncate font-mono text-[11px] leading-4 text-graphite">{filed}</p>}
              <SourceFlow steps={JOB_FLOW} current={step} className="mt-5" />
            </motion.div>
          ) : (
            <motion.div
              key="drop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.15 } }}
              transition={{ duration: 0.2, ease: EASE_STATE }}
            >
              <span
                className={cn(
                  "mx-auto flex h-14 w-14 items-center justify-center rounded-full transition-colors duration-150",
                  over ? "bg-accent-wash text-accent" : "bg-tray text-data",
                )}
              >
                <UploadSimple aria-hidden="true" size={26} weight="light" />
              </span>
              <p className="mt-4 font-serif text-2xl leading-7 tracking-[-0.02em] text-balance text-ink">
                Drop anything about a company
              </p>
              <p className="mt-1.5 text-[13px] leading-5 text-graphite">Deck, email, call notes or a screenshot</p>
              {pasting ? (
                <div className="mt-4">
                  <PasteForm onDrop={drop} busy={busy} kind={pasting} onKind={setPasting} onDone={() => setPasting(null)} />
                </div>
              ) : (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Button onClick={() => fileRef.current?.click()}>Choose file</Button>
                  <Button variant="ghost" onClick={() => setPasting("email")}>
                    Paste text
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <input
          ref={fileRef}
          type="file"
          hidden
          accept=".pdf,.pptx,.png,.jpg,.jpeg,.webp,.eml,.txt,.md"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) drop({ file });
            event.target.value = "";
          }}
        />
      </motion.div>

      {onLookup && (
        <motion.form
          onSubmit={lookup}
          className="mt-7"
          initial={{ opacity: 0, y: RISE }}
          animate={{ opacity: busy ? 0.4 : 1, y: 0 }}
          transition={{ duration: DUR.reveal, ease: EASE_ENTER, delay: 0.24 }}
        >
          <label htmlFor="lookup" className="block text-sm leading-5 font-medium text-ink">
            Or look up a company
          </label>
          <div className="@container mt-2">
            <div className="flex flex-col gap-2 @[22rem]:flex-row">
              <span className="relative block min-w-0 flex-1">
                <MagnifyingGlass
                  aria-hidden="true"
                  size={16}
                  weight="light"
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-graphite"
                />
                <input
                  id="lookup"
                  value={name}
                  disabled={busy}
                  onChange={(event) => {
                    setName(event.target.value);
                    setNote(null);
                  }}
                  autoComplete="off"
                  placeholder="e.g. Quillfeather Robotics"
                  className="block h-9 w-full rounded-full border border-rule-strong bg-surface pr-3 pl-9 text-sm text-ink placeholder:text-graphite"
                />
              </span>
              <Button type="submit" variant="quiet" className="shrink-0" disabled={busy || looking}>
                {looking ? "Looking…" : "Check"}
              </Button>
            </div>
          </div>
          {note && (
            <p role="status" className="mt-2 text-xs leading-4 text-graphite">
              {note}
            </p>
          )}
        </motion.form>
      )}
    </div>
  );
}
