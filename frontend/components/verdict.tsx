import type { DeltaRow, DeltaStatus } from "@/lib/types";
import { cn } from "./cn";
import { STATUS } from "./status";

const OTHER: DeltaStatus[] = ["consistent", "not_disclosed", "unverified"];

/** The glance layer: how many discrepancies, out of how many signals. */
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

  return (
    <div>
      <p className="flex items-baseline gap-2">
        <span
          className={cn(
            "font-serif leading-none font-medium tracking-tight lining-nums",
            size === "page" ? "text-[56px]" : "text-[44px]",
            discrepancies > 0 ? "text-signal" : "text-ink",
          )}
        >
          {discrepancies}
        </span>
        <span className="text-[13px] leading-5 text-ink">
          {discrepancies === 1 ? "discrepancy" : "discrepancies"} found
        </span>
      </p>
      <p className="mt-2 text-xs leading-4 text-graphite">
        of <span className="font-mono">{rows.length}</span>{" "}
        {rows.length === 1 ? "signal" : "signals"} checked
        {rest.map((status) => (
          <span key={status}>
            {" · "}
            <span className="font-mono">{count(status)}</span>{" "}
            {STATUS[status].label}
          </span>
        ))}
      </p>
    </div>
  );
}
