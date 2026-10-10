import { cn } from "./cn";
import { formatDate } from "./report-utils";

/** Compact header: company name, then domain and date checked on one quiet line. */
export function ReportHeader({
  company,
  checkedAt,
  size = "panel",
}: {
  company: { name: string; domain?: string };
  checkedAt?: string;
  size?: "panel" | "page";
}) {
  const meta = [
    company.domain,
    checkedAt && `checked ${formatDate(checkedAt)}`,
  ].filter(Boolean);

  return (
    <header>
      <h1
        className={cn(
          "font-serif tracking-[-0.02em] text-ink",
          size === "page" ? "text-[36px] leading-10" : "text-[26px] leading-[30px]",
        )}
      >
        {company.name}
      </h1>
      {meta.length > 0 && (
        <p className="mt-1 truncate text-xs leading-4 text-graphite">
          {meta.join(" · ")}
        </p>
      )}
    </header>
  );
}
