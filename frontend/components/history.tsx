"use client";

import { useState } from "react";
import { motion } from "motion/react";
import type { CompanySummary } from "@/lib/api";
import { DUR, EASE_ENTER, STAGGER } from "@/lib/motion";
import { formatDate } from "./report-utils";

const SHOWN = 4;

/**
 * The inbox's history: every company something was dropped for, newest first,
 * kept small so the drop card stays the main thing on the page. The figure on
 * the right is how many differences were found.
 */
export function History({
  companies,
  seen,
  onOpen,
}: {
  companies: CompanySummary[];
  seen: Record<string, string>;
  onOpen: (company: CompanySummary) => void;
}) {
  const [all, setAll] = useState(false);
  if (!companies.length) return null;
  const shown = all ? companies : companies.slice(0, SHOWN);

  return (
    <section className="mt-6">
      <h2 className="micro-label text-graphite">History</h2>
      <ul className="mt-1">
        {shown.map((company, index) => {
          const flags = company.discrepancies + company.contradictions;
          const unseen =
            company.last_item_at && (!seen[company.id] || seen[company.id] < company.last_item_at);
          return (
            <motion.li
              key={company.id}
              className="border-b border-rule last:border-b-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: DUR.reveal, ease: EASE_ENTER, delay: 0.2 + index * STAGGER }}
            >
              <button
                type="button"
                onClick={() => onOpen(company)}
                className="group flex min-h-11 w-full items-center justify-between gap-3 py-1.5 text-left"
              >
                <span className="flex min-w-0 items-baseline gap-2">
                  <motion.span
                    layoutId={`company-name-${company.id}`}
                    className="truncate text-[13px] leading-5 text-ink underline decoration-transparent underline-offset-4 transition-colors duration-150 ease-out group-hover:decoration-current"
                  >
                    {company.name}
                  </motion.span>
                  {unseen && (
                    <span aria-label="new items" className="h-1.5 w-1.5 shrink-0 self-center rounded-full bg-data" />
                  )}
                  <span className="shrink-0 text-[11px] leading-4 text-graphite">
                    {formatDate(company.updated_at)}
                  </span>
                </span>
                <span
                  className={
                    flags > 0
                      ? "shrink-0 font-serif text-[22px] leading-7 tracking-[-0.02em] text-signal"
                      : "shrink-0 font-serif text-[22px] leading-7 tracking-[-0.02em] text-rule-strong"
                  }
                >
                  {flags}
                  <span className="sr-only"> {flags === 1 ? "difference" : "differences"} found</span>
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>
      {companies.length > SHOWN && !all && (
        <button
          type="button"
          onClick={() => setAll(true)}
          className="mt-1 text-xs leading-5 text-data underline decoration-data/30 underline-offset-2 transition-colors duration-150 ease-out hover:decoration-data"
        >
          Show all {companies.length}
        </button>
      )}
    </section>
  );
}
