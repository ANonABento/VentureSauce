"use client";

import { useId, useState } from "react";
import type { Claim, DeltaRow as DeltaRowData, Source } from "@/lib/types";
import { cn } from "./cn";
import { Collapse } from "./collapse";
import { DeltaVisual } from "./delta-visual";
import { Figures } from "./figures";
import { formatDate } from "./report-utils";
import { STATUS } from "./status";

/**
 * Collapsed: status mark, signal, mini visual and the delta in a few words.
 * Expanded: filed vs. said, the two sources and the likeliest reason.
 */
export function DeltaRow({
  row,
  size = "panel",
}: {
  row: DeltaRowData;
  size?: "panel" | "page";
}) {
  const [expanded, setExpanded] = useState(false);
  const [allReasons, setAllReasons] = useState(false);
  const id = useId();

  const discrepancy = row.status === "discrepancy";
  const quiet = row.status === "consistent";
  const text = size === "page" ? "text-sm leading-5" : "text-[13px] leading-5";
  const sources = [row.filed?.source, row.said?.source].filter(
    (source): source is Source => Boolean(source),
  );
  const checked = [...new Set(sources.map((s) => formatDate(s.checkedAt)))];
  const [topReason, ...moreReasons] = row.likelyReasons;

  return (
    <li className="relative border-b border-rule py-5">
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-5 bottom-5 -left-3 w-0.5",
          STATUS[row.status].fill,
        )}
      />

      <div className="relative">
        {/* The button's ::after stretches over the visual, so the whole
            collapsed row is the click target. */}
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((value) => !value)}
          className={cn(
            "group flex w-full items-baseline justify-between gap-3 text-left after:absolute after:inset-0",
            text,
          )}
        >
          <span
            className={cn(
              "underline decoration-transparent underline-offset-4 transition-colors duration-150 ease-out group-hover:decoration-current",
              quiet ? "text-graphite" : "font-medium text-ink",
            )}
          >
            {row.signal}
            <span className="sr-only">, {STATUS[row.status].label}:</span>
          </span>
          <span className="flex items-baseline gap-2 text-right">
            <span
              className={cn(
                discrepancy
                  ? "font-medium text-signal"
                  : quiet
                    ? "text-graphite"
                    : "text-ink",
              )}
            >
              <Figures text={row.summaryShort ?? row.summary} />
            </span>
            <svg
              aria-hidden="true"
              viewBox="0 0 8 8"
              className={cn(
                "h-2 w-2 shrink-0 text-graphite transition-transform duration-150 ease-out",
                expanded && "rotate-180",
              )}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path d="M1 2.5l3 3 3-3" />
            </svg>
          </span>
        </button>

        {row.visual && (
          <div className="mt-3">
            <DeltaVisual
              visual={row.visual}
              highlight={discrepancy}
              quiet={quiet}
            />
          </div>
        )}
      </div>

      <Collapse id={id} open={expanded}>
        <dl
          className={cn(
            "grid grid-cols-[36px_1fr] gap-x-3 gap-y-1 pt-4 text-ink",
            text,
          )}
        >
          <ClaimLine label="Filed" claim={row.filed} emptyText="Not in the filing" />
          <ClaimLine label="Said" claim={row.said} emptyText="Not stated publicly" />
        </dl>

        {sources.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
            {sources.map((source, index) => (
              <SourceChip key={index} source={source} />
            ))}
            <span className="text-[11px] leading-4 text-graphite">
              checked {checked.join(", ")}
            </span>
          </div>
        )}

        {topReason && (
          <div className={cn("mt-4 text-graphite", text)}>
            <p className="micro-label">
              {allReasons
                ? "Likely reasons"
                : moreReasons.length > 0
                  ? "Likeliest reason"
                  : "Likely reason"}
            </p>
            <p className="mt-1">{topReason}</p>
            {moreReasons.length > 0 &&
              (allReasons ? (
                moreReasons.map((reason) => (
                  <p key={reason} className="mt-1">
                    {reason}
                  </p>
                ))
              ) : (
                <button
                  type="button"
                  onClick={() => setAllReasons(true)}
                  className="mt-1 text-xs leading-5 underline decoration-graphite/50 underline-offset-2 transition-colors duration-150 ease-out hover:text-ink hover:decoration-ink"
                >
                  Show {moreReasons.length} more
                </button>
              ))}
          </div>
        )}
      </Collapse>
    </li>
  );
}

function ClaimLine({
  label,
  claim,
  emptyText,
}: {
  label: string;
  claim: Claim | null;
  emptyText: string;
}) {
  return (
    <>
      <dt className="micro-label pt-0.5 text-graphite">{label}</dt>
      <dd className={claim ? undefined : "text-graphite"}>
        {/* Dates are words here, not figures. */}
        {!claim ? (
          emptyText
        ) : claim.field === "first_sale" ? (
          claim.value
        ) : (
          <Figures text={claim.value} />
        )}
      </dd>
    </>
  );
}

/** A small square link chip; the date checked is in the tooltip. */
function SourceChip({ source }: { source: Source }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      title={`Checked ${formatDate(source.checkedAt)}`}
      className="inline-flex h-6 items-center gap-1 rounded-[2px] border border-rule px-2 text-xs leading-4 text-ink transition-colors duration-150 ease-out hover:border-ink"
    >
      {source.label}
      <svg
        aria-hidden="true"
        viewBox="0 0 8 8"
        className="h-2 w-2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <path d="M1.5 6.5l5-5M2.5 1.5h4v4" />
      </svg>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
