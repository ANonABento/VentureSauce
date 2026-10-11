"use client";

import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { DOT, DUR, EASE_ENTER } from "@/lib/motion";
import { cn } from "./cn";

/*
 * The brief as a dithered waveform (decision 39). It is DECORATIVE: the shape
 * is derived from the script's text, not from the audio signal, so it carries
 * no data. It is always aria-hidden; the player's button carries the label and
 * the numbers live in text beside it.
 */

export type BriefTurn = { speaker: string | null; text: string };

const SPEAKER: Record<string, string> = { S: "Sam", R: "Riley" };

/** The brief's turns ("S: …" / "R: …" lines from the backend); a script without speakers is one turn. */
export function briefTurns(script: string): BriefTurn[] {
  const parsed = [...script.matchAll(/^([SR]):\s*(.+)$/gm)].map((m) => ({ speaker: SPEAKER[m[1]], text: m[2].trim() }));
  return parsed.length ? parsed : [{ speaker: null, text: script.trim() }];
}

/**
 * Where each turn starts and ends, as fractions (0–1) of the brief. Timing is
 * estimated from text length (the voice reads at an even pace), the same model
 * the live transcript uses to light the current turn.
 */
export function turnSpans(turns: BriefTurn[]): { start: number; end: number }[] {
  const total = turns.reduce((acc, t) => acc + t.text.length, 0) || 1;
  let cursor = 0;
  return turns.map((t) => {
    const start = cursor / total;
    cursor += t.text.length;
    return { start, end: cursor / total };
  });
}

/** "Zentrix Robotics" → "ZR". */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

/** Where each company first comes up in the brief (its name appears in a turn), as a fraction 0–1. */
export function companyMarks(turns: BriefTurn[], companies: string[]): { name: string; at: number }[] {
  const spans = turnSpans(turns);
  return companies
    .map((name) => {
      const i = turns.findIndex((t) => t.text.toLowerCase().includes(name.toLowerCase()));
      return i < 0 ? null : { name, at: spans[i].start };
    })
    .filter((m): m is { name: string; at: number } => m !== null)
    .sort((a, b) => a.at - b.at);
}

/** Tiny deterministic hash of a string, 0–1, so the same script always draws the same shape. */
function jitter(text: string): number {
  let h = 7;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) % 9973;
  return (h % 100) / 99;
}

/**
 * Column heights in dots (odd numbers, 1…rows). Each column covers a slice of
 * the script: denser text (letters, and especially digits, where the claims
 * are) draws taller; a column that crosses into a new turn drops to one dot,
 * a breath between speakers. Turns that open a company's segment are louder.
 */
function columnHeights(turns: BriefTurn[], companies: string[], cols: number, rows: number): number[] {
  const spans = turnSpans(turns);
  const text = turns.map((t) => t.text).join("");
  const loud = turns.map((t) => companies.some((name) => t.text.toLowerCase().includes(name.toLowerCase())));
  const half = (rows - 1) / 2;
  return Array.from({ length: cols }, (_, c) => {
    const from = c / cols;
    const to = (c + 1) / cols;
    if (spans.some((s, i) => i > 0 && s.start >= from && s.start < to)) return 1;
    const turn = Math.max(0, spans.findIndex((s) => from < s.end));
    const slice = text.slice(Math.floor(from * text.length), Math.ceil(to * text.length)) || " ";
    const letters = slice.replace(/[^\p{L}\p{N}]/gu, "").length / slice.length;
    const digits = /\p{N}/u.test(slice) ? 0.25 : 0;
    const shape = Math.min(1, letters * (0.55 + 0.45 * jitter(slice)) + digits);
    const amp = loud[turn] ? 1 : 0.62;
    return 1 + 2 * Math.round(half * amp * shape);
  });
}

/** One SVG path of dots for every column, so the fill can be a single clipped copy. */
function dotsPath(heights: number[], mid: number): string {
  const r = 0.8;
  let d = "";
  heights.forEach((h, c) => {
    const x = c * DOT + DOT / 2;
    for (let k = -(h - 1) / 2; k <= (h - 1) / 2; k++) {
      const y = mid + k * DOT;
      d += `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
    }
  });
  return d;
}

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

const MARK_W = 18;

/**
 * A dithered waveform of the brief: one column of dots per slice of the script,
 * filling in (one dot column at a time) as the audio plays. With `marks`, the
 * initials of each company sit under the point where it comes up.
 */
export function Waveform({
  script,
  companies,
  progress,
  rows = 9,
  marks = false,
  tone = "tray",
  className,
}: {
  script: string;
  /** Company names, to find (and stress) the turns that open each company's segment. */
  companies: string[];
  /** 0–100. */
  progress: number;
  /** Tallest column, in dots. Odd. */
  rows?: number;
  marks?: boolean;
  /** "tray": data blue on a light surface. "ink": paper on the ink pill. */
  tone?: "tray" | "ink";
  className?: string;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const turns = useMemo(() => briefTurns(script), [script]);
  const cols = Math.max(1, Math.floor(width / DOT));
  const height = rows * DOT;
  const path = useMemo(
    () => (width ? dotsPath(columnHeights(turns, companies, cols, rows), height / 2) : ""),
    [turns, companies, cols, rows, height, width],
  );
  const played = Math.round((Math.min(100, Math.max(0, progress)) / 100) * cols) * DOT;
  const placed = useMemo(() => {
    if (!marks || !width) return [];
    let last = -Infinity;
    return companyMarks(turns, companies).map((m) => {
      const x = Math.min(Math.max(m.at * cols * DOT, last + MARK_W, MARK_W / 2), cols * DOT - MARK_W / 2);
      last = x;
      return { ...m, x };
    });
  }, [marks, width, turns, companies, cols]);
  const clip = `wave-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div ref={ref} aria-hidden="true" className={cn("min-w-0", className)}>
      {width > 0 && (
        <motion.svg
          width={cols * DOT}
          height={height}
          className="block origin-center"
          initial={{ opacity: 0, scaleY: 0.3 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: DUR.reveal, ease: EASE_ENTER }}
        >
          <defs>
            <clipPath id={clip}>
              <rect x={0} y={0} width={played} height={height} />
            </clipPath>
          </defs>
          <path d={path} className={tone === "ink" ? "fill-paper/35" : "fill-rule-strong"} />
          <path d={path} clipPath={`url(#${clip})`} className={tone === "ink" ? "fill-paper" : "fill-data"} />
        </motion.svg>
      )}
      {placed.length > 0 && (
        <div className="relative mt-1 h-3.5">
          {placed.map((m) => (
            <span
              key={m.name}
              className={cn(
                "absolute top-0 w-[18px] -translate-x-1/2 text-center font-serif text-[11px] leading-[14px] transition-colors duration-300",
                played >= m.x ? "text-data" : "text-graphite",
              )}
              style={{ left: m.x }}
            >
              {initials(m.name)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
