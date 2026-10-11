"use client";

import { type DragEvent, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { UploadSimple } from "@phosphor-icons/react/dist/ssr";
import { DUR, EASE_STATE, SPRING } from "@/lib/motion";
import { Button } from "./button";
import { cn } from "./cn";
import { PasteForm } from "./inbox";
import { JOB_FLOW } from "./loading-steps";
import { SourceFlow } from "./viz";

export type DropInput = { file?: File; text?: string; kind?: "email" | "notes" };

/**
 * The home screen's drop zone (decisions 46, 55): the horizon art with an inset
 * dashed frame and a white card. On drop the art breaks into its dot grid and
 * the card becomes the source flow. `tall` is the empty-inbox size.
 */
export function ArtDropZone({
  onPick,
  busy,
  step,
  filing,
  tall = false,
}: {
  /** A file was dropped or chosen, or text was pasted: hand it to the add-to-company sheet. */
  onPick: (input: DropInput) => void;
  busy: boolean;
  step: number;
  /** The name of the item being checked, shown as a receipt line while busy. */
  filing?: string | null;
  tall?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [pasting, setPasting] = useState<null | "email" | "notes">(null);

  function onDropFile(event: DragEvent) {
    event.preventDefault();
    setOver(false);
    const file = event.dataTransfer.files[0];
    if (file && !busy) onPick({ file });
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        if (!busy) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDropFile}
      className={cn("relative overflow-hidden rounded-xl bg-paper", tall ? "min-h-[340px]" : "min-h-[290px]")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- a static local asset; next/image adds nothing here */}
      <img
        src="/art/horizon-1x1.webp"
        alt=""
        className={cn("absolute inset-0 h-full w-full object-cover object-bottom", busy && "dissolve")}
      />
      {/* The inset frame; amber while something is dragged over it (one of amber's four uses). */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-2.5 rounded-lg border border-dashed transition-colors duration-150 ease-out",
          over ? "border-accent bg-accent-wash/30" : busy ? "border-transparent" : "border-data/30",
        )}
      />
      {/* The card sits in the sky; the planet stays visible beneath it. */}
      <div className="relative flex min-h-[inherit] items-start justify-center px-6 pt-6 pb-24">
        <motion.div
          className="fragment w-full max-w-[290px] rounded-xl px-5 py-5 text-center"
          animate={{ y: over ? -4 : 0, scale: over ? 1.015 : 1 }}
          transition={SPRING}
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
                {filing && <p className="mt-1 truncate font-mono text-[11px] leading-4 text-graphite">{filing}</p>}
                <SourceFlow steps={JOB_FLOW} current={step} announce={false} className="mt-5" />
              </motion.div>
            ) : pasting ? (
              <motion.div key="paste" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <PasteForm
                  onDrop={(input) => onPick(input)}
                  kind={pasting}
                  onKind={setPasting}
                  onDone={() => setPasting(null)}
                />
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
                    "mx-auto flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-150",
                    over ? "bg-accent-wash text-accent" : "bg-tray text-data",
                  )}
                >
                  <UploadSimple aria-hidden="true" size={18} weight="light" />
                </span>
                <p className="mt-2.5 font-serif text-lg leading-6 tracking-[-0.01em] text-balance text-ink">
                  Drop anything about a company
                </p>
                <p className="mt-1 text-xs leading-4 text-graphite">
                  or <kbd className="font-sans">⌘V</kbd> a screenshot, deck or email
                </p>
                <div className="mt-3.5 flex items-center justify-center gap-1.5">
                  <Button size="sm" onClick={() => fileRef.current?.click()}>
                    Choose file
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setPasting("email")}>
                    Paste text
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      <input
        ref={fileRef}
        type="file"
        hidden
        accept=".pdf,.pptx,.png,.jpg,.jpeg,.webp,.eml,.txt,.md"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onPick({ file });
          event.target.value = "";
        }}
      />
    </div>
  );
}
