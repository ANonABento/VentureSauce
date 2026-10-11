"use client";

import { UploadSimple } from "@phosphor-icons/react/dist/ssr";
import { motion } from "motion/react";
import { Dropzone } from "@/components/kibo-ui/dropzone";
import { Progress } from "@/components/ui/progress";
import { DUR, EASE_ENTER } from "@/lib/motion";
import { cn } from "./cn";
import { JOB_FLOW } from "./loading-steps";

/** A link (`url`) comes from a paste or drop anywhere in the panel (use-paste-to-file.ts); the backend downloads or reads it. */
export type DropInput = { file?: File; text?: string; url?: string; kind?: "email" | "notes" };

// What the backend reads (backend/ingest.py): decks, scans, slides, screenshots, emails, Word docs, notes and other
// text files. Keep in sync with FILE_ACCEPT: a file outside this list is rejected by the strip without a word.
const ACCEPT = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif", ".heic"],
  "message/rfc822": [".eml"],
  "text/plain": [".txt", ".md", ".markdown", ".log"],
  "text/csv": [".csv", ".tsv"],
  "application/json": [".json"],
  "text/html": [".html", ".htm"],
};

/** The same list for plain <input type="file"> pickers. */
export const FILE_ACCEPT = Object.values(ACCEPT).flat().join(",");

/**
 * The dropzone (decisions 59–60): the shadcn/Kibo UI dropzone, plain. One
 * icon, one line; ⌘V anywhere still files a paste. While an item is being
 * checked it becomes a progress card: the file, the source being read, a bar.
 */
export function DropZone({
  onPick,
  busy,
  step,
  filing,
  onError,
  className,
}: {
  className?: string;
  onPick: (input: DropInput) => void;
  busy: boolean;
  /** The running job's JOB_FLOW step. */
  step: number;
  filing?: string | null;
  onError?: (message: string) => void;
}) {
  if (busy) {
    const value = Math.min(100, ((step + 0.5) / JOB_FLOW.length) * 100);
    return (
      <motion.div
        className={cn("flex flex-col justify-center rounded-xl border border-rule bg-surface px-4 py-4", className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DUR.base, ease: EASE_ENTER }}
      >
        <div className="flex items-baseline justify-between gap-3 text-xs leading-4">
          <span className="min-w-0 truncate font-mono text-ink">{filing ?? "Your item"}</span>
          <span className="shrink-0 text-graphite">{JOB_FLOW[Math.min(step, JOB_FLOW.length - 1)]}</span>
        </div>
        <Progress
          value={value}
          aria-label="Checking the item"
          className="mt-3 h-1.5 bg-tray-strong"
          indicatorClassName="rounded-full bg-ink duration-500 ease-out"
        />
      </motion.div>
    );
  }

  return (
    <Dropzone
      accept={ACCEPT}
      maxFiles={1}
      onDrop={(files) => files[0] && onPick({ file: files[0] })}
      onError={(error) => onError?.(error.message)}
      className={cn("min-h-[140px] rounded-xl border-dashed border-rule-strong bg-surface p-7 shadow-none hover:border-data/50 hover:bg-surface", className)}
    >
      <span className="flex flex-col items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-full bg-tray text-data">
          <UploadSimple aria-hidden="true" size={17} weight="light" />
        </span>
        <span className="text-sm font-medium text-ink">Drop a file or click to upload</span>
      </span>
    </Dropzone>
  );
}
