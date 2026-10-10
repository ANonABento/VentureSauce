"use client";

import { useId, useState } from "react";
import type { Claim, DeltaRow as DeltaRowData, Source } from "@/lib/types";
import { cn } from "./cn";
import { Collapse } from "./collapse";
import { CompareBars, DeltaVisual } from "./delta-visual";
import { Figures } from "./figures";
import { formatDate } from "./report-utils";
import { STATUS } from "./status";
import { StatusPill } from "./status-pill";

const FIGURE = /^[−+-]?\$?\d[\d,.]*\s?[KMB%]?/;
const UNIT: Record<string, number> = { K: 1e3, M: 1e6, B: 1e9 };

/** The figure a claim leads with ("$15M", "25"), if it has one. */
function leadingFigure(claim: Claim | null): { label: string; value: number } | null {
  // Dates such as "First sale Feb 11" are not figures.
  if (!claim || claim.field === "first_sale") return null;
  const label = claim.value.match(FIGURE)?.[0].trim();
  if (!label) return null;
  const number = Number(label.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(number)) return null;
  return { label, value: number * (UNIT[label.slice(-1)] ?? 1) };
}

/**
 * One signal as a card. Collapsed: name, status, said → filed in large
 * figures, a chart and the sources. Expanded: the full comparison and reasons.
 */
export function DeltaRow({
  row,
  size = "panel",
  index = 0,
}: {
  row: DeltaRowData;
  size?: "panel" | "page";
  /** Position in the list, for the staggered entrance. */
  index?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [allReasons, setAllReasons] = useState(false);
  const id = useId();

  const discrepancy = row.status === "discrepancy";
  const text = size === "page" ? "text-sm leading-5" : "text-[13px] leading-5";
  const said = leadingFigure(row.said);
  const filed = leadingFigure(row.filed);
  const sources = [row.filed?.source, row.said?.source].filter(
    (source): source is Source => Boolean(source),
  );
  const [topReason, ...moreReasons] = row.likelyReasons;
  // LinkedIn and press are public records too, but nothing was "filed" there.
  const recordLabel = /SEC|Form [A-Z0-9]/.test(row.filed?.source.label ?? "SEC") ? "Filed" : "Found";

  return (
    <li
      className="relative animate-rise overflow-hidden rounded-lg bg-surface shadow-fragment"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <span
        aria-hidden="true"
        className={cn("absolute inset-y-0 left-0 w-[3px]", STATUS[row.status].mark)}
      />

      <div className="py-4 pr-4 pl-5">
        <div className="relative">
          {/* The button's ::after stretches over the figures and the chart,
              so the whole collapsed card is the click target. */}
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={id}
            onClick={() => setExpanded((value) => !value)}
            className="group flex w-full items-start justify-between gap-3 text-left after:absolute after:inset-0"
          >
            <span className="min-w-0 text-sm leading-5 font-medium text-ink underline decoration-transparent underline-offset-4 transition-colors duration-150 ease-out group-hover:decoration-current">
              {row.signal}
              <span className="sr-only">, {STATUS[row.status].label}</span>
            </span>
            <svg
              aria-hidden="true"
              viewBox="0 0 8 8"
              className={cn(
                "mt-1.5 h-2.5 w-2.5 shrink-0 text-graphite transition-transform duration-150 ease-out",
                expanded && "rotate-180",
              )}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            >
              <path d="M1 2.5l3 3 3-3" />
            </svg>
          </button>

          {/* Pill and delta wrap as a pair, so narrow panels never squeeze the name. */}
          <p className={cn("mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-graphite", text)}>
            <StatusPill status={row.status} />
            <span>
              <Figures text={row.summaryShort ?? row.summary} />
            </span>
          </p>

          {said && filed && (
            <p className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1">
              <BigFigure label="Said" value={said.label} className="text-ink" />
              <svg
                aria-hidden="true"
                viewBox="0 0 24 8"
                className="mb-2.5 h-2 w-6 shrink-0 text-border-strong"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              >
                <path d="M0 4h22M19 1l3 3-3 3" />
              </svg>
              <BigFigure
                label={recordLabel}
                value={filed.label}
                className={discrepancy ? "text-signal" : "text-data"}
              />
            </p>
          )}

          {row.visual ? (
            <div className="mt-4">
              <DeltaVisual visual={row.visual} discrepancy={discrepancy} />
            </div>
          ) : (
            said &&
            filed && (
              <div className="mt-4">
                <CompareBars said={said} filed={filed} filedName={recordLabel} discrepancy={discrepancy} />
              </div>
            )
          )}
        </div>

        {sources.length > 0 && (
          <p className="mt-3 text-xs leading-4 text-graphite">
            {sources.map((source, index) => (
              <span key={index}>
                {index > 0 && " · "}
                {/* "#item" marks a claim from the user's own item: no page to open. */}
                {source.url === "#item" ? (
                  source.label
                ) : (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Checked ${formatDate(source.checkedAt)}`}
                    className="text-data underline decoration-data/30 underline-offset-2 transition-colors duration-150 ease-out hover:decoration-data"
                  >
                    {source.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                )}
              </span>
            ))}
          </p>
        )}

        <Collapse id={id} open={expanded}>
          <div className="mt-4 rounded-md bg-tray p-3">
            {row.summaryShort && <p className={cn("text-ink", text)}>{row.summary}</p>}
            <dl
              className={cn(
                "grid grid-cols-[40px_1fr] gap-x-3 gap-y-1 text-ink",
                row.summaryShort && "mt-3",
                text,
              )}
            >
              <ClaimLine label={recordLabel} claim={row.filed} emptyText="Not in the filing" />
              <ClaimLine label="Said" claim={row.said} emptyText="Not stated publicly" />
            </dl>

            {topReason && (
              <div className={cn("mt-3 text-graphite", text)}>
                <p className="micro-label text-ink">
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
                      className="mt-1 text-xs leading-5 text-data underline decoration-data/30 underline-offset-2 transition-colors duration-150 ease-out hover:decoration-data"
                    >
                      Show {moreReasons.length} more
                    </button>
                  ))}
              </div>
            )}
          </div>
        </Collapse>
      </div>
    </li>
  );
}

function BigFigure({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className: string;
}) {
  return (
    <span>
      <span className="block text-xs leading-4 text-graphite">{label}</span>
      <span
        className={cn(
          "block font-serif text-[28px] leading-8 tracking-[-0.02em] lining-nums",
          className,
        )}
      >
        {value}
      </span>
    </span>
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
      <dt className="text-xs leading-5 text-graphite">{label}</dt>
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
