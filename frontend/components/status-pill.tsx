import type { DeltaStatus } from "@/lib/types";
import { cn } from "./cn";
import { STATUS } from "./status";

const GLYPH: Record<DeltaStatus, string> = {
  discrepancy: "M2.5 2.5l5 5M7.5 2.5l-5 5", // ✕
  consistent: "M2 5.5l2 2 4-4.5", // ✓
  not_disclosed: "M2.5 5h5", // –
  unverified: "M3.6 3.9a1.5 1.5 0 1 1 2.2 1.3c-.5.3-.8.6-.8 1.1M5 8v.2", // ?
};

/** Glyph plus word, fully rounded. */
export function StatusPill({ status }: { status: DeltaStatus }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2 text-xs leading-4 font-medium whitespace-nowrap",
        STATUS[status].pill,
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 10 10"
        className="h-2.5 w-2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={GLYPH[status]} />
      </svg>
      {STATUS[status].name}
    </span>
  );
}
