"use client";

import { useId, useState } from "react";
import type { Claim, DeltaRow as DeltaRowData, DeltaStatus } from "@/lib/types";
import { cn } from "./cn";
import { Collapse } from "./collapse";
import { type DeltaLayout, REPORT_GRID } from "./delta-layout";
import { SourceLink } from "./source-link";

// Status is a 2px margin mark plus a text label — never color alone.
const STATUS: Record<DeltaStatus, { label: string; text: string; mark: string }> = {
  discrepancy: { label: "Discrepancy", text: "text-signal", mark: "bg-signal" },
  consistent: { label: "Consistent", text: "text-steady", mark: "bg-steady" },
  not_disclosed: { label: "Not disclosed", text: "text-graphite", mark: "bg-rule" },
  unverified: { label: "Unverified", text: "text-graphite", mark: "bg-rule" },
};

export function DeltaRow({
  row,
  layout = "panel",
  defaultExpanded = false,
}: {
  row: DeltaRowData;
  layout?: DeltaLayout;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const id = useId();
  const table = layout === "report";
  const status = STATUS[row.status];
  const Row = table ? "div" : "li";

  return (
    <Row
      role={table ? "row" : undefined}
      className={cn("relative border-b border-rule py-4", table && REPORT_GRID)}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-4 bottom-4 -left-3 w-0.5",
          table && "md:-left-4",
          status.mark,
        )}
      />

      <div role={table ? "rowheader" : undefined}>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={`${id}-filed ${id}-said ${id}-reasons`}
          onClick={() => setExpanded((value) => !value)}
          className="group block w-full text-left"
        >
          <span className={cn("micro-label block", status.text)}>
            {status.label}
          </span>
          <span
            className={cn(
              "mt-1 flex items-baseline justify-between gap-3",
              table ? "text-[15px] leading-[22px]" : "text-sm leading-5",
            )}
          >
            <span className="font-medium text-ink underline decoration-transparent underline-offset-4 transition-colors duration-150 ease-out group-hover:decoration-ink">
              {row.signal}
            </span>
            <span aria-hidden="true" className="font-mono text-graphite">
              {expanded ? "−" : "+"}
            </span>
          </span>
        </button>
      </div>

      <ClaimCell
        id={`${id}-filed`}
        label="Filed"
        claim={row.filed}
        emptyText="Not in the filing"
        expanded={expanded}
        table={table}
      />
      <ClaimCell
        id={`${id}-said`}
        label="Said"
        claim={row.said}
        emptyText="Not stated publicly"
        expanded={expanded}
        table={table}
        last
      />

      <div
        role={table ? "cell" : undefined}
        className={cn("pt-1", table && "md:pt-5")}
      >
        <p
          className={cn(
            "text-ink",
            table ? "text-[15px] leading-[22px]" : "text-sm leading-5",
          )}
        >
          {row.summary}
        </p>
        {row.likelyReasons.length > 0 && (
          <Collapse id={`${id}-reasons`} open={expanded}>
            <p className="micro-label pt-3 text-graphite">Likely reasons</p>
            <ul
              className={cn(
                "mt-1 space-y-1 text-graphite",
                table ? "text-sm leading-5" : "text-[13px] leading-5",
              )}
            >
              {row.likelyReasons.map((reason) => (
                <li key={reason} className="flex gap-2">
                  <span aria-hidden="true">–</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </Collapse>
        )}
      </div>
    </Row>
  );
}

/** One side of the comparison: the value, then its source once expanded. */
function ClaimCell({
  id,
  label,
  claim,
  emptyText,
  expanded,
  table,
  last = false,
}: {
  id: string;
  label: string;
  claim: Claim | null;
  emptyText: string;
  expanded: boolean;
  table: boolean;
  last?: boolean;
}) {
  return (
    <Collapse
      id={id}
      open={expanded}
      // In the table the value is always visible; only the source collapses.
      className={cn(table && "md:visible md:grid-rows-[1fr]")}
    >
      <div
        role={table ? "cell" : undefined}
        className={cn(
          "grid grid-cols-[44px_1fr] gap-x-2 pt-3",
          // Sets the conclusion apart from the comparison when stacked.
          last && "pb-2",
          table && "md:block md:pt-5 md:pb-0",
        )}
      >
        <span
          className={cn(
            "micro-label pt-0.5 text-graphite",
            table && "md:hidden",
          )}
        >
          {label}
        </span>
        <div>
          <p
            className={cn(
              "font-mono",
              table ? "text-sm leading-[22px]" : "text-[13px] leading-5",
              claim ? "text-ink" : "text-graphite",
            )}
          >
            {claim ? claim.value : emptyText}
          </p>
          {claim && (
            <Collapse open={expanded}>
              <div className="pt-1">
                <SourceLink source={claim.source} />
              </div>
            </Collapse>
          )}
        </div>
      </div>
    </Collapse>
  );
}
