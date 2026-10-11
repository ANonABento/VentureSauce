"use client";

import { useCallback, useEffect, useState } from "react";
import { ChatCircleDots } from "@phosphor-icons/react/dist/ssr";
import { API, DEFAULT_API, type Digest, WORKSPACE, getDigest } from "@/lib/api";
import { STAGGER } from "@/lib/motion";
import { cn } from "./cn";
import { Wordmark } from "./logo";
import { CountUp } from "./motion";
import { PRINT_UNCLIP } from "./sauce-report";
import { Meter, SignalStrip } from "./viz";

/*
 * The digest Sauce Report (decision 57): `/sauce?digest=day|week` as a
 * printable page. Cover, one glance row, then every company with new items
 * ranked by flags (bar, glyphs, short deltas, top question). Numbers over
 * sentences; the full sources stay in each company's own Sauce Report.
 *
 * Data rule: each company's `discrepancies` already includes its "across your
 * sources" rows, and `contradictions` counts those. So flags = discrepancies
 * length and public-record flags = flags − contradictions; totals likewise.
 */

export type DigestPeriod = Digest["period"];
type DigestCompany = Digest["companies"][number];
/** The backend also sends the window's start (ISO); lib/api.ts doesn't type it yet. */
type DigestWithSince = Digest & { since?: string };

const OWN_SOURCES = /\s*across your sources$/i;

// Local time: the report is dated for the person reading it, and it only renders after a client fetch.
const dayFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const shortDayFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

function day(iso: string, format = dayFormat): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : format.format(date);
}

const periodTitle = (period: DigestPeriod) => (period === "day" ? "Daily report" : "Weekly report");

/** "Daily report — VentureSauce Oct 10, 2026": the tab title, so the saved PDF gets this name. */
export function digestReportTitle(period: DigestPeriod, at: string): string {
  return `${periodTitle(period)} — VentureSauce ${day(at)}`;
}

/** A company's own Sauce Report, in the same inbox (and backend) as this page. */
function companyHref(id: string): string {
  return `/sauce?${new URLSearchParams({ company: id, ws: WORKSPACE, ...(API !== DEFAULT_API ? { api: API } : {}) })}`;
}

export type DigestReportState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; digest: Digest; at: string };

type Loaded = { key: string; state: DigestReportState };

/** The digest for one period, stamped with when it was fetched. `retry` loads again. */
export function useDigestReport(period: DigestPeriod): { state: DigestReportState; retry: () => void } {
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const key = `${period}#${attempt}`;

  useEffect(() => {
    let live = true;
    const done = (state: DigestReportState) => {
      if (live) setLoaded({ key: `${period}#${attempt}`, state });
    };
    getDigest(period)
      .then((digest) => done({ status: "ready", digest, at: new Date().toISOString() }))
      .catch((error: unknown) => done({ status: "error", message: error instanceof Error ? error.message : String(error) }));
    return () => {
      live = false;
    };
  }, [period, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { state: loaded?.key === key ? loaded.state : { status: "loading" }, retry };
}

/** The glyphs, with SignalStrip's exact classes so the key matches the strips below. */
type GlyphKind = "dot" | "diamond" | "items" | "companies";

function Glyph({ kind }: { kind: GlyphKind }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block shrink-0",
        kind === "dot" && "h-[7px] w-[7px] rounded-full bg-signal",
        kind === "diamond" && "mx-px h-[6px] w-[6px] rotate-45 border-[1.25px] border-signal",
        kind === "items" && "h-[7px] w-[7px] rounded-[2px] bg-data",
        kind === "companies" && "h-[7px] w-[7px] rounded-[2px] border border-data",
      )}
    />
  );
}

export function DigestReport({ digest, at }: { digest: Digest; at: string }) {
  const { period, totals } = digest;
  const since = (digest as DigestWithSince).since;
  // Most flags first; the bars share one scale (the most-flagged company) so they compare down the page.
  const ranked = [...digest.companies].sort((a, b) => b.discrepancies.length - a.discrepancies.length);
  const scale = Math.max(1, ...ranked.map((c) => c.discrepancies.length));

  return (
    <article className={cn("sauce-doc mx-auto w-full max-w-[656px]", PRINT_UNCLIP)}>
      <header className="break-inside-avoid">
        <div className="flex items-center justify-between gap-3">
          <Wordmark />
          <span className="micro-label text-graphite">Sauce Report</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- a static local asset; next/image adds nothing here */}
        <img src="/art/horizon.webp" alt="" className="mt-4 h-24 w-full rounded-xl object-cover object-[center_78%]" />
        <h1 className="mt-7 font-serif text-[44px] leading-[48px] tracking-[-0.03em] text-ink">{periodTitle(period)}</h1>
        <p className="mt-2 text-xs leading-4 text-graphite">
          {period === "week" && since ? `${day(since, shortDayFormat)} – ${day(at)}` : day(at)}
        </p>
      </header>

      <Glance totals={totals} />

      {ranked.length > 0 ? (
        <section aria-label="Companies" className="mt-8 space-y-2">
          {ranked.map((company, index) => (
            <CompanyBlock key={company.id} company={company} scale={scale} delay={0.25 + index * STAGGER * 2} />
          ))}
        </section>
      ) : (
        <p className="mt-8 text-[13px] leading-5 text-graphite">
          Nothing new {period === "day" ? "today" : "this week"}.
        </p>
      )}

      <footer className="mt-10 break-inside-avoid border-t border-rule pt-4 text-[11px] leading-4 text-graphite">
        Differences between sources, not findings of wrongdoing. Full sources in each company&rsquo;s Sauce Report.
      </footer>
    </article>
  );
}

/** The one tray: four figures that define the glyphs, then all flags as one bar. */
function Glance({ totals }: { totals: Digest["totals"] }) {
  const publicCount = totals.discrepancies - totals.contradictions;
  const figures: { kind: GlyphKind; value: number; caption: string; flag: boolean }[] = [
    { kind: "dot", value: publicCount, caption: "vs public records", flag: true },
    { kind: "diamond", value: totals.contradictions, caption: "between your items", flag: true },
    { kind: "items", value: totals.items, caption: "new items", flag: false },
    { kind: "companies", value: totals.companies, caption: totals.companies === 1 ? "company" : "companies", flag: false },
  ];

  return (
    <section aria-label="At a glance" className="tray mt-8 break-inside-avoid">
      <dl className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-4">
        {figures.map((f, i) => (
          <div key={f.kind} className="flex flex-col-reverse">
            <dt className="mt-1 flex items-center gap-1.5 text-[11px] leading-4 text-graphite">
              <Glyph kind={f.kind} />
              {f.caption}
            </dt>
            <dd>
              <CountUp
                value={f.value}
                delay={0.1 + i * STAGGER}
                className={cn(
                  "font-serif text-[40px] leading-[44px] tracking-[-0.03em]",
                  f.flag && f.value > 0 ? "text-signal" : "text-ink",
                )}
              />
            </dd>
          </div>
        ))}
      </dl>
      <Meter
        className="mt-4"
        delay={0.15}
        total={Math.max(1, totals.discrepancies)}
        segments={[
          { value: publicCount, tone: "signal" },
          { value: totals.contradictions, tone: "signal-soft" },
        ]}
      />
    </section>
  );
}

/** One company: name (to its Sauce Report), glyphs, a bar on the shared scale, each flag's short delta, the top question. */
function CompanyBlock({ company: c, scale, delay }: { company: DigestCompany; scale: number; delay: number }) {
  const flags = c.discrepancies.length;
  const publicCount = flags - c.contradictions;
  const top = c.questions[0];
  // Which glyph leads each row: all of one kind when the counts say so, else the "across your sources" rows are ◇.
  const isContradiction = (signal: string) => c.contradictions === flags || (c.contradictions > 0 && OWN_SOURCES.test(signal));

  return (
    <section className="fragment break-inside-avoid px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="min-w-0 font-serif text-[22px] leading-7 tracking-[-0.02em] text-ink [overflow-wrap:anywhere]">
          <a
            href={companyHref(c.id)}
            className="underline decoration-transparent underline-offset-4 transition-colors duration-150 hover:decoration-current"
          >
            {c.name}
          </a>
          {c.fictional && <span className="ml-1.5 font-sans text-[11px] tracking-normal text-graphite">fictional</span>}
        </h2>
        <SignalStrip discrepancies={publicCount} contradictions={c.contradictions} delay={delay} className="shrink-0" />
      </div>
      <Meter
        className="mt-2.5"
        delay={delay + 0.1}
        total={scale}
        segments={[
          { value: publicCount, tone: "signal" },
          { value: c.contradictions, tone: "signal-soft" },
        ]}
      />

      {flags > 0 && (
        <ul className="mt-3 divide-y divide-rule border-t border-rule">
          {c.discrepancies.map((d, i) => {
            const own = isContradiction(d.signal);
            return (
              <li key={`${d.signal}-${i}`} className="flex items-center gap-2.5 py-2 text-[13px] leading-5">
                <span className="flex w-2 shrink-0 justify-center">
                  <Glyph kind={own ? "diamond" : "dot"} />
                </span>
                <span className="min-w-0 flex-1 text-ink [overflow-wrap:anywhere]">
                  {d.signal.replace(OWN_SOURCES, "") || d.signal}
                  <span className="sr-only">{own ? ", between your items" : ", vs public records"}</span>
                </span>
                {d.short && <span className="shrink-0 text-xs leading-4 font-medium text-signal">{d.short}</span>}
              </li>
            );
          })}
        </ul>
      )}

      {top && (
        <p className={cn("flex gap-2 text-[13px] leading-5 text-ink", flags > 0 ? "mt-1.5" : "mt-3")}>
          <ChatCircleDots aria-hidden="true" size={15} weight="light" className="mt-[3px] shrink-0 text-data" />
          <span className="min-w-0 [overflow-wrap:anywhere]">
            <span className="sr-only">Top question: </span>
            {top.question}
          </span>
        </p>
      )}
    </section>
  );
}
