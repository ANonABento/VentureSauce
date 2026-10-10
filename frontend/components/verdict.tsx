import type { DeltaRow } from "@/lib/types";
import { cn } from "./cn";
import { STATUS, STATUS_ORDER } from "./status";

/** The glance layer: how many discrepancies, and the share of rows by status. */
export function Verdict({
  rows,
  size = "panel",
}: {
  rows: DeltaRow[];
  size?: "panel" | "page";
}) {
  const counts = STATUS_ORDER.map((status) => ({
    status,
    count: rows.filter((row) => row.status === status).length,
  })).filter(({ count }) => count > 0);
  const discrepancies = rows.filter((row) => row.status === "discrepancy").length;

  return (
    <div>
      <p className="flex items-baseline gap-2">
        <span
          className={cn(
            "font-serif leading-none font-medium tracking-tight",
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

      {/* Decorative: the legend below carries the same numbers as text. */}
      <div aria-hidden="true" className="mt-3 flex h-1 gap-0.5">
        {counts.map(({ status, count }) => (
          <span
            key={status}
            className={STATUS[status].fill}
            style={{ flexGrow: count, flexBasis: 0 }}
          />
        ))}
      </div>

      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] leading-4 text-graphite">
        {counts.map(({ status, count }) => (
          <li key={status} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={cn("h-1.5 w-1.5", STATUS[status].fill)}
            />
            <span>
              <span className="font-mono">{count}</span>{" "}
              {status === "discrepancy" && count !== 1
                ? "discrepancies"
                : STATUS[status].label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
