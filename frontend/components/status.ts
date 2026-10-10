import type { DeltaStatus } from "@/lib/types";

// The row's 2px mark is the one place status is encoded visually; the label
// is for the summary line and for screen readers. Signal is discrepancies only.
export const STATUS: Record<DeltaStatus, { label: string; mark: string }> = {
  discrepancy: { label: "discrepancy", mark: "bg-signal" },
  consistent: { label: "consistent", mark: "bg-graphite" },
  not_disclosed: { label: "not disclosed", mark: "bg-graphite/40" },
  unverified: { label: "unverified", mark: "bg-graphite/40" },
};
