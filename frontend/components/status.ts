import type { DeltaStatus } from "@/lib/types";

/** Display order: discrepancies first. */
export const STATUS_ORDER: DeltaStatus[] = [
  "discrepancy",
  "consistent",
  "not_disclosed",
  "unverified",
];

// Status is always a word next to the color, never color alone. The signal
// color belongs to discrepancies only.
export const STATUS: Record<
  DeltaStatus,
  { label: string; name: string; mark: string; pill: string; dot: string }
> = {
  discrepancy: {
    label: "discrepancy",
    name: "Discrepancy",
    mark: "bg-signal",
    pill: "bg-signal-wash text-signal",
    dot: "var(--signal)",
  },
  consistent: {
    label: "consistent",
    name: "Consistent",
    mark: "bg-steady",
    pill: "bg-steady-wash text-steady",
    dot: "var(--steady)",
  },
  not_disclosed: {
    label: "not disclosed",
    name: "Not disclosed",
    mark: "bg-border-strong",
    pill: "bg-tray text-graphite",
    dot: "var(--border-strong)",
  },
  unverified: {
    label: "unverified",
    name: "Unverified",
    mark: "bg-border-strong",
    pill: "border border-dashed border-border-strong text-graphite",
    dot: "var(--border-strong)",
  },
};
