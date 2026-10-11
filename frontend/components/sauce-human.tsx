"use client";

import { type ReactNode, useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CaretDown, ChatCircleDots, Copy, WarningDiamond } from "@phosphor-icons/react/dist/ssr";
import type { Check, CompanyView, Question } from "@/lib/api";
import { DUR, EASE_ENTER, EASE_STATE } from "@/lib/motion";
import { reportFacts } from "@/lib/report-markdown";
import type { DeltaReport, DeltaRow, Source } from "@/lib/types";
import { cn } from "./cn";
import { Collapse } from "./collapse";
import { DeltaVisual } from "./delta-visual";
import { leadingFigure, sourceIcon } from "./delta-row";
import { formatDate, formatUsd } from "./report-utils";
import { STILL_PLOT } from "./sauce-report";
import { STATUS } from "./status";
import { RangePlot } from "./viz";

/*
 * The Sauce Report's Human view (decision 71): visual-first, about 80% less
 * text than the printable report. One ring for the verdict, a range plot per
 * contradiction, a said-vs-found bar pair per public record, the questions as
 * numbered chips. Quotes, reasons and full questions open on tap. Every figure
 * keeps a source: the plot names its items, each record links its sources.
 */

const MONO_FIG = "font-mono font-medium tracking-[-0.04em]";

const formatValue = (value: number, unit: string | null) =>
  unit === "usd" ? formatUsd(value) : unit === "percent" ? `${value}%` : value.toLocaleString("en-US");

function metricTitle(check: Check): string {
  if (check.metric) return check.metric.length <= 4 ? check.metric.toUpperCase() : check.metric[0].toUpperCase() + check.metric.slice(1);
  return check.claim_type === "headcount" ? "Headcount" : "Total raised";
}

export function HumanReport({ view, report }: { view: CompanyView; report: DeltaReport | null }) {
  const { company } = view;
  const facts = reportFacts(view, report);
  const count = (status: DeltaRow["status"]) => facts.publicRows.filter((row) => row.status === status).length;

  return (
    <article aria-label={`Sauce Report for ${company.name}`} className="w-full min-w-0">
      <header>
        <h2 className="font-serif text-[30px] leading-9 tracking-[-0.025em] text-ink [overflow-wrap:anywhere]">
          {company.name}
          {company.fictional && (
            <span className="ml-2 align-baseline font-sans text-sm leading-5 font-medium tracking-normal text-graphite">(fictional)</span>
          )}
        </h2>
        {(company.domain || report?.generatedAt) && (
          <p className="mt-1 text-xs leading-4 text-graphite [overflow-wrap:anywhere]">
            {[company.domain, report?.generatedAt && formatDate(report.generatedAt)].filter(Boolean).join(" · ")}
          </p>
        )}
      </header>

      <VerdictRing
        publicFlags={facts.discrepancies.length}
        yours={facts.contradictions.length}
        consistent={count("consistent")}
        open={count("unverified") + count("not_disclosed")}
      />

      {facts.contradictions.length > 0 && (
        <Block glyph="diamond" title="Your sources disagree" count={facts.contradictions.length}>
          {facts.contradictions.map((check) => (
            <ContradictionCard key={`${check.claim_type}-${check.metric}`} check={check} />
          ))}
        </Block>
      )}

      <Block glyph="dot" title="Public records" count={report ? facts.publicRows.length : undefined}>
        {!report ? (
          <p className="text-[13px] leading-5 text-graphite">The public-record comparison couldn&rsquo;t be loaded.</p>
        ) : facts.publicRows.length ? (
          facts.publicRows.map((row) => <RecordCard key={row.signal} row={row} />)
        ) : (
          <p className="text-[13px] leading-5 text-graphite">No public-record checks yet.</p>
        )}
      </Block>

      <Block glyph="ask" title="Ask the founder" count={view.questions.length}>
        <QuestionChips questions={view.questions} />
      </Block>

      {company.fictional && (
        <p className="mt-6 border-t border-rule pt-3 text-[11px] leading-4 text-graphite">
          {company.name} is a fictional company. All figures are demo data.
        </p>
      )}
    </article>
  );
}

/* ── Verdict ─────────────────────────────────────────────────────────────── */

/**
 * One ring for the whole verdict: flagged (cobalt) against consistent (navy)
 * and open checks (grey). The figure in the middle is the flagged count; the
 * key beside it splits it into public records (●) and your items (◇).
 */
function VerdictRing({ publicFlags, yours, consistent, open }: { publicFlags: number; yours: number; consistent: number; open: number }) {
  const reduce = useReducedMotion();
  const maskId = `ring-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const flagged = publicFlags + yours;
  const total = flagged + consistent + open;
  const parts = [
    { value: flagged, stroke: "stroke-signal" },
    { value: consistent, stroke: "stroke-data" },
    { value: open, stroke: "stroke-graphite/45" },
  ].filter((p) => p.value > 0);
  const gap = parts.length > 1 ? 2 : 0;
  const arcs = parts.reduce<{ start: number; len: number; stroke: string }[]>((acc, p) => {
    const start = acc.length ? acc[acc.length - 1].start + acc[acc.length - 1].len : 0;
    return [...acc, { start, len: (p.value / (total || 1)) * 100, stroke: p.stroke }];
  }, []);
  const label = `${flagged} of ${total} checks flagged: ${publicFlags} with public records, ${yours} between your items. ${consistent} consistent, ${open} unverified.`;

  return (
    <section aria-label="Verdict" className="tray mt-5 flex items-center gap-5">
      <div role="img" aria-label={label} className="relative size-[104px] shrink-0">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
          <defs>
            <mask id={maskId}>
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="white"
                strokeWidth="14"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: DUR.signature, ease: EASE_ENTER, delay: 0.1 }}
              />
            </mask>
          </defs>
          <circle cx="50" cy="50" r="42" fill="none" strokeWidth="10" className="stroke-tray-strong" />
          <g mask={`url(#${maskId})`}>
            {arcs.map((arc) => (
              <circle
                key={arc.stroke}
                cx="50"
                cy="50"
                r="42"
                fill="none"
                strokeWidth="10"
                pathLength={100}
                strokeDasharray={`${Math.max(0, arc.len - gap)} ${100 - Math.max(0, arc.len - gap)}`}
                strokeDashoffset={-arc.start}
                className={arc.stroke}
              />
            ))}
          </g>
        </svg>
        <span aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(MONO_FIG, "text-[34px] leading-9", flagged > 0 ? "text-signal" : "text-ink")}>{flagged}</span>
          <span className="text-[11px] leading-4 text-graphite">of {total}</span>
        </span>
      </div>
      <ul aria-hidden="true" className="min-w-0 space-y-2 text-xs leading-4 text-graphite">
        <KeyLine swatch="bg-signal" value={flagged} word="flagged">
          <span className="mt-1 flex items-center gap-3 text-ink">
            <span className="inline-flex items-center gap-1.5">
              <Glyph kind="dot" />
              <span className="font-mono">{publicFlags}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Glyph kind="diamond" />
              <span className="font-mono">{yours}</span>
            </span>
          </span>
        </KeyLine>
        <KeyLine swatch="bg-data" value={consistent} word="consistent" />
        {open > 0 && <KeyLine swatch="bg-graphite/45" value={open} word="unverified" />}
      </ul>
    </section>
  );
}

function KeyLine({ swatch, value, word, children }: { swatch: string; value: number; word: string; children?: ReactNode }) {
  return (
    <li>
      <span className="flex items-center gap-2">
        <span className={cn("h-2 w-2 shrink-0 rounded-full", swatch)} />
        <span className={cn(MONO_FIG, "text-base leading-5 text-ink")}>{value}</span>
        {word}
      </span>
      {children && <span className="block pl-4">{children}</span>}
    </li>
  );
}

function Glyph({ kind }: { kind: "dot" | "diamond" | "ask" }) {
  if (kind === "ask") return <ChatCircleDots aria-hidden="true" size={15} weight="duotone" className="text-data" />;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block shrink-0",
        kind === "dot" ? "h-[7px] w-[7px] rounded-full bg-signal" : "mx-px h-[6px] w-[6px] rotate-45 border-[1.25px] border-signal",
      )}
    />
  );
}

function Block({ glyph, title, count, children }: { glyph: "dot" | "diamond" | "ask"; title: string; count?: number; children: ReactNode }) {
  return (
    <section className="mt-7">
      <h3 className="mb-2.5 flex items-center gap-2 text-sm leading-5 font-medium text-ink">
        <Glyph kind={glyph} />
        {title}
        {count !== undefined && <span className={cn("font-mono", glyph === "ask" ? "text-data" : "text-signal")}>{count}</span>}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

/* ── Contradictions ──────────────────────────────────────────────────────── */

/** One metric your items disagree on: the spread, then the range plot naming each item. Quotes on tap. */
function ContradictionCard({ check }: { check: Check }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const values = check.values ?? [];
  const numbers = values.map((v) => v.value);
  const spread = Math.max(...numbers) - Math.min(...numbers);
  const format = (n: number) => formatValue(n, check.unit);
  // Dots are named by item kind ("Deck", "Email") unless two items share a kind.
  const kinds = values.map((v) => v.item_label.split(" · ")[0]);
  const kindsUnique = new Set(kinds).size === kinds.length;

  return (
    <div className="fragment px-3.5 pt-3 pb-2">
      <div className="flex items-start justify-between gap-3">
        <h4 className="flex min-w-0 items-center gap-1.5 font-serif text-lg leading-6 text-ink">
          <WarningDiamond aria-hidden="true" size={16} weight="duotone" className="shrink-0 text-signal" />
          {metricTitle(check)}
        </h4>
        <p className="flex shrink-0 flex-col items-end">
          <span className={cn(MONO_FIG, "text-[26px] leading-8 text-signal")}>{format(spread)}</span>
          <span className="text-[11px] leading-4 text-graphite">spread</span>
        </p>
      </div>
      <div className={cn("mt-3 overflow-x-clip", STILL_PLOT)}>
        <RangePlot figure="mono" values={values.map((v, i) => ({ value: v.value, label: kindsUnique ? kinds[i] : v.item_label }))} format={format} />
      </div>
      <TapToggle open={open} onToggle={() => setOpen((o) => !o)} controls={id} label={`${values.length} quotes`} />
      <Collapse id={id} open={open}>
        <ul className="divide-y divide-rule border-t border-rule">
          {values.map((v) => (
            <li key={`${v.item_label}-${v.value}`} className="flex items-start gap-3 py-2">
              <span className="min-w-0 flex-1 text-xs leading-4 text-graphite [overflow-wrap:anywhere]">
                <span className="block font-medium text-ink">
                  {v.item_label} <span className="font-normal text-graphite">· {formatDate(v.item_day)}</span>
                </span>
                {v.claim_text && <>&ldquo;{v.claim_text}&rdquo;</>}
              </span>
              <span className={cn(MONO_FIG, "shrink-0 text-sm leading-5 text-ink")}>{format(v.value)}</span>
            </li>
          ))}
        </ul>
      </Collapse>
    </div>
  );
}

function TapToggle({ open, onToggle, controls, label }: { open: boolean; onToggle: () => void; controls: string; label: string }) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      onClick={onToggle}
      className="mt-1 inline-flex min-h-8 items-center gap-1 text-xs font-medium text-graphite transition-colors duration-150 hover:text-ink"
    >
      {label}
      <CaretDown aria-hidden="true" size={12} weight="light" className={cn("transition-transform duration-150 ease-out", open && "rotate-180")} />
    </button>
  );
}

/* ── Public records ──────────────────────────────────────────────────────── */

/** "+$13M", "−3": the found figure minus the said one, signed. */
function signedDelta(found: number, said: number, usd: boolean): string {
  const diff = found - said;
  const sign = diff > 0 ? "+" : diff < 0 ? "−" : "";
  const size = Math.abs(diff);
  return `${sign}${usd ? formatUsd(size) : size.toLocaleString("en-US")}`;
}

/** A public record: sources as icons, the delta in large mono, then said vs found as two bars. Reasons on tap. */
function RecordCard({ row }: { row: DeltaRow }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const discrepancy = row.status === "discrepancy";
  const said = leadingFigure(row.said);
  const found = leadingFigure(row.filed);
  const foundName = /SEC|Form [A-Z0-9]/.test(row.filed?.source.label ?? "SEC") ? "Filed" : "Found";
  const sources = [row.filed?.source, row.said?.source].filter((s): s is Source => Boolean(s));
  const usd = /\$/.test(`${said?.label}${found?.label}`);
  const status = STATUS[row.status].label;

  return (
    <div className="fragment px-3.5 pt-3 pb-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="font-serif text-lg leading-6 text-ink [overflow-wrap:anywhere]">{row.signal}</h4>
          <p className={cn("micro-label mt-0.5", discrepancy ? "text-signal" : "text-graphite")}>
            {status[0].toUpperCase() + status.slice(1)}
          </p>
        </div>
        {said && found && (
          <p className="flex shrink-0 flex-col items-end">
            <span className={cn(MONO_FIG, "text-[26px] leading-8", discrepancy ? "text-signal" : "text-data")}>
              {signedDelta(found.value, said.value, usd)}
            </span>
            <span className="text-[11px] leading-4 text-graphite">vs said</span>
          </p>
        )}
      </div>

      {said && found ? (
        <BarPair said={said} found={found} foundName={foundName} discrepancy={discrepancy} />
      ) : row.visual ? (
        <div className="mt-3">
          <DeltaVisual visual={row.visual} discrepancy={discrepancy} />
        </div>
      ) : (
        row.summaryShort && <p className="mt-2 text-[13px] leading-5 text-ink">{row.summaryShort}</p>
      )}

      <div className="mt-2 flex items-center justify-between gap-2">
        <SourceIcons sources={sources} />
        <TapToggle open={open} onToggle={() => setOpen((o) => !o)} controls={id} label="Details" />
      </div>
      <Collapse id={id} open={open}>
        <div className="space-y-1.5 border-t border-rule pt-2 pb-1 text-xs leading-4 text-graphite [overflow-wrap:anywhere]">
          <p className="text-[13px] leading-5 text-ink">{row.summary}</p>
          {row.filed && <p>{foundName}: <span className="text-ink">{row.filed.value}</span> · {row.filed.source.label}, checked {formatDate(row.filed.source.checkedAt)}</p>}
          {row.said && <p>Said: <span className="text-ink">{row.said.value}</span> · {row.said.source.label}</p>}
          {row.likelyReasons.map((reason) => (
            <p key={reason}>{reason}</p>
          ))}
        </div>
      </Collapse>
    </div>
  );
}

/** Said and found on one scale, each bar with its figure. The figures are text; the bars are decorative. */
function BarPair({
  said,
  found,
  foundName,
  discrepancy,
}: {
  said: { label: string; value: number };
  found: { label: string; value: number };
  foundName: string;
  discrepancy: boolean;
}) {
  const reduce = useReducedMotion();
  const max = Math.max(said.value, found.value) || 1;
  const bars = [
    { name: "Said", fig: said, fill: "bg-ink" },
    { name: foundName, fig: found, fill: discrepancy ? "bg-signal" : "bg-data" },
  ];
  return (
    <dl className="mt-3 grid grid-cols-[44px_1fr_auto] items-center gap-x-2.5 gap-y-1.5">
      {bars.map((bar, i) => (
        <div key={bar.name} className="contents">
          <dt className="text-[11px] leading-4 text-graphite">{bar.name}</dt>
          <span aria-hidden="true" className="relative h-2 overflow-hidden rounded-full bg-tray-strong">
            <motion.span
              className={cn("absolute inset-y-0 left-0 origin-left rounded-full", bar.fill)}
              style={{ width: `${(bar.fig.value / max) * 100}%` }}
              initial={reduce ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: DUR.reveal, ease: EASE_STATE, delay: 0.1 + i * 0.12 }}
            />
          </span>
          <dd className={cn(MONO_FIG, "text-right text-sm leading-5 text-ink")}>{bar.fig.label}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Sources as icon links (decision 41): the name and date in the tooltip and the accessible label. */
function SourceIcons({ sources }: { sources: Source[] }) {
  return (
    <p className="flex items-center gap-1">
      {sources.map((source, index) => {
        const Icon = sourceIcon(source.label);
        if (!/^https?:\/\//i.test(source.url)) {
          return (
            <span key={index} title={source.label} className="flex h-7 w-7 items-center justify-center rounded-full bg-tray text-graphite">
              <Icon aria-hidden="true" size={14} weight="duotone" />
              <span className="sr-only">{source.label}</span>
            </span>
          );
        }
        return (
          <a
            key={index}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`${source.label} · checked ${formatDate(source.checkedAt)}`}
            aria-label={`${source.label}, checked ${formatDate(source.checkedAt)} (opens in a new tab)`}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-tray text-data transition-colors duration-150 ease-out hover:bg-tray-strong"
          >
            <Icon aria-hidden="true" size={14} weight="duotone" />
          </a>
        );
      })}
    </p>
  );
}

/* ── Questions ───────────────────────────────────────────────────────────── */

/** Numbered chips, one line each; a tap opens the full question, why it's asked, and Copy. */
function QuestionChips({ questions }: { questions: Question[] }) {
  if (!questions.length) return <p className="text-[13px] leading-5 text-graphite">No open questions for this company.</p>;
  return (
    <ol className="space-y-1.5">
      {questions.map((q, i) => (
        <QuestionChip key={q.question} index={i + 1} question={q} />
      ))}
    </ol>
  );
}

function QuestionChip({ index, question }: { index: number; question: Question }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");
  const id = useId();

  async function copy() {
    try {
      await navigator.clipboard.writeText(question.question);
      setCopied("done");
    } catch {
      setCopied("failed");
    }
    window.setTimeout(() => setCopied("idle"), 1600);
  }

  return (
    <li className={cn("rounded-[18px] transition-colors duration-150", open ? "fragment" : "bg-tray")}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-9 w-full items-center gap-2.5 rounded-[18px] py-1 pr-3 pl-1 text-left"
      >
        <span className={cn(MONO_FIG, "flex size-7 shrink-0 items-center justify-center rounded-full bg-surface text-[13px] text-data")}>
          {index}
        </span>
        <span className={cn("min-w-0 flex-1 text-[13px] leading-5 text-ink", !open && "truncate")}>{question.question}</span>
        <CaretDown aria-hidden="true" size={12} weight="light" className={cn("shrink-0 text-graphite transition-transform duration-150", open && "rotate-180")} />
      </button>
      <Collapse id={id} open={open}>
        <div className="flex items-end justify-between gap-3 px-3 pb-2.5 pl-[46px]">
          {question.why && <p className="min-w-0 text-xs leading-4 text-graphite">{question.why}</p>}
          <button
            type="button"
            onClick={copy}
            className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border border-rule-strong bg-surface px-2.5 text-xs font-medium text-ink transition-colors duration-150 hover:bg-tray"
          >
            <Copy aria-hidden="true" size={13} weight="light" />
            {copied === "done" ? "Copied" : copied === "failed" ? "Select to copy" : "Copy"}
            <span className="sr-only"> question {index}</span>
          </button>
        </div>
      </Collapse>
    </li>
  );
}
