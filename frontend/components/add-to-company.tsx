"use client";

import { type ReactNode, type Ref, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Sparkle } from "@phosphor-icons/react/dist/ssr";
import type { CompanySummary } from "@/lib/api";
import { DUR, EASE_ENTER, SPRING } from "@/lib/motion";
import { Button } from "./button";
import { cn } from "./cn";
import { SignalStrip } from "./viz";

export type FilingChoice = { companyId?: string; newCompany?: string };

const DETECT = "__detect";
const NEW = "__new";

/**
 * "Add to company" (decision 48): after a drop, choose where the item is filed.
 * Detecting from the document is preselected, so Submit alone keeps the
 * one-step flow. A bottom sheet over the panel; Escape or Cancel discards.
 */
export function AddToCompany({
  label,
  companies,
  onCancel,
  onSubmit,
}: {
  /** The item's name (file name or "Founder email"); null closes the sheet. */
  label: string | null;
  companies: CompanySummary[];
  onCancel: () => void;
  onSubmit: (choice: FilingChoice) => void;
}) {
  return (
    <AnimatePresence>
      {label && <Sheet key={label} label={label} companies={companies} onCancel={onCancel} onSubmit={onSubmit} />}
    </AnimatePresence>
  );
}

function Sheet({
  label,
  companies,
  onCancel,
  onSubmit,
}: {
  label: string;
  companies: CompanySummary[];
  onCancel: () => void;
  onSubmit: (choice: FilingChoice) => void;
}) {
  const [choice, setChoice] = useState(DETECT);
  const [name, setName] = useState("");
  const first = useRef<HTMLInputElement>(null);

  // Focus the first option on open and give focus back to whatever opened the sheet on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    first.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [onCancel]);

  const ranked = [...companies].sort((a, b) => b.discrepancies + b.contradictions - (a.discrepancies + a.contradictions));
  const ready = choice !== NEW || name.trim().length > 0;

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center">
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-ink/25"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: DUR.base }}
        onClick={onCancel}
      />
      <motion.form
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-to-company-title"
        className="relative w-full max-w-[420px] rounded-t-2xl bg-paper px-4 pt-3 pb-5 shadow-[0_-8px_32px_-8px_rgb(31_43_48/0.18)]"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%", transition: { duration: 0.2, ease: EASE_ENTER } }}
        transition={SPRING}
        onSubmit={(event) => {
          event.preventDefault();
          if (!ready) return;
          onSubmit(choice === DETECT ? {} : choice === NEW ? { newCompany: name.trim() } : { companyId: choice });
        }}
      >
        <span aria-hidden="true" className="mx-auto mb-3 block h-1 w-9 rounded-full bg-rule-strong" />
        <p className="truncate font-mono text-[11px] leading-4 text-graphite">{label}</p>
        <h2 id="add-to-company-title" className="mt-0.5 font-serif text-xl leading-6 text-ink">
          Add to company
        </h2>

        <fieldset className="fragment mt-3 max-h-[46vh] divide-y divide-rule overflow-y-auto">
          <legend className="sr-only">Company</legend>
          <Option
            inputRef={first}
            checked={choice === DETECT}
            onChange={() => setChoice(DETECT)}
            icon={<Sparkle aria-hidden="true" size={16} weight="duotone" className="text-data" />}
          >
            <span className="text-sm font-medium text-ink">Detect from the document</span>
          </Option>
          {ranked.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.base, ease: EASE_ENTER, delay: 0.08 + i * 0.03 }}
            >
              <Option checked={choice === c.id} onChange={() => setChoice(c.id)}>
                <span className="min-w-0 flex-1 truncate font-serif text-base leading-5 text-ink">{c.name}</span>
                <SignalStrip discrepancies={c.discrepancies} contradictions={c.contradictions} max={6} />
              </Option>
            </motion.div>
          ))}
          <Option
            checked={choice === NEW}
            onChange={() => setChoice(NEW)}
            icon={<Plus aria-hidden="true" size={16} weight="light" className="text-graphite" />}
          >
            {choice === NEW ? (
              <input
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Company name"
                aria-label="New company name"
                className="h-7 min-w-0 flex-1 rounded-full border border-rule-strong bg-surface px-3 text-sm text-ink placeholder:text-graphite"
              />
            ) : (
              <span className="text-sm text-ink">New company</span>
            )}
          </Option>
        </fieldset>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="quiet" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!ready}>
            Submit
          </Button>
        </div>
      </motion.form>
    </div>
  );
}

function Option({
  checked,
  onChange,
  icon,
  inputRef,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  icon?: ReactNode;
  inputRef?: Ref<HTMLInputElement>;
  children: ReactNode;
}) {
  return (
    <label
      className={cn(
        // The radio itself is visually hidden, so the row shows its keyboard focus.
        "flex min-h-11 cursor-pointer items-center gap-3 px-3 py-2 transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-data",
        checked ? "bg-tray/60" : "hover:bg-tray/40",
      )}
    >
      <input ref={inputRef} type="radio" name="company" checked={checked} onChange={onChange} className="sr-only" />
      {/* The radio's visible mark: a ring that fills data blue when chosen. */}
      <span
        aria-hidden="true"
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-150",
          checked ? "border-data" : "border-rule-strong",
        )}
      >
        {checked && <motion.span layoutId="radio-dot" className="h-2 w-2 rounded-full bg-data" transition={SPRING} />}
      </span>
      {icon}
      <span className="flex min-w-0 flex-1 items-center gap-3">{children}</span>
    </label>
  );
}
