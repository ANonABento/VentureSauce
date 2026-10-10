import type { DeltaStatus } from "@/lib/types";

/** Display order: discrepancies first. */
export const STATUS_ORDER: DeltaStatus[] = [
  "discrepancy",
  "consistent",
  "not_disclosed",
  "unverified",
];

// Status is always a text label next to the color, never color alone.
export const STATUS: Record<
  DeltaStatus,
  { label: string; group: string; text: string; fill: string }
> = {
  discrepancy: {
    label: "discrepancy",
    group: "Discrepancies",
    text: "text-signal",
    fill: "bg-signal",
  },
  consistent: {
    label: "consistent",
    group: "Consistent",
    text: "text-steady",
    fill: "bg-steady",
  },
  not_disclosed: {
    label: "not disclosed",
    group: "Not disclosed",
    text: "text-graphite",
    fill: "bg-graphite/40",
  },
  unverified: {
    label: "unverified",
    group: "Unverified",
    text: "text-graphite",
    fill: "bg-graphite/40",
  },
};
