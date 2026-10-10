import type { DeltaRow as DeltaRowData } from "@/lib/types";
import { DeltaRow } from "./delta-row";

/**
 * Discrepancies first, one hairline, then the rest in the order given.
 * Order and each row's mark come from `row.status` alone.
 */
export function DeltaRows({
  rows,
  size = "panel",
}: {
  rows: DeltaRowData[];
  size?: "panel" | "page";
}) {
  const discrepancies = rows.filter((row) => row.status === "discrepancy");
  const rest = rows.filter((row) => row.status !== "discrepancy");

  return (
    <ul>
      {[...discrepancies, ...rest].map((row, index) => (
        <DeltaRow
          key={row.signal}
          row={row}
          size={size}
          divided={index === discrepancies.length && index > 0}
        />
      ))}
    </ul>
  );
}
