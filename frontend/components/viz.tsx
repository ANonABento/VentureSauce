"use client";

import { type ReactNode, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
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

const TONE: Record<Tone, { color: string; opacity?: number }> = {
  signal: { color: "var(--signal)" },
  "signal-soft": { color: "var(--signal)", opacity: 0.4 },
  data: { color: "var(--data)" },
  steady: { color: "var(--steady)" },
  muted: { color: "var(--graphite)", opacity: 0.55 },
  track: { color: "var(--rule-strong)" },
};

/** One tile of the dither: two staggered rows of dots, 3px pitch, 7px tall (matches the CSS `dither` utility). */
function DotPattern({ id, tone }: { id: string; tone: Tone }) {
  const { color, opacity } = TONE[tone];
  const style = { fill: color, opacity };
  return (
    <pattern id={id} width={DOT} height={7} patternUnits="userSpaceOnUse">
      <circle cx={1.5} cy={2} r={0.8} style={style} />
      <circle cx={0} cy={5} r={0.8} style={style} />
      <circle cx={3} cy={5} r={0.8} style={style} />
    </pattern>
  );
}

export type Segment = { value: number; tone: Tone };

/** Segment rects in px, snapped to the dot grid, one dot column apart. */
function layoutSegments(segments: Segment[], sum: number, width: number) {
  const visible = segments.filter((s) => s.value > 0);
  const rects: { tone: Tone; x: number; width: number }[] = [];
  let cursor = 0;
  for (const [i, s] of visible.entries()) {
    const start = snap((cursor / (sum || 1)) * width);
    cursor += s.value;
    const end = snap((cursor / (sum || 1)) * width);
    const gap = i < visible.length - 1 ? DOT : 0;
    rects.push({ tone: s.tone, x: start, width: Math.max(DOT, end - start - gap) });
  }
  return rects;
}

/**
 * A dithered proportion bar split into segments. Boundaries snap to the dot
 * grid, segments are a dot column apart, and the fill sweeps in left to right
 * one column at a time. Decorative: pass the numbers as text alongside.
 */
export function DitherBar({
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
  const [ref, width] = useWidth<HTMLDivElement>();
  const reduce = useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const reveal = useMotionValue(0);
  const clip = useTransform(reveal, snap);
  const revealed = useRef(false);

  useEffect(() => {
    if (!width) return;
    if (reduce || revealed.current) {
      reveal.set(width);
      return;
    }
    revealed.current = true;
    const controls = animate(reveal, width, { duration: DUR.reveal, ease: EASE_ENTER, delay });
    return () => controls.stop();
  }, [width, reduce, delay, reveal]);

  const rects = layoutSegments(segments, total ?? segments.reduce((acc, s) => acc + s.value, 0), width);
  const tones = [...new Set(rects.map((r) => r.tone))];

  return (
    <div ref={ref} aria-hidden="true" className={cn("h-[7px] w-full", className)}>
      {width > 0 && (
        <svg width={width} height={7} className="block overflow-visible">
          <defs>
            <DotPattern id={`${uid}-track`} tone="track" />
            {tones.map((tone) => (
              <DotPattern key={tone} id={`${uid}-${tone}`} tone={tone} />
            ))}
            <clipPath id={`${uid}-clip`}>
              <motion.rect x={0} y={0} height={7} width={clip} />
            </clipPath>
          </defs>
          <rect width={width} height={7} fill={`url(#${uid}-track)`} />
          <g clipPath={`url(#${uid}-clip)`}>
            {rects.map((r, i) => (
              <rect key={i} x={r.x} width={r.width} height={7} fill={`url(#${uid}-${r.tone})`} />
            ))}
          </g>
        </svg>
      )}
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
 * highest is dithered in brick; each dot names its source. Labels that would
 * collide flip above the line.
 */
export function RangePlot({
  values,
  format,
  delay = 0,
}: {
  values: RangeValue[];
  format: (n: number) => string;
  delay?: number;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const sorted = [...values].sort((a, b) => a.value - b.value);
  const lo = sorted[0]?.value ?? 0;
  const hi = sorted[sorted.length - 1]?.value ?? 0;
  const inner = Math.max(0, width - PAD * 2);
  const at = (v: number) => PAD + (hi === lo ? inner / 2 : ((v - lo) / (hi - lo)) * inner);

  const placed = placeLabels(sorted.map((v) => ({ ...v, x: at(v.value) })));
  const anyAbove = placed.some((p) => !p.below);
  const lineY = anyAbove ? 46 : 8;
  const bandStart = snap(at(lo));
  const bandWidth = Math.max(DOT, snap(at(hi) - at(lo)));

  return (
    <div
      ref={ref}
      role="img"
      aria-label={sorted.map((v) => `${v.label}: ${format(v.value)}`).join("; ")}
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
          <svg aria-hidden="true" width={width} height={7} className="absolute block" style={{ top: lineY - 3, left: 0 }}>
            <defs>
              <DotPattern id={`${uid}-band`} tone="signal" />
            </defs>
            <motion.rect
              x={bandStart}
              height={7}
              fill={`url(#${uid}-band)`}
              initial={{ width: 0 }}
              animate={{ width: bandWidth }}
              transition={{ duration: DUR.signature, ease: EASE_ENTER, delay: delay + 0.15 }}
            />
          </svg>
          {placed.map((p, i) => {
            const edge = i === 0 ? "start" : i === placed.length - 1 ? "end" : "middle";
            const left = Math.min(Math.max(p.x - LABEL_W / 2, 0), width - LABEL_W);
            return (
              <div key={i} aria-hidden="true">
                <motion.span
                  className="absolute h-[9px] w-[9px] rounded-full bg-ink ring-2 ring-surface"
                  style={{ left: p.x - 4.5, top: lineY - 4 }}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...SPRING, delay: delay + 0.2 + i * STAGGER * 2 }}
                />
                <motion.span
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
                  <span className="font-serif text-xl leading-6 tracking-[-0.02em] text-ink">{format(p.value)}</span>
                  <span className="max-w-full truncate text-[11px] leading-4 text-graphite">{p.label}</span>
                </motion.span>
              </div>
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
          "font-serif text-[28px] leading-8 tracking-[-0.02em]",
          tone === "signal" ? "text-signal" : tone === "data" ? "text-data" : "text-ink",
        )}
      >
        {value}
      </span>
      <span className="text-[11px] leading-4 text-graphite">{caption}</span>
    </span>
  );
}
