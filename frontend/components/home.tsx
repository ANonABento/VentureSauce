"use client";

import { useState } from "react";
import { CaretRight, ChatCircleDots, DownloadSimple, FileText, Headphones, Stack } from "@phosphor-icons/react/dist/ssr";
import { motion } from "motion/react";
import type { CompanySummary } from "@/lib/api";
import { DUR, EASE_ENTER, RISE, SPRING, STAGGER } from "@/lib/motion";
import { sauceUrl } from "@/lib/sauce";
import { Button } from "./button";
import { cn } from "./cn";
import { CountUp } from "./motion";
import { Meter, SignalStrip } from "./viz";

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
      <div className="min-w-0">
        {/* Rendered on the server too, in its clock; the client's local time replaces it. */}
        <h1 suppressHydrationWarning className="font-serif text-[34px] leading-10 tracking-[-0.025em] text-ink">
          {greeting(now)}
        </h1>
        <p suppressHydrationWarning className="mt-1 text-[13px] leading-4 text-graphite">
          {now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
        </p>
      </div>
      {onDeals && (
        <Button variant="quiet" onClick={onDeals} className="mt-1 h-10 px-4 text-sm">
          <Stack aria-hidden="true" size={17} weight="light" className="mr-2" />
          Deals
        </Button>
      )}
    </div>
  );
}

/** The figure style (decision 63): a big serif number, then the glyph and one small word. Cobalt when it flags something. */
export function FigureTile({
  glyph,
  value,
  caption,
  flag = false,
  index,
  onClick,
  label,
}: {
  glyph: "dot" | "diamond" | "items" | "question";
  value: number;
  caption: string;
  /** Counts that flag something turn cobalt when above zero. */
  flag?: boolean;
  index: number;
  onClick?: () => void;
  /** Accessible description, since the caption is a single word. */
  label?: string;
}) {
  const Tag = onClick ? motion.button : motion.div;
  return (
    <Tag
      {...(onClick ? { type: "button" as const, onClick, "aria-haspopup": "dialog" as const } : {})}
      aria-label={label ? `${value} ${label}` : undefined}
      className={cn(
        "fragment flex aspect-square flex-col items-start justify-between px-3.5 pt-3 pb-3 text-left",
        onClick && "transition-transform duration-150 ease-out hover:-translate-y-0.5",
      )}
      initial={{ opacity: 0, y: RISE }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.reveal, ease: EASE_ENTER, delay: 0.05 + index * STAGGER }}
    >
      <CountUp
        value={value}
        delay={0.1 + index * STAGGER}
        // Geist Mono for data (decision 66): it echoes the ASCII art; the serif stays the voice (names, titles).
        className={cn("font-mono text-[40px] leading-none font-medium tracking-[-0.04em]", flag && value > 0 ? "text-signal" : "text-ink")}
      />
      <span aria-hidden={label ? true : undefined} className="mt-2 flex items-center gap-1.5 text-[11px] leading-4 text-graphite">
        {glyph === "question" ? (
          <ChatCircleDots aria-hidden="true" size={12} weight="duotone" className="text-data" />
        ) : (
          <span
            aria-hidden="true"
            className={cn(
              "block shrink-0",
              glyph === "dot" && "h-[6px] w-[6px] rounded-full bg-signal",
              glyph === "diamond" && "mx-px h-[5px] w-[5px] rotate-45 border-[1.25px] border-signal",
              glyph === "items" && "h-[6px] w-[6px] rounded-[1.5px] bg-data",
            )}
          />
        )}
        {caption}
      </span>
    </Tag>
  );
}

export function StatTiles({ companies }: { companies: CompanySummary[] }) {
  const sum = (pick: (c: CompanySummary) => number) => companies.reduce((acc, c) => acc + pick(c), 0);
  return (
    <div className="grid grid-cols-3 gap-2">
      <FigureTile glyph="dot" value={sum((c) => c.discrepancies)} caption="public" label="discrepancies with public records" flag index={0} />
      <FigureTile glyph="diamond" value={sum((c) => c.contradictions)} caption="yours" label="contradictions between your items" flag index={1} />
      <FigureTile glyph="items" value={sum((c) => c.item_count)} caption="items" label={`items filed across ${companies.length} companies`} index={2} />
    </div>
  );
}

/**
 * The report bar (decision 57): the wireframe's "Your weekly report is ready",
 * as one tap that downloads the digest Sauce Report. Day or week.
 */
export function ReportBar({ onListen }: { onListen?: () => void }) {
  const [period, setPeriod] = useState<"day" | "week">("day");
  return (
    <div className="fragment flex items-center gap-1 rounded-xl py-1.5 pr-1.5 pl-1.5">
      <a
        href={sauceUrl({ digest: period, print: true })}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-1.5 transition-colors duration-150 hover:bg-tray/60"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-tray text-data">
          <FileText aria-hidden="true" size={16} weight="light" />
        </span>
        <span className="min-w-0 flex-1 font-serif text-lg leading-6 text-ink">
          {period === "day" ? "Daily report" : "Weekly report"}
          <span className="sr-only"> (PDF, opens in a new tab)</span>
        </span>
        <DownloadSimple aria-hidden="true" size={18} weight="light" className="shrink-0 text-graphite transition-transform duration-150 ease-out group-hover:translate-y-0.5 group-hover:text-ink" />
      </a>
      {onListen && (
        <button
          type="button"
          onClick={onListen}
          aria-label="Listen to the briefing"
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-graphite transition-colors duration-150 hover:bg-tray hover:text-ink"
        >
          <Headphones aria-hidden="true" size={16} weight="light" />
        </button>
      )}
      <div role="group" aria-label="Report period" className="flex shrink-0 rounded-full bg-tray p-0.5 text-[11px] font-medium">
        {(["day", "week"] as const).map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={period === p}
            aria-label={p === "day" ? "Daily" : "Weekly"}
            onClick={() => setPeriod(p)}
            className={cn("relative h-6 rounded-full px-2.5 transition-colors duration-150", period === p ? "text-ink" : "text-graphite hover:text-ink")}
          >
            {period === p && <motion.span layoutId="report-period" className="fragment absolute inset-0 z-0" style={{ borderRadius: 9999 }} transition={SPRING} />}
            <span aria-hidden="true" className="relative z-10">{p === "day" ? "D" : "W"}</span>
          </button>
        ))}
      </div>
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
  className,
}: {
  className?: string;
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
    <section className={cn("fragment flex flex-col px-1.5 py-1.5", className)} aria-labelledby="deals-chart-title">
      <h2 id="deals-chart-title" className="sr-only">
        Deals by flags
      </h2>
      {/* Rows spread over whatever height the card is given. */}
      <ul className="flex flex-1 flex-col justify-around">
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
                className="group block w-full rounded-lg px-2.5 py-3 text-left transition-colors duration-150 ease-out hover:bg-tray/60"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <motion.span
                      layoutId={`company-name-${c.id}`}
                      className="truncate font-serif text-[23px] leading-7 tracking-[-0.01em] text-ink underline decoration-transparent underline-offset-4 group-hover:decoration-current"
                    >
                      {c.name}
                    </motion.span>
                    {unseen && <span aria-label="new items" className="h-1.5 w-1.5 shrink-0 rounded-full bg-data" />}
                  </span>
                  <motion.span layoutId={`company-strip-${c.id}`} className="flex shrink-0">
                    <SignalStrip
                      discrepancies={c.discrepancies}
                      contradictions={c.contradictions}
                      max={6}
                      delay={0.25 + index * STAGGER}
                      className="origin-right scale-125"
                    />
                  </motion.span>
                </span>
                <Meter
                  className="mt-2.5 h-2"
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
