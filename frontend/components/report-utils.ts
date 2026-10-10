import type { DeltaReport } from "@/lib/types";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  // Fixed zone so server and client render the same day.
  timeZone: "UTC",
});

/** "2026-10-10" or a full ISO timestamp → "Oct 10". */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : dateFormat.format(date);
}

/** 38_000_000 → "$38M", 1_250_000 → "$1.3M", 250_000 → "$250K". */
export function formatUsd(amount: number): string {
  const units: [number, string][] = [
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"],
  ];
  for (const [size, suffix] of units) {
    if (Math.abs(amount) >= size) {
      return `$${Number((amount / size).toFixed(1))}${suffix}`;
    }
  }
  return `$${amount}`;
}

/**
 * The contract has no explicit "no filing found" flag. Until it does, a report
 * without a single filed claim is treated as "no filing on file".
 */
export function hasFiling(report: DeltaReport): boolean {
  return report.rows.some((row) => row.filed !== null);
}
