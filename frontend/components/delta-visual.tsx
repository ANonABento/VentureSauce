import type { DeltaVisual as DeltaVisualData } from "@/lib/types";
import { cn } from "./cn";
import { formatDate, formatUsd } from "./report-utils";

type Tone = { highlight: boolean; quiet: boolean };

/**
 * A row's mini visualization. One visual language throughout: solid = said
 * publicly, outlined or signal-colored = in the filing only.
 */
export function DeltaVisual({
  visual,
  highlight = false,
  quiet = false,
}: {
  visual: DeltaVisualData;
  /** Discrepancy rows: the gap is drawn in the signal color. */
  highlight?: boolean;
  /** Consistent rows: drawn in graphite instead of ink. */
  quiet?: boolean;
}) {
  const tone = { highlight, quiet };
  switch (visual.kind) {
    case "raise":
      return <RaiseBar {...visual} {...tone} />;
    case "investors":
      return <InvestorDots {...visual} {...tone} />;
    case "headcount":
      return <HeadcountSparkline {...visual} {...tone} />;
    case "leadership":
      return <LeadershipList {...visual} />;
    case "timing":
      return <Timeline {...visual} {...tone} />;
  }
}

/** Track = offered, fill = sold per the filing, tick = said publicly. */
function RaiseBar({
  offered,
  sold,
  said,
  highlight,
  quiet,
}: { offered: number; sold: number; said: number } & Tone) {
  const max = Math.max(offered, sold, said) || 1;
  const percent = (amount: number) => `${(Math.max(0, amount) / max) * 100}%`;
  const low = Math.min(sold, said);
  const high = Math.max(sold, said);

  return (
    <div
      role="img"
      aria-label={`${formatUsd(sold)} sold of ${formatUsd(offered)} offered per the filing, ${formatUsd(said)} said publicly`}
      className="relative h-3 max-w-[340px]"
    >
      <span className="absolute inset-x-0 top-[3px] h-1.5 bg-rule" />
      <span
        className={cn("absolute top-[3px] left-0 h-1.5", quiet ? "bg-graphite" : "bg-ink")}
        style={{ width: percent(low) }}
      />
      <span
        className={cn("absolute top-[3px] h-1.5", highlight ? "bg-signal" : "bg-graphite/60")}
        style={{ left: percent(low), width: `calc(${percent(high)} - ${percent(low)})` }}
      />
      <span
        className="absolute top-0 h-3 w-px bg-ink"
        style={{ left: percent(said) }}
      />
    </div>
  );
}

const MAX_DOTS = 44;

/** One dot per investor in the filing; solid = named publicly. */
function InvestorDots({
  filed,
  named,
  highlight,
  quiet,
}: { filed: number; named: number } & Tone) {
  const shown = Math.min(filed, MAX_DOTS);

  return (
    <div
      role="img"
      aria-label={`${named} of ${filed} investors named publicly`}
      className="flex flex-wrap items-center gap-1"
    >
      {Array.from({ length: shown }, (_, index) => (
        <span
          key={index}
          className={cn(
            "h-2 w-2 rounded-full",
            index < named
              ? quiet
                ? "bg-graphite"
                : "bg-ink"
              : cn("border", highlight ? "border-signal" : "border-graphite"),
          )}
        />
      ))}
      {filed > shown && (
        <span className="font-mono text-[11px] leading-3 text-graphite">
          +{filed - shown}
        </span>
      )}
    </div>
  );
}

const SPARK_WIDTH = 96;
const SPARK_HEIGHT = 20;

function HeadcountSparkline({
  series,
  quiet,
}: { series: { date: string; value: number }[] } & Tone) {
  if (series.length < 2) return null;

  const values = series.map((point) => point.value);
  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  const points = values.map((value, index) => [
    2 + (index / (values.length - 1)) * (SPARK_WIDTH - 4),
    SPARK_HEIGHT - 3 - ((value - min) / range) * (SPARK_HEIGHT - 6),
  ]);
  const [lastX, lastY] = points[points.length - 1];
  const first = series[0];
  const last = series[series.length - 1];

  return (
    <div
      role="img"
      aria-label={`${first.value} in ${formatDate(first.date)} to ${last.value} in ${formatDate(last.date)}`}
      className={cn(
        "flex items-center gap-2 font-mono text-xs leading-5",
        quiet ? "text-graphite" : "text-ink",
      )}
    >
      <span>{first.value}</span>
      <svg
        viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
        width={SPARK_WIDTH}
        height={SPARK_HEIGHT}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points={points.map((point) => point.join(",")).join(" ")} />
        <circle cx={lastX} cy={lastY} r="2" fill="currentColor" stroke="none" />
      </svg>
      <span>{last.value}</span>
    </div>
  );
}

/** Everyone in the filing; a hollow dot marks who is not on the team page. */
function LeadershipList({
  people,
}: {
  people: { name: string; role?: string; onSite: boolean }[];
}) {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs leading-5">
      {people.map((person) => (
        <li key={person.name} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={cn(
              "h-2 w-2 rounded-full",
              person.onSite ? "bg-graphite" : "border border-ink",
            )}
          />
          <span className={person.onSite ? "text-graphite" : "text-ink"}>
            {person.name}
          </span>
          {!person.onSite && (
            <span className="sr-only"> (not on the team page)</span>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Two dots on a line: the filing date, then the press date. */
function Timeline({
  filedOn,
  announcedOn,
  quiet,
}: { filedOn: string; announcedOn: string } & Tone) {
  const line = quiet ? "bg-graphite" : "bg-ink";

  return (
    <div
      role="img"
      aria-label={`Filed ${formatDate(filedOn)}, announced ${formatDate(announcedOn)}`}
      className="flex items-center gap-2 text-xs leading-5 text-graphite"
    >
      <span>Filed {formatDate(filedOn)}</span>
      <span className="relative h-2 w-20">
        <span className={cn("absolute inset-x-1 top-1/2 h-px", line)} />
        <span
          className={cn(
            "absolute top-0 left-0 h-2 w-2 rounded-full border bg-paper",
            quiet ? "border-graphite" : "border-ink",
          )}
        />
        <span className={cn("absolute top-0 right-0 h-2 w-2 rounded-full", line)} />
      </span>
      <span>Press {formatDate(announcedOn)}</span>
    </div>
  );
}
