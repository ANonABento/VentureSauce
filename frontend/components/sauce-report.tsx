"use client";

import type { ReactNode } from "react";
import { WarningDiamond } from "@phosphor-icons/react/dist/ssr";
import type { Check, CompanyView, Question } from "@/lib/api";
import type { Claim, DeltaReport, DeltaRow, Source } from "@/lib/types";
import { cn } from "./cn";
import { DeltaVisual } from "./delta-visual";
import { Wordmark } from "./logo";
import { formatUsd } from "./report-utils";
import { STATUS } from "./status";
import { Verdict } from "./verdict";
import { RangePlot } from "./viz";

/*
 * The Sauce Report (decision 49): one company as a printable document. Cover,
 * verdict, contradictions as range plots, public records fully expanded, and
 * the questions. Nothing collapses, so the printed PDF carries every value and
 * every source (web sources also print their URL).
 */

/** Rows comparing the user's own items end with this; the rest are public records. */
const OWN_SOURCES_SUFFIX = "across your sources";

const dayFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  // Fixed zone so server and client render the same day.
  timeZone: "UTC",
});

/** "2026-10-02" → "Oct 2, 2026". A report is read later, so dates keep the year. */
function day(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : dayFormat.format(date);
}

const formatValue = (value: number, unit: string | null) =>
  unit === "usd"
    ? formatUsd(value)
    : unit === "percent"
      ? `${value.toLocaleString("en-US")}%`
      : value.toLocaleString("en-US");

const isWebUrl = (url: string) => /^https?:\/\//i.test(url);

function metricTitle(check: Check): string {
  if (check.metric) {
    return check.metric.length <= 4
      ? check.metric.toUpperCase()
      : check.metric[0].toUpperCase() + check.metric.slice(1);
  }
  return check.claim_type === "headcount" ? "Headcount" : "Total raised";
}

/** `12 ("Founder said 12 full-time")` → the figure, and the quote it came from. */
function splitQuote(value: string): { figure: string; quote: string | null } {
  const match = value.match(/^(.+?)\s+\(([“"].*[”"])\)$/);
  return match ? { figure: match[1], quote: match[2] } : { figure: value, quote: null };
}

export function SauceReport({
  view,
  report,
}: {
  view: CompanyView;
  /** Null when the public-record comparison couldn't be loaded; the rest still renders. */
  report: DeltaReport | null;
}) {
  const { company } = view;
  const fictional = Boolean(company.fictional);
  const contradictions = view.checks.filter(
    (check) => check.source === "your_sources" && (check.values?.length ?? 0) > 1,
  );
  const publicRows = (report?.rows ?? []).filter((row) => !row.signal.endsWith(OWN_SOURCES_SUFFIX));

  return (
    <article className="sauce-doc mx-auto w-full max-w-[656px]">
      <Cover
        name={company.name}
        domain={company.domain}
        fictional={fictional}
        generatedAt={report?.generatedAt}
        filer={company.form_d_entity}
        cik={company.cik}
      />

      {report && (
        <section aria-label="Verdict" className="mt-8 break-inside-avoid">
          <Verdict size="page" rows={report.rows} />
          {report.headline && <p className="mt-2 text-[13px] leading-5 text-graphite">{report.headline}</p>}
        </section>
      )}

      {contradictions.length > 0 && (
        <Section title="Your sources disagree" count={contradictions.length} tone="signal">
          <ul className="space-y-3">
            {contradictions.map((check) => (
              <ContradictionBlock key={`${check.claim_type}-${check.metric}`} check={check} />
            ))}
          </ul>
        </Section>
      )}

      <Section title="Public records" count={report ? publicRows.length : undefined} tone="data">
        {!report ? (
          <p className="text-[13px] leading-5 text-graphite">The public-record comparison couldn&rsquo;t be loaded.</p>
        ) : publicRows.length > 0 ? (
          <ul className="space-y-3">
            {publicRows.map((row) => (
              <RecordBlock key={row.signal} row={row} />
            ))}
          </ul>
        ) : (
          <p className="text-[13px] leading-5 text-graphite">No public-record checks yet.</p>
        )}
      </Section>

      <Section title="Questions to ask" count={view.questions.length} tone="data">
        <Questions questions={view.questions} />
      </Section>

      <footer className="mt-12 break-inside-avoid border-t border-rule pt-4 text-[11px] leading-4 text-graphite">
        <p>
          Differences between sources, not findings of wrongdoing. Automated comparison of public records; may be
          incomplete or out of date. Not investment advice.
        </p>
        <p className="mt-1">Every figure links to its source.</p>
        {fictional && <p className="mt-1">{company.name} is a fictional company. All figures are demo data.</p>}
      </footer>
    </article>
  );
}

function Cover({
  name,
  domain,
  fictional,
  generatedAt,
  filer,
  cik,
}: {
  name: string;
  domain: string | null;
  fictional: boolean;
  generatedAt?: string;
  filer?: string;
  cik?: string | null;
}) {
  const meta = [domain, generatedAt && `Generated ${day(generatedAt)}`].filter(Boolean);

  return (
    <header className="break-inside-avoid">
      <div className="flex items-center justify-between gap-3">
        <Wordmark />
        <span className="micro-label text-graphite">Sauce Report</span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- a static local asset; next/image adds nothing here */}
      <img
        src="/art/landscape.webp"
        alt=""
        className="mt-4 h-20 w-full rounded-xl object-cover object-[center_62%]"
      />
      <h1 className="mt-7 font-serif text-[44px] leading-[48px] tracking-[-0.03em] text-ink">
        {name}
        {fictional && (
          <span className="ml-2 align-baseline font-sans text-sm leading-5 font-medium tracking-normal text-graphite">
            (fictional)
          </span>
        )}
      </h1>
      {meta.length > 0 && <p className="mt-2 text-xs leading-4 text-graphite">{meta.join(" · ")}</p>}
      {filer && (
        <p className="mt-0.5 text-[11px] leading-4 text-graphite">
          SEC filer: {filer}
          {cik && <span className="font-mono"> · CIK {cik}</span>}
        </p>
      )}
    </header>
  );
}

function Section({
  title,
  count,
  tone,
  children,
}: {
  title: string;
  count?: number;
  tone: "signal" | "data";
  children: ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="mb-3 break-after-avoid text-sm leading-5 font-medium text-ink">
        {title}{" "}
        {count !== undefined && <span className={tone === "signal" ? "text-signal" : "text-data"}>{count}</span>}
      </h2>
      {children}
    </section>
  );
}

/** One metric the user's own items disagree on: the spread, every value on one line, then each quote. */
function ContradictionBlock({ check }: { check: Check }) {
  const values = check.values ?? [];
  const numbers = values.map((v) => v.value);
  const spread = Math.max(...numbers) - Math.min(...numbers);
  const format = (n: number) => formatValue(n, check.unit);
  // The plot names each dot by item kind ("Deck", "Email") unless two items share a kind.
  const kinds = values.map((v) => v.item_label.split(" · ")[0]);
  const kindsUnique = new Set(kinds).size === kinds.length;

  return (
    <li className="fragment break-inside-avoid px-4 pt-3 pb-1">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="flex items-center gap-1.5 text-sm leading-5 font-medium text-ink">
          <WarningDiamond aria-hidden="true" size={16} weight="duotone" className="shrink-0 self-center text-signal" />
          {metricTitle(check)}
        </h3>
        <p className="flex items-baseline gap-1.5 text-xs leading-4 text-graphite">
          spread
          <span className="font-serif text-2xl leading-7 tracking-[-0.02em] text-signal">{format(spread)}</span>
        </p>
      </div>
      <div className="mt-4">
        <RangePlot
          values={values.map((v, i) => ({ value: v.value, label: kindsUnique ? kinds[i] : v.item_label }))}
          format={format}
        />
      </div>
      <ul className="divide-y divide-rule border-t border-rule">
        {values.map((v) => (
          <li key={`${v.item_label}-${v.value}`} className="flex items-start gap-3 py-2.5">
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] leading-5 font-medium text-ink">
                {v.item_label} <span className="font-normal text-graphite">· {day(v.item_day)}</span>
              </span>
              {v.claim_text && (
                <span className="block text-xs leading-4 text-graphite">&ldquo;{v.claim_text}&rdquo;</span>
              )}
            </span>
            <span className="shrink-0 font-serif text-lg leading-5 tracking-[-0.01em] text-ink">{format(v.value)}</span>
          </li>
        ))}
      </ul>
    </li>
  );
}

/** A public-record row with nothing behind a tap: status, delta, chart, filed vs. said with sources, reasons. */
function RecordBlock({ row }: { row: DeltaRow }) {
  const discrepancy = row.status === "discrepancy";
  const label = STATUS[row.status].label;

  return (
    <li className="fragment break-inside-avoid px-4 py-3.5">
      <div className="relative pl-3">
        {/* The 2px mark carries status by color; the label beside the signal says it in words. */}
        <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-0.5 rounded-full", STATUS[row.status].mark)} />

        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-sm leading-5 font-medium text-ink">{row.signal}</h3>
          <span className={cn("micro-label shrink-0", discrepancy ? "text-signal" : "text-graphite")}>
            {label[0].toUpperCase() + label.slice(1)}
          </span>
        </div>
        <p className="mt-1 text-[13px] leading-5 text-ink">{row.summary}</p>

        {row.visual && (
          <div className="mt-3">
            <DeltaVisual visual={row.visual} discrepancy={discrepancy} />
          </div>
        )}

        <dl className="mt-3 grid grid-cols-2 gap-x-5 border-t border-rule pt-3">
          <ClaimCell label="Filed" claim={row.filed} emptyText="Not in the filing" />
          <ClaimCell label="Said" claim={row.said} emptyText="Not stated publicly" />
        </dl>

        {row.likelyReasons.length > 0 && (
          <div className="mt-3">
            <p className="micro-label text-graphite">{row.likelyReasons.length > 1 ? "Likely reasons" : "Likely reason"}</p>
            <ul className="mt-1 space-y-1 text-[13px] leading-5 text-ink">
              {row.likelyReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </li>
  );
}

function ClaimCell({ label, claim, emptyText }: { label: string; claim: Claim | null; emptyText: string }) {
  const { figure, quote } = claim ? splitQuote(claim.value) : { figure: "", quote: null };

  return (
    <div className="min-w-0">
      <dt className="micro-label text-graphite">{label}</dt>
      <dd className="mt-0.5">
        {claim ? (
          <>
            <p className="font-serif text-lg leading-6 tracking-[-0.01em] text-ink">{figure}</p>
            {quote && <p className="text-xs leading-4 text-graphite">{quote}</p>}
            <SourceRef source={claim.source} />
          </>
        ) : (
          <p className="text-[13px] leading-6 text-graphite">{emptyText}</p>
        )}
      </dd>
    </div>
  );
}

/** A source as a link, with its URL printed under it in print so the PDF stays traceable. */
function SourceRef({ source }: { source: Source }) {
  const web = isWebUrl(source.url);

  return (
    <p className="mt-1 text-[11px] leading-4 text-graphite">
      {web ? (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-data underline decoration-data/30 underline-offset-2 transition-colors duration-150 ease-out hover:decoration-current"
        >
          {source.label}
          <span aria-hidden="true"> ↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ) : (
        // The user's own item (deck, email, notes): named, not linked.
        <span className="font-medium text-ink">{source.label}</span>
      )}
      {" · "}
      {web ? `checked ${day(source.checkedAt)}` : day(source.checkedAt)}
      {web && <span className="mt-0.5 hidden font-mono text-[9px] leading-3 break-all print:block">{source.url}</span>}
    </p>
  );
}

function Questions({ questions }: { questions: Question[] }) {
  if (!questions.length) return <p className="text-[13px] leading-5 text-graphite">No open questions for this company.</p>;

  return (
    <ol className="fragment divide-y divide-rule px-4">
      {questions.map((q, i) => (
        <li key={q.question} className="flex break-inside-avoid gap-3 py-3">
          <span className="w-5 shrink-0 text-right font-serif text-xl leading-5 text-data">{i + 1}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-5 text-ink">{q.question}</p>
            {q.why && <p className="mt-1 text-xs leading-4 text-graphite">{q.why}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
