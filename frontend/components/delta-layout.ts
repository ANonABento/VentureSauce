/**
 * "panel": always stacked (side panel).
 * "report": stacked on small screens, a four-column table row from `md` up.
 */
export type DeltaLayout = "panel" | "report";

/** Column grid shared by the table's header row and every data row. */
export const REPORT_GRID =
  "md:grid md:grid-cols-[1.1fr_1.3fr_1.3fr_1.4fr] md:gap-x-6";
