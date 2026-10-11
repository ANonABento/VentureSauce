"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import type { Check, CompanyView } from "@/lib/api";
import { DUR, EASE_ENTER, SPRING, STAGGER } from "@/lib/motion";
import { formatDate, formatUsd } from "./report-utils";

/*
 * Pulse (decisions 50–52): how a company's own figures moved across the items
 * you filed. The x axis is when each item is dated; the line steps through the
 * most-contradicted metric's values, one diamond per item that stated it.
 * Every point is a real claim and names its item.
 */

export type PulsePoint = { value: number; day: string; item: string };
export type PulseSeries = { metric: string; unit: string | null; points: PulsePoint[] };

const metricName = (check: Check) =>
  check.metric
    ? check.metric.length <= 4
      ? check.metric.toUpperCase()
      : check.metric[0].toUpperCase() + check.metric.slice(1)
    : check.claim_type === "headcount"
      ? "Headcount"
      : "Total raised";

export const formatMetric = (value: number, unit: string | null) =>
  unit === "usd" ? formatUsd(value) : unit === "percent" ? `${value.toLocaleString("en-US")}%` : value.toLocaleString("en-US");

/** The contradiction with the widest relative spread, as a dated series. Null when the items agree. */
export function pulseSeries(view: CompanyView | null): PulseSeries | null {
  const contradictions = (view?.checks ?? []).filter((c) => c.source === "your_sources" && (c.values?.length ?? 0) > 1);
  const spread = (c: Check) => {
    const nums = c.values!.map((v) => v.value);
    const hi = Math.max(...nums.map(Math.abs)) || 1;
    return (Math.max(...nums) - Math.min(...nums)) / hi;
  };
  const top = [...contradictions].sort((a, b) => spread(b) - spread(a))[0];
  if (!top) return null;
  return {
    metric: metricName(top),
    unit: top.unit,
    points: top.values!
      .map((v) => ({ value: v.value, day: v.item_day, item: v.item_label }))
      .sort((a, b) => a.day.localeCompare(b.day)),
  };
}

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

/** x by date (evenly spaced when every item shares a day), y by value. */
function scale(points: PulsePoint[], width: number, height: number, padX: number, padY: number) {
  const times = points.map((p) => Date.parse(p.day));
  const t0 = Math.min(...times);
  const t1 = Math.max(...times);
  const values = points.map((p) => p.value);
  const v0 = Math.min(...values);
  const v1 = Math.max(...values);
  return points.map((p, i) => ({
    ...p,
    x: padX + (t1 === t0 ? (points.length === 1 ? 0.5 : i / (points.length - 1)) : (times[i] - t0) / (t1 - t0)) * (width - padX * 2),
    y: padY + (v1 === v0 ? 0.5 : 1 - (p.value - v0) / (v1 - v0)) * (height - padY * 2),
  }));
}

/** A stepped path: hold each value until the next item, then step to its value. */
function stepPath(pts: { x: number; y: number }[]) {
  return pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `H${p.x}V${p.y}`)).join("");
}

const PLOT_H = 112;

/** The company screen's hero plot. */
export function PulsePlot({ series }: { series: PulseSeries }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const pts = width ? scale(series.points, width, PLOT_H, 22, 26) : [];
  const label = series.points.map((p) => `${p.item}, ${formatDate(p.day)}: ${formatMetric(p.value, series.unit)}`).join("; ");

  return (
    <div ref={ref} role="img" aria-label={`${series.metric} across your items. ${label}`} className="relative w-full" style={{ height: PLOT_H + 22 }}>
      {width > 0 && (
        <>
          <svg aria-hidden="true" width={width} height={PLOT_H} className="absolute top-0 left-0 overflow-visible">
            <line x1={0} x2={width} y1={PLOT_H - 0.5} y2={PLOT_H - 0.5} className="stroke-rule-strong" strokeWidth={1} />
            <motion.path
              d={stepPath(pts)}
              fill="none"
              className="stroke-ink"
              strokeWidth={1.25}
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: DUR.signature, ease: EASE_ENTER, delay: 0.1 }}
            />
            {pts.map((p, i) => (
              // The group pops in; the diamond's own rotate stays on the rect, so motion's transform doesn't replace it.
              <motion.g
                key={i}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
                transition={{ ...SPRING, delay: 0.25 + i * STAGGER * 3 }}
              >
                <rect
                  x={p.x - 4}
                  y={p.y - 4}
                  width={8}
                  height={8}
                  transform={`rotate(45 ${p.x} ${p.y})`}
                  className="fill-tray stroke-signal"
                  strokeWidth={1.5}
                />
              </motion.g>
            ))}
          </svg>
          {pts.map((p, i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              className="absolute -translate-x-1/2 font-serif text-base leading-5 whitespace-nowrap text-ink"
              style={{ left: Math.min(Math.max(p.x, 18), width - 18), top: p.y - 26 }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.base, ease: EASE_ENTER, delay: 0.35 + i * STAGGER * 3 }}
            >
              {formatMetric(p.value, series.unit)}
            </motion.span>
          ))}
          {pts.map((p, i) => (
            <span
              key={`d${i}`}
              aria-hidden="true"
              className="absolute -translate-x-1/2 font-mono text-[10px] leading-4 whitespace-nowrap text-graphite"
              style={{ left: Math.min(Math.max(p.x, 22), width - 22), top: PLOT_H + 4 }}
            >
              {formatDate(p.day)}
            </span>
          ))}
        </>
      )}
    </div>
  );
}

/** The plot in miniature for the Deals list: a 64×20 stepped line, or a flat dotted line when the items agree. */
export function PulseSpark({ series }: { series: PulseSeries | null }) {
  const W = 64;
  const H = 20;
  if (!series) {
    return <span aria-hidden="true" className="dot-line block h-[3px] w-16 text-rule-strong" />;
  }
  const pts = scale(series.points, W, H, 3, 3);
  return (
    <svg aria-hidden="true" width={W} height={H} className="block overflow-visible">
      <motion.path
        d={stepPath(pts)}
        fill="none"
        className="stroke-graphite"
        strokeWidth={1}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: DUR.reveal, ease: EASE_ENTER, delay: 0.15 }}
      />
      {pts.map((p, i) => (
        <rect key={i} x={p.x - 2} y={p.y - 2} width={4} height={4} transform={`rotate(45 ${p.x} ${p.y})`} className="fill-surface stroke-signal" strokeWidth={1} />
      ))}
    </svg>
  );
}
