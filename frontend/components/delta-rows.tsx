import type { DeltaRow as DeltaRowData } from "@/lib/types";
import { cn } from "./cn";
import { DeltaRow } from "./delta-row";
import { STATUS, STATUS_ORDER } from "./status";

/** Rows grouped under a status heading, discrepancies first. */
export function DeltaRows({
  rows,
  size = "panel",
}: {
  rows: DeltaRowData[];
  size?: "panel" | "page";
}) {
  return (
    <div className="space-y-6">
      {STATUS_ORDER.map((status) => {
        const group = rows.filter((row) => row.status === status);
        if (group.length === 0) return null;
        return (
          <section key={status}>
            <h2
              className={cn(
                "micro-label border-b border-rule pb-2",
                STATUS[status].text,
              )}
            >
              {STATUS[status].group}
            </h2>
            <ul>
              {group.map((row) => (
                <DeltaRow key={row.signal} row={row} size={size} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
