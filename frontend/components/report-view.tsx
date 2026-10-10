import type { DeltaReport } from "@/lib/types";
import { DeltaRows } from "./delta-rows";
import { EmptyState } from "./empty-state";
import { ReportHeader } from "./report-header";
import { hasFiling } from "./report-utils";
import { Verdict } from "./verdict";

/**
 * A whole report: header, verdict, rows, details. The same view serves the
 * side panel and, a size up, the report page.
 */
export function ReportView({
  report,
  size = "panel",
}: {
  report: DeltaReport;
  size?: "panel" | "page";
}) {
  const filed = hasFiling(report);

  return (
    <>
      <ReportHeader
        size={size}
        company={report.company}
        checkedAt={report.generatedAt}
      />

      {filed ? (
        <>
          <div className="mt-5">
            <Verdict size={size} rows={report.rows} />
          </div>
          <div className="mt-6">
            <DeltaRows size={size} rows={report.rows} />
          </div>
        </>
      ) : (
        <>
          <div className="mt-5">
            <EmptyState partial={report.rows.length > 0} />
          </div>
          {/* No dead end: show what the press and LinkedIn checks did find. */}
          {report.rows.length > 0 && (
            <div className="mt-6">
              <DeltaRows size={size} rows={report.rows} />
            </div>
          )}
        </>
      )}

      <footer className="mt-8 space-y-1 text-[11px] leading-4 text-graphite">
        {report.company.cik && (
          <p>
            SEC CIK <span className="font-mono">{report.company.cik}</span>
          </p>
        )}
        <p>
          Discrepancies are differences between sources, with possible
          explanations. They are not findings of wrongdoing.
        </p>
      </footer>
    </>
  );
}
