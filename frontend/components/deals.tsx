"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { type CompanySummary, getCompany } from "@/lib/api";
import { DUR, EASE_ENTER, RISE, SPRING, STAGGER } from "@/lib/motion";
import { cn } from "./cn";
import { rankDeals } from "./home";
import { KindIcons } from "./inbox";
import { type PulseSeries, PulseSpark, pulseSeries } from "./pulse";
import { formatDate } from "./report-utils";
import { SignalStrip } from "./viz";

type Sort = "flags" | "recent";

/**
 * Deals (decision 51): every company, each with a miniature pulse, its glyphs
 * and when it last changed. Sorted by flags or by recent activity.
 */
export function DealsScreen({
  companies,
  seen,
  onBack,
  onOpen,
}: {
  companies: CompanySummary[];
  seen: Record<string, string>;
  onBack: () => void;
  onOpen: (company: CompanySummary) => void;
}) {
  const [sort, setSort] = useState<Sort>("flags");
  const [pulses, setPulses] = useState<Record<string, PulseSeries | null>>({});

  // The sparklines need each company's items; fetched once per list, a few small requests.
  useEffect(() => {
    let live = true;
    for (const c of companies) {
      getCompany(c.id)
        .then((view) => live && setPulses((prev) => ({ ...prev, [c.id]: pulseSeries(view) })))
        .catch(() => {});
    }
    return () => {
      live = false;
    };
  }, [companies]);

  const list =
    sort === "flags"
      ? rankDeals(companies)
      : [...companies].sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""));

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="group mb-3 inline-flex min-h-6 items-center gap-1 text-[13px] text-graphite transition-colors duration-150 hover:text-ink"
      >
        <ArrowLeft aria-hidden="true" size={14} weight="light" className="transition-transform duration-150 ease-out group-hover:-translate-x-0.5" />
        Home
      </button>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-[26px] leading-8 tracking-[-0.02em] text-ink">
          Deals <span className="text-data">{companies.length}</span>
        </h1>
        <div role="group" aria-label="Sort" className="flex rounded-full bg-tray p-0.5 text-xs font-medium">
          {(["flags", "recent"] as const).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={sort === key}
              onClick={() => setSort(key)}
              className={cn("relative h-7 rounded-full px-3 transition-colors duration-150", sort === key ? "text-ink" : "text-graphite hover:text-ink")}
            >
              {sort === key && (
                <motion.span layoutId="deals-sort" className="fragment absolute inset-0 z-0" style={{ borderRadius: 9999 }} transition={SPRING} />
              )}
              <span className="relative z-10">{key === "flags" ? "Flags" : "Recent"}</span>
            </button>
          ))}
        </div>
      </div>

      <motion.ul layout className="mt-5 space-y-2">
        {list.map((c, index) => {
          const unseen = c.last_item_at && (!seen[c.id] || seen[c.id] < c.last_item_at);
          return (
            <motion.li
              key={c.id}
              layout="position"
              className="fragment"
              initial={{ opacity: 0, y: RISE }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.reveal, ease: EASE_ENTER, delay: index * STAGGER, layout: SPRING }}
            >
              <button
                type="button"
                onClick={() => onOpen(c)}
                className="group grid w-full grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 rounded-lg px-3.5 py-3 text-left transition-colors duration-150 hover:bg-paper"
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <motion.span
                    layoutId={`company-name-${c.id}`}
                    className="truncate font-serif text-lg leading-[21px] text-ink underline decoration-transparent underline-offset-4 group-hover:decoration-current"
                  >
                    {c.name}
                  </motion.span>
                  {unseen && <span aria-label="new items" className="h-1.5 w-1.5 shrink-0 rounded-full bg-data" />}
                </span>
                <PulseSpark series={pulses[c.id] ?? null} />
                <motion.span layoutId={`company-strip-${c.id}`} className="flex">
                  <SignalStrip discrepancies={c.discrepancies} contradictions={c.contradictions} max={8} delay={0.15 + index * STAGGER} />
                </motion.span>
                <span className="flex items-center justify-end gap-2 text-[11px] leading-4 text-graphite">
                  <KindIcons kinds={c.item_kinds} />
                  {formatDate(c.updated_at)}
                </span>
              </button>
            </motion.li>
          );
        })}
      </motion.ul>
    </>
  );
}
