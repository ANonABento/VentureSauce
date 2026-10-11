"use client";

import type { DeltaRow, DeltaStatus } from "@/lib/types";
import { cn } from "./cn";
import { CountUp } from "./motion";
import { STATUS } from "./status";
import { Meter, type Tone } from "./viz";

const ORDER: DeltaStatus[] = ["discrepancy", "consistent", "not_disclosed", "unverified"];

const TONE: Record<DeltaStatus, Tone> = {
  discrepancy: "signal",
  consistent: "data",
  not_disclosed: "muted",
  unverified: "muted",
};

const KEY: Record<DeltaStatus, string> = {
  discrepancy: "bg-signal",
  consistent: "bg-data",
  not_disclosed: "bg-graphite/55",
  unverified: "bg-graphite/55",
};

/**
 * The glance layer and the screen's one hero tray (decision 31): the count
 * counts up, then one dithered bar split by status replaces the legend text.
 */
export function Verdict({
  rows,
  size = "panel",
}: {
  rows: DeltaRow[];
  size?: "panel" | "page";
}) {
  const count = (status: DeltaStatus) => rows.filter((row) => row.status === status).length;
  const discrepancies = count("discrepancy");
  const present = ORDER.filter((status) => count(status) > 0);

  return (
    <div className="tray">
      <p className="flex items-end gap-3">
        <CountUp
          value={discrepancies}
          className={cn(
            "font-serif leading-none tracking-[-0.03em]",
            size === "page" ? "text-[80px]" : "text-[64px]",
            discrepancies > 0 ? "text-signal" : "text-ink",
          )}
        />
        <span className="flex flex-col pb-1">
          <span className="text-sm leading-5 font-medium text-ink">
            {discrepancies === 1 ? "discrepancy" : "discrepancies"}
          </span>
          <span className="text-xs leading-4 text-graphite">
            of {rows.length} {rows.length === 1 ? "signal" : "signals"}
          </span>
        </span>
      </p>
      <Meter
        className="mt-3"
        delay={0.15}
        segments={present.map((status) => ({ value: count(status), tone: TONE[status] }))}
      />
      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] leading-4 text-graphite">
        {present.map((status) => (
          <li key={status} className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", KEY[status])} />
            <span className="font-medium text-ink">{count(status)}</span>{" "}
            {status === "discrepancy" && count(status) !== 1 ? "discrepancies" : STATUS[status].label}
          </li>
        ))}
      </ul>
    </div>
  );
}
