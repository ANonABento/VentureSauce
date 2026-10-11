"use client";

import { type ReactNode, useState } from "react";
import { motion } from "motion/react";
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
 * "Add to company" (decisions 48, 61), the wireframe's second screen: the
 * item's name, where to file it, Cancel and Submit. Detecting from the
 * document is preselected, so Submit alone keeps the one-step flow.
 */
export function AddToCompanyScreen({
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
  const ranked = [...companies].sort((a, b) => b.discrepancies + b.contradictions - (a.discrepancies + a.contradictions));
  const ready = choice !== NEW || name.trim().length > 0;

  return (
    <form
      className="flex min-h-[calc(100dvh-180px)] flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        if (!ready) return;
        onSubmit(choice === DETECT ? {} : choice === NEW ? { newCompany: name.trim() } : { companyId: choice });
      }}
    >
      <p className="truncate font-mono text-xs leading-4 text-graphite">{label}</p>
      <h1 className="mt-1 font-serif text-[26px] leading-8 tracking-[-0.02em] text-ink">Add to company</h1>

      <fieldset className="mt-5 space-y-2">
        <legend className="sr-only">Company</legend>
        <Option checked={choice === DETECT} onChange={() => setChoice(DETECT)} index={0}>
          <Sparkle aria-hidden="true" size={16} weight="duotone" className="text-data" />
          <span className="text-sm font-medium text-ink">Detect from the document</span>
        </Option>
        {ranked.map((c, i) => (
          <Option key={c.id} checked={choice === c.id} onChange={() => setChoice(c.id)} index={i + 1}>
            <span className="min-w-0 flex-1 truncate font-serif text-base leading-5 text-ink">{c.name}</span>
            <SignalStrip discrepancies={c.discrepancies} contradictions={c.contradictions} max={6} />
          </Option>
        ))}
        <Option checked={choice === NEW} onChange={() => setChoice(NEW)} index={ranked.length + 1}>
          <Plus aria-hidden="true" size={16} weight="light" className="text-graphite" />
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

      <div className="mt-auto flex justify-end gap-2 pt-8">
        <Button variant="quiet" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!ready}>
          Submit
        </Button>
      </div>
    </form>
  );
}

function Option({
  checked,
  onChange,
  index,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  index: number;
  children: ReactNode;
}) {
  return (
    <motion.label
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.base, ease: EASE_ENTER, delay: 0.04 + index * 0.03 }}
      className={cn(
        // The radio itself is visually hidden, so the row shows its keyboard focus.
        "fragment flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2 outline-offset-2 transition-shadow duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-data",
        checked && "ring-1 ring-data/50",
      )}
    >
      <input type="radio" name="company" checked={checked} onChange={onChange} className="sr-only" />
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
      <span className="flex min-w-0 flex-1 items-center gap-3">{children}</span>
    </motion.label>
  );
}
