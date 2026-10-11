"use client";

import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { DOT, DUR, EASE_ENTER, EASE_STATE, SPRING, STAGGER } from "@/lib/motion";
import { cn } from "./cn";

/*
 * The panel's visual vocabulary (references.md, decisions 25–36): dithered
 * bars, signal strips, range plots and the source flow. Each one replaces a
 * block of sentences, carries its meaning in an accessible label, and animates
 * once when it arrives.
 */

/** Width of an element, kept current on resize. 0 until mounted. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

const snap = (px: number) => Math.round(px / DOT) * DOT;

export type Tone = "signal" | "signal-soft" | "data" | "steady" | "muted" | "track";


export type Segment = { value: number; tone: Tone };

const TONE_BG: Record<Tone, string> = {
  signal: "bg-signal",
  "signal-soft": "bg-signal/45",
  data: "bg-data",
  steady: "bg-data",
  muted: "bg-graphite/45",
  track: "bg-tray-strong",
};

/**
 * A proportion bar in the shadcn Progress style (decision 58): a rounded track
 * and solid rounded segments, 2px apart, swept in from the left once.
 * Decorative: pass the numbers as text alongside.
 */
export function Meter({
  segments,
  total,
  delay = 0,
  className,
}: {
  segments: Segment[];
  /** What a full bar means. Defaults to the sum of the segments. */
  total?: number;
  delay?: number;
  className?: string;
}) {
  const sum = total ?? segments.reduce((acc, s) => acc + s.value, 0);
  const visible = segments.filter((s) => s.value > 0);
  return (
    <div aria-hidden="true" className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-tray-strong", className)}>
      <motion.div
        className="absolute inset-0 flex gap-[2px]"
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={{ clipPath: "inset(0 0% 0 0)" }}
        transition={{ duration: DUR.reveal, ease: EASE_ENTER, delay }}
      >
        {visible.map((s, i) => (
          <span
            key={i}
            className={cn("h-full rounded-full", TONE_BG[s.tone])}
            style={{ width: `${(s.value / (sum || 1)) * 100}%` }}
          />
        ))}
      </motion.div>
    </div>
  );
}

/**
 * One glyph per flag: a brick dot per discrepancy with public records, a
 * hollow brick diamond per contradiction between the user's own items, and
 * (once the backend sends verdict counts) a hollow ring per check that held.
 */
export function SignalStrip({
  discrepancies,
  contradictions,
  consistent = 0,
  max = 10,
  delay = 0,
  className,
}: {
  discrepancies: number;
  contradictions: number;
  consistent?: number;
  max?: number;
  delay?: number;
  className?: string;
}) {
  const glyphs: ("dot" | "diamond" | "ring")[] = [
    ...Array<"dot">(discrepancies).fill("dot"),
    ...Array<"diamond">(contradictions).fill("diamond"),
    ...Array<"ring">(consistent).fill("ring"),
  ];
  const shown = glyphs.slice(0, max);
  const more = glyphs.length - shown.length;
  const label = [
    `${discrepancies} ${discrepancies === 1 ? "discrepancy" : "discrepancies"}`,
    contradictions > 0 && `${contradictions} ${contradictions === 1 ? "contradiction" : "contradictions"} between your items`,
    consistent > 0 && `${consistent} consistent`,
  ]
    .filter(Boolean)
    .join(", ");

  if (!glyphs.length) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-xs leading-4 text-graphite", className)}>
        <span aria-hidden="true" className="h-[7px] w-[7px] rounded-full border border-rule-strong" />
        Nothing flagged
      </span>
    );
  }

  return (
    <span role="img" aria-label={label} className={cn("inline-flex items-center gap-[5px]", className)}>
      {shown.map((glyph, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...SPRING, delay: delay + i * STAGGER }}
          className={cn(
            "block shrink-0",
            glyph === "dot" && "h-[7px] w-[7px] rounded-full bg-signal",
            glyph === "diamond" && "mx-px h-[6px] w-[6px] rotate-45 border-[1.25px] border-signal",
            glyph === "ring" && "h-[7px] w-[7px] rounded-full border border-graphite/50",
          )}
        />
      ))}
      {more > 0 && <span aria-hidden="true" className="ml-0.5 text-[11px] leading-4 text-graphite">+{more}</span>}
    </span>
  );
}

export type RangeValue = { value: number; label: string };

const LABEL_W = 76;
const PAD = 5;
/** Points closer than this share one marker label: theirs would collide whichever row they took. */
const MERGE_PX = LABEL_W / 2;

/** Points that share one label: equal values, or values that sit within MERGE_PX of the group's first point. */
type RangeGroup = { x: number; values: number[]; labels: string[] };

function groupPoints(points: (RangeValue & { x: number })[]): RangeGroup[] {
  const groups: { first: number; xs: number[]; values: number[]; labels: string[] }[] = [];
  for (const p of points) {
    const last = groups.at(-1);
    if (last && (p.value === last.values[0] || p.x - last.first < MERGE_PX)) {
      groups[groups.length - 1] = {
        ...last,
        xs: [...last.xs, p.x],
        values: [...last.values, p.value],
        labels: [...last.labels, p.label],
      };
    } else {
      groups.push({ first: p.x, xs: [p.x], values: [p.value], labels: [p.label] });
    }
  }
  return groups.map((g) => ({ x: (g.xs[0] + g.xs[g.xs.length - 1]) / 2, values: g.values, labels: g.labels }));
}

/** "$12M: Email, Slides, Notes; $15M: Deck, Call notes": every source, grouped by value. */
function describeRange(sorted: RangeValue[], format: (n: number) => string): string {
  const byValue = new Map<number, string[]>();
  for (const v of sorted) byValue.set(v.value, [...(byValue.get(v.value) ?? []), v.label]);
  return [...byValue].map(([value, labels]) => `${format(value)}: ${labels.join(", ")}`).join("; ");
}

/** Labels go below the line unless that row is crowded; each takes whichever row leaves it more room. */
function placeLabels<T extends { x: number }>(points: T[]) {
  let lastBelow = -Infinity;
  let lastAbove = -Infinity;
  return points.map((p) => {
    const roomBelow = p.x - lastBelow;
    const roomAbove = p.x - lastAbove;
    const below = roomBelow >= LABEL_W || roomBelow >= roomAbove;
    if (below) lastBelow = p.x;
    else lastAbove = p.x;
    return { ...p, below };
  });
}

/**
 * Every source's value on one number line. The spread between the lowest and
 * highest is shaded; each marker names its source. Sources that agree (or sit
 * too close to label apart) share one marker: one value and "Email +2", with
 * the full list in the tooltip and the accessible label. Labels that would
 * still collide flip above the line.
 */
export function RangePlot({
  values,
  format,
  delay = 0,
  figure = "serif",
}: {
  values: RangeValue[];
  format: (n: number) => string;
  delay?: number;
  /** The value labels' voice: serif (default) or Geist Mono, the "data" voice (decision 66). */
  figure?: "serif" | "mono";
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const sorted = [...values].sort((a, b) => a.value - b.value);
  const lo = sorted[0]?.value ?? 0;
  const hi = sorted[sorted.length - 1]?.value ?? 0;
  const inner = Math.max(0, width - PAD * 2);
  const at = (v: number) => PAD + (hi === lo ? inner / 2 : ((v - lo) / (hi - lo)) * inner);

  const placed = placeLabels(groupPoints(sorted.map((v) => ({ ...v, x: at(v.value) }))));
  const anyAbove = placed.some((p) => !p.below);
  const lineY = anyAbove ? 46 : 8;
  const bandStart = snap(at(lo));
  const bandWidth = Math.max(DOT, snap(at(hi) - at(lo)));
  // One dot per distinct value; a value several sources share gets a larger dot.
  const dots = [...new Set(sorted.map((v) => v.value))].map((value) => ({
    value,
    shared: sorted.filter((v) => v.value === value).length > 1,
  }));

  return (
    <div
      ref={ref}
      role="img"
      aria-label={describeRange(sorted, format)}
      className="relative w-full"
      style={{ height: lineY + 50 }}
    >
      {width > 0 && (
        <>
          <motion.div
            aria-hidden="true"
            className="absolute h-px origin-left bg-rule-strong"
            style={{ left: 0, width, top: lineY }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: DUR.base, ease: EASE_STATE, delay }}
          />
          {/* The spread: a solid rounded band in the Meter style, swept from the lowest value to the highest. */}
          <motion.span
            aria-hidden="true"
            className="absolute h-1.5 origin-left rounded-full bg-signal/45"
            style={{ left: bandStart, width: bandWidth, top: lineY - 3 }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: DUR.signature, ease: EASE_ENTER, delay: delay + 0.15 }}
          />
          {dots.map((dot, i) => {
            const size = dot.shared ? 13 : 9;
            return (
              <motion.span
                key={dot.value}
                aria-hidden="true"
                className="absolute rounded-full bg-ink ring-2 ring-surface"
                style={{ width: size, height: size, left: at(dot.value) - size / 2, top: lineY - size / 2 + 0.5 }}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...SPRING, delay: delay + 0.2 + i * STAGGER * 2 }}
              />
            );
          })}
          {placed.map((p, i) => {
            const edge = i === 0 ? "start" : i === placed.length - 1 ? "end" : "middle";
            const left = Math.min(Math.max(p.x - LABEL_W / 2, 0), width - LABEL_W);
            const low = Math.min(...p.values);
            const high = Math.max(...p.values);
            const more = p.labels.length - 1;
            return (
              <motion.span
                key={i}
                aria-hidden="true"
                title={p.labels.map((label, j) => `${label}: ${format(p.values[j])}`).join("\n")}
                className={cn(
                  "absolute flex flex-col",
                  edge === "start" && "items-start text-left",
                  edge === "end" && "items-end text-right",
                  edge === "middle" && "items-center text-center",
                )}
                style={{
                  width: LABEL_W,
                  left: edge === "start" ? Math.max(0, p.x - PAD) : edge === "end" ? Math.min(width, p.x + PAD) - LABEL_W : left,
                  top: p.below ? lineY + 10 : lineY - 44,
                }}
                initial={{ opacity: 0, y: p.below ? -4 : 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DUR.base, ease: EASE_ENTER, delay: delay + 0.3 + i * STAGGER * 2 }}
              >
                <span
                  className={cn(
                    "whitespace-nowrap text-ink",
                    figure === "mono"
                      ? "font-mono font-medium tracking-[-0.03em]"
                      : "font-serif tracking-[-0.02em]",
                    // A merged pair of near values prints as a range, a size down so it fits the label.
                    low === high ? (figure === "mono" ? "text-lg leading-6" : "text-xl leading-6") : "text-[13px] leading-6",
                  )}
                >
                  {low === high ? format(low) : `${format(low)}–${format(high)}`}
                </span>
                <span className="flex max-w-full items-baseline gap-1 text-[11px] leading-4 text-graphite">
                  {/* A shared marker names the first source by kind ("Email · 01_acme.eml" → "Email"); the tooltip has them all. */}
                  <span className="min-w-0 truncate">{more > 0 ? p.labels[0].split(" · ")[0] : p.labels[0]}</span>
                  {more > 0 && <span className="shrink-0 font-medium text-ink">+{more}</span>}
                </span>
              </motion.span>
            );
          })}
        </>
      )}
    </div>
  );
}

/**
 * The checks as a pipeline: one node per source on a dotted line. Done nodes
 * are data blue, the running one carries the amber dot (one of amber's four
 * uses), waiting ones are hollow. The line fills in as each check finishes.
 */
export function SourceFlow({
  steps,
  current,
  announce = true,
  className,
}: {
  steps: string[];
  /** Index of the step in progress; everything before it is done. steps.length = all done. */
  current: number;
  /** False when the parent already announces progress, so screen readers don't hear it twice. */
  announce?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const last = steps.length - 1;
  const pos = (i: number) => `calc(6px + (100% - 12px) * ${i / last})`;

  return (
    <div className={cn("relative h-[46px] w-full", className)}>
      {announce && (
        <p role="status" className="sr-only">
          {current > last ? "All checks done" : `${steps[current]}, step ${current + 1} of ${steps.length}`}
        </p>
      )}
      {steps.slice(0, -1).map((step, i) => (
        <span
          key={`line-${step}`}
          aria-hidden="true"
          className="absolute top-[4px] h-[3px]"
          style={{ left: `calc(${pos(i)} + 10px)`, width: `calc((100% - 12px) / ${last} - 20px)` }}
        >
          <span className="dot-line absolute inset-0 text-rule-strong" />
          <motion.span
            className="dot-line absolute inset-0 text-data"
            initial={false}
            animate={{ clipPath: i < current ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
            transition={{ duration: reduce ? 0 : DUR.base, ease: EASE_STATE }}
          />
        </span>
      ))}
      {steps.map((step, i) => {
        const done = i < current;
        const running = i === current;
        const edge = i === 0 ? "start" : i === last ? "end" : "middle";
        return (
          <span key={step} aria-hidden="true">
            <span
              className="absolute top-0 flex h-[11px] w-[11px] -translate-x-1/2 items-center justify-center"
              style={{ left: pos(i) }}
            >
              <motion.span
                className={cn(
                  "absolute inset-0 rounded-full border",
                  done ? "border-data bg-data" : running ? "border-accent bg-paper" : "border-rule-strong bg-paper",
                )}
                initial={false}
                animate={{ scale: done ? [1.25, 1] : 1 }}
                transition={SPRING}
              />
              {running && (
                <>
                  <span className="relative h-[5px] w-[5px] rounded-full bg-accent" />
                  <motion.span
                    className="absolute inset-0 rounded-full border border-accent motion-reduce:hidden"
                    animate={{ scale: [1, 1.9], opacity: [0.6, 0] }}
                    transition={{ duration: 1.2, ease: "easeOut", repeat: Infinity }}
                  />
                </>
              )}
            </span>
            <span
              className={cn(
                "absolute top-[19px] text-[11px] leading-4 whitespace-nowrap transition-colors duration-150",
                done || running ? "text-ink" : "text-graphite",
                running && "font-medium",
                edge === "start" && "left-0",
                edge === "end" && "right-0",
                edge === "middle" && "-translate-x-1/2",
              )}
              style={edge === "middle" ? { left: pos(i) } : undefined}
            >
              {step}
            </span>
          </span>
        );
      })}
    </div>
  );
}

/** A labelled figure: serif number over a two-word caption. */
export function Figure({ value, caption, tone = "ink" }: { value: ReactNode; caption: string; tone?: "ink" | "signal" | "data" }) {
  return (
    <span className="flex flex-col">
      <span
        className={cn(
          "font-serif text-[56px] leading-[56px] tracking-[-0.03em]",
          tone === "signal" ? "text-signal" : tone === "data" ? "text-data" : "text-ink",
        )}
      >
        {value}
      </span>
      <span className="mt-2 text-[11px] leading-4 text-graphite">{caption}</span>
    </span>
  );
}
