import type { DeltaReport } from "@/lib/types";
import { cn } from "./cn";
import { formatDate } from "./report-utils";

/**
 * Company name, identifiers and the one-sentence headline.
 * `size="panel"` for the 380px side panel, `size="page"` for the report page.
 */
export function ReportHeader({
  company,
  checkedAt,
  headline,
  size = "panel",
}: {
  company: DeltaReport["company"];
  checkedAt?: string;
  headline?: string;
  size?: "panel" | "page";
}) {
  const page = size === "page";

  return (
    <header>
      <h1
        className={cn(
          "font-serif font-medium tracking-tight text-ink",
          page
            ? "text-[40px] leading-[44px] sm:text-5xl sm:leading-[52px]"
            : "text-2xl leading-7",
        )}
      >
        {company.name}
      </h1>

      <p
        className={cn(
          "font-mono text-xs leading-5 text-graphite",
          page ? "mt-3" : "mt-2",
        )}
      >
        <span>{company.domain}</span>
        {company.cik && (
          <>
            <span aria-hidden="true"> · </span>
            <span className="whitespace-nowrap">CIK {company.cik}</span>
          </>
        )}
        {checkedAt && (
          // Own line in the panel so the row never wraps mid-separator.
          <span className={cn("block", page && "sm:inline")}>
            {page && (
              <span aria-hidden="true" className="hidden sm:inline">
                {" · "}
              </span>
            )}
            checked {formatDate(checkedAt)}
          </span>
        )}
      </p>

      {headline && (
        <p
          className={cn(
            "text-ink",
            page
              ? "mt-8 max-w-[32em] font-serif text-[22px] leading-8"
              : "mt-4 text-[15px] leading-[22px]",
          )}
        >
          {headline}
        </p>
      )}
    </header>
  );
}
