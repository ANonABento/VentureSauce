"use client";

import { CaretRight, Stack } from "@phosphor-icons/react/dist/ssr";
import { motion } from "motion/react";
import type { CompanySummary } from "@/lib/api";
import { DUR, EASE_ENTER, RISE, STAGGER } from "@/lib/motion";
import { Button } from "./button";
import { cn } from "./cn";
import { CountUp } from "./motion";
import { DitherBar, SignalStrip } from "./viz";

/*
 * The home screen's parts (decisions 42–47, 51), following the teammate's
 * wireframe: greeting → three stat tiles → brief → deals chart → drop zone.
 */

const flags = (c: CompanySummary) => c.discrepancies + c.contradictions;

/** Deals ranked by flags, then by most recent activity. */
export const rankDeals = (companies: CompanySummary[]) =>
  [...companies].sort((a, b) => flags(b) - flags(a) || (b.updated_at ?? "").localeCompare(a.updated_at ?? ""));

function greeting(now: Date) {
  const h = now.getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

/** Time-of-day greeting (no sign-in, so no name) with the date, and the Deals button. */
export function Greeting({ onDeals }: { onDeals?: () => void }) {
  const now = new Date();
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        {/* Rendered on the server too, in its clock; the client's local time replaces it. */}
        <h1 suppressHydrationWarning className="font-serif text-[26px] leading-8 tracking-[-0.02em] text-ink">
          {greeting(now)}
        </h1>
        <p suppressHydrationWarning className="mt-0.5 text-xs leading-4 text-graphite">
          {now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
        </p>
      </div>
      {onDeals && (
        <Button size="sm" variant="quiet" onClick={onDeals}>
          <Stack aria-hidden="true" size={14} weight="light" className="mr-1.5" />
          Deals
        </Button>
      )}
    </div>
  );
}

/** A glyph, a counted-up figure and a one-word caption. The tiles define ● and ◇ for the whole app. */
function Tile({
  glyph,
  value,
  caption,
  sub,
  tone,
  index,
}: {
  glyph: "dot" | "diamond" | "items";
  value: number;
  caption: string;
  sub?: string;
  tone: "signal" | "data";
  index: number;
}) {
  return (
    <motion.div
      className="fragment flex flex-col px-3 py-3"
      initial={{ opacity: 0, y: RISE }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.reveal, ease: EASE_ENTER, delay: 0.05 + index * STAGGER }}
    >
      <span
        aria-hidden="true"
        className={cn(
          "block shrink-0",
          glyph === "dot" && "h-[7px] w-[7px] rounded-full bg-signal",
          glyph === "diamond" && "mx-px h-[6px] w-[6px] rotate-45 border-[1.25px] border-signal",
          glyph === "items" && "h-[7px] w-[7px] rounded-[2px] bg-data",
        )}
      />
      <CountUp
        value={value}
        delay={0.1 + index * STAGGER}
        className={cn("mt-2 font-serif text-[30px] leading-8 tracking-[-0.02em]", tone === "signal" && value > 0 ? "text-signal" : "text-ink")}
      />
      <span className="mt-0.5 text-[11px] leading-4 text-graphite">{caption}</span>
      {sub && <span className="text-[11px] leading-4 text-graphite/70">{sub}</span>}
    </motion.div>
  );
}

export function StatTiles({ companies }: { companies: CompanySummary[] }) {
  const sum = (pick: (c: CompanySummary) => number) => companies.reduce((acc, c) => acc + pick(c), 0);
  return (
    <div className="grid grid-cols-3 gap-2">
      <Tile glyph="dot" value={sum((c) => c.discrepancies)} caption="vs public records" tone="signal" index={0} />
      <Tile glyph="diamond" value={sum((c) => c.contradictions)} caption="between your items" tone="signal" index={1} />
      <Tile
        glyph="items"
        value={sum((c) => c.item_count)}
        caption="items filed"
        sub={`${companies.length} ${companies.length === 1 ? "company" : "companies"}`}
        tone="data"
        index={2}
      />
    </div>
  );
}

const TOP = 4;

/** The chart card (decision 43): the top deals by flags, each a name, a dithered bar and its glyphs. */
export function DealsChart({
  companies,
  seen,
  onOpen,
  onAll,
}: {
  companies: CompanySummary[];
  seen: Record<string, string>;
  onOpen: (company: CompanySummary) => void;
  onAll: () => void;
}) {
  const ranked = rankDeals(companies);
  const top = ranked.slice(0, TOP);
  const scale = Math.max(1, ...top.map(flags));
  const more = ranked.length - top.length;

  return (
    <section className="fragment px-1.5 py-1.5" aria-labelledby="deals-chart-title">
      <h2 id="deals-chart-title" className="sr-only">
        Deals by flags
      </h2>
      <ul>
        {top.map((c, index) => {
          const unseen = c.last_item_at && (!seen[c.id] || seen[c.id] < c.last_item_at);
          return (
            <motion.li
              key={c.id}
              initial={{ opacity: 0, y: RISE / 2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.reveal, ease: EASE_ENTER, delay: 0.15 + index * STAGGER }}
            >
              <button
                type="button"
                onClick={() => onOpen(c)}
                className="group block w-full rounded-lg px-2.5 py-2.5 text-left transition-colors duration-150 ease-out hover:bg-tray/60"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <motion.span
                      layoutId={`company-name-${c.id}`}
                      className="truncate font-serif text-base leading-[19px] text-ink underline decoration-transparent underline-offset-4 group-hover:decoration-current"
                    >
                      {c.name}
                    </motion.span>
                    {unseen && <span aria-label="new items" className="h-1.5 w-1.5 shrink-0 rounded-full bg-data" />}
                  </span>
                  <motion.span layoutId={`company-strip-${c.id}`} className="flex shrink-0">
                    <SignalStrip discrepancies={c.discrepancies} contradictions={c.contradictions} max={6} delay={0.25 + index * STAGGER} />
                  </motion.span>
                </span>
                <DitherBar
                  className="mt-2"
                  delay={0.2 + index * STAGGER}
                  total={scale}
                  segments={[
                    { value: c.discrepancies, tone: "signal" },
                    { value: c.contradictions, tone: "signal-soft" },
                  ]}
                />
              </button>
            </motion.li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={onAll}
        className="group flex w-full items-center justify-end gap-1 rounded-lg px-2.5 pt-1 pb-1.5 text-xs font-medium text-graphite transition-colors duration-150 hover:text-ink"
      >
        {more > 0 ? `${more} more` : "All deals"}
        <CaretRight aria-hidden="true" size={12} weight="light" className="transition-transform duration-150 group-hover:translate-x-0.5" />
      </button>
    </section>
  );
}
