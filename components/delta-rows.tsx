import type { DeltaRow as DeltaRowData } from "@/lib/types";
import { cn } from "./cn";
import { type DeltaLayout, REPORT_GRID } from "./delta-layout";
import { DeltaRow } from "./delta-row";
import { sortRows } from "./report-utils";

const COLUMNS = ["Signal", "Filed", "Said", "Delta"];

/** The delta rows of a report: discrepancies first, and open by default. */
export function DeltaRows({
  rows,
  layout = "panel",
}: {
  rows: DeltaRowData[];
  layout?: DeltaLayout;
}) {
  const items = sortRows(rows).map((row) => (
    <DeltaRow
      key={row.signal}
      row={row}
      layout={layout}
      defaultExpanded={row.status === "discrepancy"}
    />
  ));

  if (layout === "panel") {
    return <ul className="border-t border-rule">{items}</ul>;
  }

  return (
    <div
      role="table"
      aria-label="Filed versus said"
      className="border-t border-rule"
    >
      <div
        role="row"
        className={cn("hidden border-b border-rule py-2", REPORT_GRID)}
      >
        {COLUMNS.map((column) => (
          <span
            key={column}
            role="columnheader"
            className="micro-label text-graphite"
          >
            {column}
          </span>
        ))}
      </div>
      {items}
    </div>
  );
}
