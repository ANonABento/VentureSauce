"use client";

import { useId, useState } from "react";
import { motion } from "motion/react";
import { DUR, EASE_ENTER, RISE, STAGGER } from "@/lib/motion";
import type { Claim, DeltaRow as DeltaRowData, Source } from "@/lib/types";
import { cn } from "./cn";
import { Collapse } from "./collapse";
import { DeltaVisual } from "./delta-visual";
import { Figures } from "./figures";
import { formatDate } from "./report-utils";
import { STATUS } from "./status";

/**
 * Collapsed: status mark, signal, the delta in a few words, mini chart and
 * sources. Expanded: filed vs. said and the likeliest reason.
 */
export function DeltaRow({
  row,
  size = "panel",
  divided = false,
  index = 0,
}: {
  row: DeltaRowData;
  size?: "panel" | "page";
  /** Draws the single hairline that sets the discrepancies apart. */
  divided?: boolean;
  /** Position in the list, for the staggered entrance. */
  index?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [allReasons, setAllReasons] = useState(false);
  const id = useId();

  const text = size === "page" ? "text-sm leading-5" : "text-[13px] leading-5";
  const sources = [row.filed?.source, row.said?.source].filter(
    (source): source is Source => Boolean(source),
  );
  const [topReason, ...moreReasons] = row.likelyReasons;

  return (
    <motion.li
      className={cn("fragment px-3 py-3", divided && "mt-5")}
      initial={{ opacity: 0, y: RISE }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.reveal, ease: EASE_ENTER, delay: 0.2 + index * STAGGER }}
    >
      {/* The 2px mark is the one place status is shown; the text is ink. */}
      <div className="relative pl-3">
        <span
          aria-hidden="true"
          className={cn("absolute inset-y-0 left-0 w-0.5 rounded-full", STATUS[row.status].mark)}
        />

        <div className="relative">
          {/* The button's ::after stretches over the chart, so the whole
              collapsed row is the click target. */}
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={id}
            onClick={() => setExpanded((value) => !value)}
            className={cn(
              "group flex w-full items-baseline justify-between gap-3 text-left text-ink after:absolute after:inset-0",
              text,
            )}
          >
            <span className="font-medium underline decoration-transparent underline-offset-4 transition-colors duration-150 ease-out group-hover:decoration-current">
              {row.signal}
              <span className="sr-only">, {STATUS[row.status].label}:</span>
            </span>
            <span className="flex items-baseline gap-2 text-right">
              <span>
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
                discrepancy={row.status === "discrepancy"}
              />
            </div>
          )}
        </div>

        {sources.length > 0 && (
          <p className="mt-2 text-[11px] leading-4 text-graphite">
            {sources.map((source, index) => (
              <span key={index}>
                {index > 0 && " · "}
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Checked ${formatDate(source.checkedAt)}`}
                  className="font-medium text-data underline decoration-transparent underline-offset-2 transition-colors duration-150 ease-out hover:decoration-current"
                >
                  {source.label}
                  <span aria-hidden="true"> ↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </span>
            ))}
          </p>
        )}

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
                    className="mt-1 text-xs leading-5 underline decoration-graphite/40 underline-offset-2 transition-colors duration-150 ease-out hover:text-ink hover:decoration-ink"
                  >
                    Show {moreReasons.length} more
                  </button>
                ))}
            </div>
          )}
        </Collapse>
      </div>
    </motion.li>
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
