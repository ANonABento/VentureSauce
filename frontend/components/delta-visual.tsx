import type { ReactNode } from "react";
import type { DeltaVisual as DeltaVisualData } from "@/lib/types";
import { cn } from "./cn";
import { formatDate, formatUsd } from "./report-utils";

/**
 * A row's mini chart. Every chart spans the full content width from the same
 * left edge and carries a caption that says what it shows. Solid ink = said
 * publicly; outlined graphite = in the filing only. The signal color is used
 * for one thing: the gap segment of a discrepancy.
 */
export function DeltaVisual({
  visual,
  discrepancy = false,
}: {
  visual: DeltaVisualData;
  discrepancy?: boolean;
}) {
  switch (visual.kind) {
    case "raise":
      return <RaiseBar {...visual} discrepancy={discrepancy} />;
    case "investors":
      return <InvestorDots {...visual} />;
    case "headcount":
      return <HeadcountSparkline {...visual} />;
    case "leadership":
      return <LeadershipList {...visual} />;
    case "timing":
      return <Timeline {...visual} />;
  }
}

/** Small mono labels under a chart, spread across its width. */
function Caption({ children }: { children: ReactNode }) {
  return (
    <div className="mt-1 flex justify-between gap-2 font-mono text-[11px] leading-4 text-graphite">
      {children}
    </div>
  );
}

/** Track = offered, fill = sold per the filing, tick = said publicly. */
function RaiseBar({
  offered,
  sold,
  said,
  discrepancy,
}: {
  offered: number;
  sold: number;
  said: number;
  discrepancy: boolean;
}) {
  const max = Math.max(offered, sold, said) || 1;
  const percent = (amount: number) => `${(Math.max(0, amount) / max) * 100}%`;
  const low = Math.min(sold, said);
  const high = Math.max(sold, said);

  return (
    <div>
      <div aria-hidden="true" className="relative h-3">
        <span className="absolute inset-x-0 top-[3px] h-1.5 bg-rule" />
        <span
          className="absolute top-[3px] left-0 h-1.5 bg-ink"
          style={{ width: percent(low) }}
        />
        <span
          className={cn(
            "absolute top-[3px] h-1.5",
            discrepancy ? "bg-signal" : "bg-graphite",
          )}
          style={{
            left: percent(low),
            width: `calc(${percent(high)} - ${percent(low)})`,
          }}
        />
        <span
          className="absolute top-0 h-3 w-px bg-ink"
          style={{ left: percent(said) }}
        />
      </div>
      <Caption>
        <span>{formatUsd(said)} said</span>
        <span>{formatUsd(sold)} filed</span>
        <span>{formatUsd(offered)} offered</span>
      </Caption>
    </div>
  );
}

// Up to this many dots are spread across the full width; beyond it they wrap.
const SPREAD_DOTS = 28;
const MAX_DOTS = 84;

/** One dot per investor in the filing; solid = named publicly. */
function InvestorDots({ filed, named }: { filed: number; named: number }) {
  const shown = Math.min(filed, MAX_DOTS);

  return (
    <div>
      <div
        aria-hidden="true"
        className={cn(
          "flex h-3 items-center",
          shown <= SPREAD_DOTS ? "justify-between" : "h-auto flex-wrap gap-1",
        )}
      >
        {Array.from({ length: shown }, (_, index) => (
          <span
            key={index}
            className={cn(
              "h-2 w-2 rounded-full",
              index < named ? "bg-ink" : "border border-graphite",
            )}
          />
        ))}
      </div>
      <Caption>
        <span>
          {named} named of {filed} filed
        </span>
      </Caption>
    </div>
  );
}

const monthFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
});
const SPARK_HEIGHT = 24;

function HeadcountSparkline({
  series,
}: {
  series: { date: string; value: number }[];
}) {
  if (series.length < 2) return null;

  const values = series.map((point) => point.value);
  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  // x in 0–100 (stretched to the content width), y in px.
  const y = (value: number) =>
    SPARK_HEIGHT - 4 - ((value - min) / range) * (SPARK_HEIGHT - 8);
  const points = values
    .map((value, index) => `${(index / (values.length - 1)) * 100},${y(value)}`)
    .join(" ");
  const first = series[0];
  const last = series[series.length - 1];

  return (
    <div>
      <div aria-hidden="true" className="relative" style={{ height: SPARK_HEIGHT }}>
        <svg
          viewBox={`0 0 100 ${SPARK_HEIGHT}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full overflow-visible text-ink"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
        >
          <polyline points={points} vectorEffect="non-scaling-stroke" />
        </svg>
        <span
          className="absolute right-0 h-1.5 w-1.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-ink"
          style={{ top: y(last.value) }}
        />
      </div>
      <Caption>
        <span>
          {first.value} {monthFormat.format(new Date(first.date))}
        </span>
        <span>
          {last.value} {monthFormat.format(new Date(last.date))}
        </span>
      </Caption>
    </div>
  );
}

/** Everyone in the filing; a hollow dot marks who is not on the team page. */
function LeadershipList({
  people,
}: {
  people: { name: string; role?: string; onSite: boolean }[];
}) {
  const onSite = people.filter((person) => person.onSite).length;

  return (
    <div>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs leading-4 text-ink">
        {people.map((person) => (
          <li key={person.name} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={cn(
                "h-2 w-2 rounded-full",
                person.onSite ? "bg-ink" : "border border-graphite",
              )}
            />
            <span>{person.name}</span>
            {!person.onSite && (
              <span className="sr-only"> (not on the team page)</span>
            )}
          </li>
        ))}
      </ul>
      <Caption>
        <span>
          {onSite} on team page of {people.length} filed
        </span>
      </Caption>
    </div>
  );
}

/** The filing date and the press date as two labeled dots on one line. */
function Timeline({
  filedOn,
  announcedOn,
}: {
  filedOn: string;
  announcedOn: string;
}) {
  return (
    <div>
      <div aria-hidden="true" className="relative h-3">
        <span className="absolute inset-x-1 top-1/2 h-px bg-graphite" />
        <span className="absolute top-0.5 left-0 h-2 w-2 rounded-full border border-graphite bg-paper" />
        <span className="absolute top-0.5 right-0 h-2 w-2 rounded-full bg-ink" />
      </div>
      <Caption>
        <span>{formatDate(filedOn)} filed</span>
        <span>{formatDate(announcedOn)} press</span>
      </Caption>
    </div>
  );
}
