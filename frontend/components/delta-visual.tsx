import type { CSSProperties, ReactNode } from "react";
import type { DeltaVisual as DeltaVisualData } from "@/lib/types";
import { cn } from "./cn";
import { formatDate, formatUsd } from "./report-utils";

/**
 * A row's chart. Every chart spans the full card width from the same left
 * edge and says what it shows. Marks are dithered dot grids in the data color;
 * the signal color is used for one thing only: the gap of a discrepancy.
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
      return <LeadershipList {...visual} discrepancy={discrepancy} />;
    case "timing":
      return <Timeline {...visual} />;
  }
}

const dot = (color: string) => ({ ["--dot" as string]: color }) as CSSProperties;

/** Small labels under a chart, spread across its width. */
function Caption({ children }: { children: ReactNode }) {
  return (
    <div className="mt-2 flex justify-between gap-2 text-xs leading-4 text-graphite">
      {children}
    </div>
  );
}

function Value({ children }: { children: ReactNode }) {
  return <span className="font-mono text-ink">{children}</span>;
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
      <div aria-hidden="true" className="relative h-7">
        <span
          className="dither absolute inset-x-0 top-1 h-5"
          style={dot("var(--border-strong)")}
        />
        <span className="absolute inset-x-0 top-1 h-5 animate-grow">
          <span
            className="dither absolute inset-y-0 left-0 bg-surface"
            style={{ width: percent(low), ...dot("var(--data)") }}
          />
          <span
            className="dither absolute inset-y-0 bg-surface"
            style={{
              left: percent(low),
              width: `calc(${percent(high)} - ${percent(low)})`,
              ...dot(discrepancy ? "var(--signal)" : "var(--data)"),
            }}
          />
        </span>
        <span
          className="absolute inset-y-0 w-0.5 -translate-x-1/2 rounded-full bg-ink"
          style={{ left: percent(said) }}
        />
      </div>
      <Caption>
        <span>
          <Value>{formatUsd(said)}</Value> said
        </span>
        <span>
          <Value>{formatUsd(sold)}</Value> filed
        </span>
        <span>
          <Value>{formatUsd(offered)}</Value> offered
        </span>
      </Caption>
    </div>
  );
}

/**
 * Two dithered bars on one scale, for any row with a said and a filed figure
 * but no dedicated chart.
 */
export function CompareBars({
  said,
  filed,
  filedName = "Filed",
  discrepancy,
}: {
  said: { label: string; value: number };
  filed: { label: string; value: number };
  /** "Filed" for an SEC filing, "Found" for other public records. */
  filedName?: string;
  discrepancy: boolean;
}) {
  const max = Math.max(said.value, filed.value) || 1;
  const bars = [
    { name: "Said", ...said, color: "var(--data)" },
    { name: filedName, ...filed, color: discrepancy ? "var(--signal)" : "var(--data)" },
  ];

  return (
    <dl className="grid grid-cols-[40px_1fr] items-center gap-x-3 gap-y-2">
      {bars.map((bar) => (
        <div key={bar.name} className="contents">
          <dt className="text-xs leading-4 text-graphite">{bar.name}</dt>
          <dd className="relative h-3">
            <span
              aria-hidden="true"
              className="dither absolute inset-0"
              style={dot("var(--border-strong)")}
            />
            <span aria-hidden="true" className="absolute inset-0 animate-grow">
              <span
                className="dither absolute inset-y-0 left-0 bg-surface"
                style={{ width: `${(bar.value / max) * 100}%`, ...dot(bar.color) }}
              />
            </span>
            <span className="sr-only">{bar.label}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

// Dots per row. Fewer than this and one row spans the card; more and they wrap.
const DOTS_PER_ROW = 24;
const MAX_DOTS = 96;

/** One dot per investor in the filing; solid = named publicly. */
function InvestorDots({ filed, named }: { filed: number; named: number }) {
  const shown = Math.min(filed, MAX_DOTS);

  return (
    <div>
      {/* A grid, so the dots shrink to fit a narrow panel instead of overlapping. */}
      <div
        aria-hidden="true"
        className="grid animate-grow gap-[3px]"
        style={{
          gridTemplateColumns: `repeat(${Math.min(shown, DOTS_PER_ROW)}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: shown }, (_, index) => (
          <span
            key={index}
            className={cn(
              "aspect-square w-full max-w-2.5 rounded-full",
              index < named ? "bg-data" : "border-[1.5px] border-border-strong",
            )}
          />
        ))}
      </div>
      <Caption>
        <span>
          <Value>{named}</Value> named of <Value>{filed}</Value> filed
        </span>
      </Caption>
    </div>
  );
}

const monthFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
});
const SPARK_HEIGHT = 56;

function HeadcountSparkline({
  series,
}: {
  series: { date: string; value: number }[];
}) {
  if (series.length < 2) return null;

  const values = series.map((point) => point.value);
  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  // x in 0–100 (stretched to the card width), y in px.
  const y = (value: number) =>
    SPARK_HEIGHT - 6 - ((value - min) / range) * (SPARK_HEIGHT - 14);
  const points = values.map(
    (value, index) => `${(index / (values.length - 1)) * 100},${y(value)}`,
  );
  const first = series[0];
  const last = series[series.length - 1];

  return (
    <div>
      <div aria-hidden="true" className="relative" style={{ height: SPARK_HEIGHT }}>
        <svg
          viewBox={`0 0 100 ${SPARK_HEIGHT}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full animate-grow text-data"
        >
          <polygon
            points={`0,${SPARK_HEIGHT} ${points.join(" ")} 100,${SPARK_HEIGHT}`}
            fill="currentColor"
            opacity="0.1"
          />
          <polyline
            points={points.join(" ")}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span
          className="absolute right-0 h-2.5 w-2.5 translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-data"
          style={{ top: y(last.value) }}
        />
      </div>
      <Caption>
        <span>
          <Value>{first.value}</Value> {monthFormat.format(new Date(first.date))}
        </span>
        <span>
          <Value>{last.value}</Value> {monthFormat.format(new Date(last.date))}
        </span>
      </Caption>
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** Everyone in the filing as a chip; the ones named there only are set apart. */
function LeadershipList({
  people,
  discrepancy,
}: {
  people: { name: string; role?: string; onSite: boolean }[];
  discrepancy: boolean;
}) {
  const named = people.filter((person) => person.onSite).length;

  return (
    <div>
      <ul className="flex flex-wrap gap-1.5">
        {people.map((person) => (
          <li
            key={person.name}
            className={cn(
              "flex items-center gap-1.5 rounded-full py-0.5 pr-2.5 pl-0.5 text-xs leading-5",
              person.onSite
                ? "bg-tray text-ink"
                : discrepancy
                  ? "bg-signal-wash text-signal"
                  : "border border-dashed border-border-strong text-graphite",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-medium",
                person.onSite
                  ? "bg-data text-white"
                  : discrepancy
                    ? "bg-signal text-white"
                    : "bg-border-strong text-ink",
              )}
            >
              {initials(person.name)}
            </span>
            {person.name}
            {!person.onSite && <span className="sr-only"> (in the filing only)</span>}
          </li>
        ))}
      </ul>
      <Caption>
        <span>
          <Value>{named}</Value> named of <Value>{people.length}</Value> filed
        </span>
      </Caption>
    </div>
  );
}

/** The filing date and the press date as two labeled dots, with the gap between. */
function Timeline({
  filedOn,
  announcedOn,
}: {
  filedOn: string;
  announcedOn: string;
}) {
  const days = Math.round(
    Math.abs(new Date(announcedOn).getTime() - new Date(filedOn).getTime()) / 86_400_000,
  );

  return (
    <div>
      <div aria-hidden="true" className="relative h-7">
        <span
          className="dither absolute inset-x-1 top-1/2 h-1 -translate-y-1/2 animate-grow"
          style={dot("var(--data)")}
        />
        <span className="absolute top-1/2 left-0 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-data bg-surface" />
        <span className="absolute top-1/2 right-0 h-3 w-3 -translate-y-1/2 rounded-full bg-data" />
        {Number.isFinite(days) && (
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface px-2 font-mono text-xs leading-4 text-ink">
            {days} days
          </span>
        )}
      </div>
      <Caption>
        <span>{formatDate(filedOn)} filed</span>
        <span>{formatDate(announcedOn)} press</span>
      </Caption>
    </div>
  );
}
