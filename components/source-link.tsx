import type { Source } from "@/lib/types";
import { formatDate } from "./report-utils";

/** A quiet citation: underlined label, opens in a new tab, with the date checked. */
export function SourceLink({ source }: { source: Source }) {
  return (
    <p className="flex flex-wrap gap-x-2 text-xs leading-5 text-graphite">
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-graphite/50 underline-offset-2 transition-colors duration-150 ease-out hover:text-ink hover:decoration-ink"
      >
        {source.label}
        <svg
          aria-hidden="true"
          viewBox="0 0 8 8"
          className="ml-1 inline-block h-2 w-2 align-baseline"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M1.5 6.5l5-5M2.5 1.5h4v4" />
        </svg>
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
      <span className="whitespace-nowrap font-mono">
        checked {formatDate(source.checkedAt)}
      </span>
    </p>
  );
}
