import type { DeltaReport, DeltaRow } from "@/lib/types";

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

/** Discrepancies first; everything else keeps its given order. */
export function sortRows(rows: DeltaRow[]): DeltaRow[] {
  return [...rows].sort(
    (a, b) =>
      Number(b.status === "discrepancy") - Number(a.status === "discrepancy"),
  );
}

/**
 * The contract has no explicit "no filing found" flag. Until it does, a report
 * without a single filed claim is treated as "no filing on file".
 */
export function hasFiling(report: DeltaReport): boolean {
  return report.rows.some((row) => row.filed !== null);
}
