import type { DeltaRow as DeltaRowData } from "@/lib/types";
import { DeltaRow } from "./delta-row";

/**
 * The signals as cards in a mist tray: discrepancies first, then the rest in
 * the order given. Order and each card's status come from `row.status` alone.
 */
export function DeltaRows({
  rows,
  size = "panel",
}: {
  rows: DeltaRowData[];
  size?: "panel" | "page";
}) {
  const ordered = [
    ...rows.filter((row) => row.status === "discrepancy"),
    ...rows.filter((row) => row.status !== "discrepancy"),
  ];

  return (
    <ul className="space-y-2 rounded-xl bg-tray p-2">
      {ordered.map((row, index) => (
        <DeltaRow key={row.signal} row={row} size={size} index={index} />
      ))}
    </ul>
  );
}
