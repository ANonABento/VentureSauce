import type { CSSProperties } from "react";
import type { DeltaRow, DeltaStatus } from "@/lib/types";
import { cn } from "./cn";
import { STATUS } from "./status";

const OTHER: DeltaStatus[] = ["consistent", "not_disclosed", "unverified"];

/**
 * The glance layer, and the screen's one hero tray: how many discrepancies,
 * out of how many signals, with a dithered bar showing the share.
 */
export function Verdict({
  rows,
  size = "panel",
}: {
  rows: DeltaRow[];
  size?: "panel" | "page";
}) {
  const count = (status: DeltaStatus) =>
    rows.filter((row) => row.status === status).length;
  const discrepancies = count("discrepancy");
  const rest = OTHER.filter((status) => count(status) > 0);
  const share = rows.length ? Math.round((discrepancies / rows.length) * 100) : 0;

  return (
    <div className="tray">
      <p className="flex items-center gap-3">
        <span
          className={cn(
            "font-serif leading-none tracking-[-0.03em]",
            size === "page" ? "text-[64px]" : "text-[48px]",
            discrepancies > 0 ? "text-signal" : "text-ink",
          )}
        >
          {discrepancies}
        </span>
        <span className="flex flex-col">
          <span className="text-sm leading-5 font-medium text-ink">
            {discrepancies === 1 ? "discrepancy" : "discrepancies"} found
          </span>
          <span className="text-xs leading-4 text-graphite">
            of {rows.length} {rows.length === 1 ? "signal" : "signals"} checked
          </span>
        </span>
      </p>
      {/* Decorative: the legend below carries the same numbers as text. */}
      <div
        aria-hidden="true"
        className="dither mt-3"
        style={{ "--dither-on": "var(--signal)", "--dither-fill": `${share}%` } as CSSProperties}
      />
      <p className="mt-2 text-xs leading-4 text-graphite">
        <span className="font-medium text-signal">{discrepancies}</span>{" "}
        {discrepancies === 1 ? "discrepancy" : "discrepancies"}
        {rest.map((status) => (
          <span key={status}>
            {" · "}
            <span className="font-medium text-ink">{count(status)}</span> {STATUS[status].label}
          </span>
        ))}
      </p>
    </div>
  );
}
