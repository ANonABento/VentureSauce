"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  API,
  DEFAULT_API,
  WORKSPACE,
  type Check,
  type CompanySummary,
  type CompanyView,
  type Question,
  getCompany,
  getReport,
  listCompanies,
  moveItem,
} from "@/lib/api";
import type { DeltaReport } from "@/lib/types";
import { ArrowLeft, CaretDown, ChatCircleDots, CheckCircle, Copy, DownloadSimple, WarningDiamond } from "@phosphor-icons/react/dist/ssr";
import { DUR, EASE_ENTER, EASE_STATE, RISE, SPRING, STAGGER } from "@/lib/motion";
import { Button } from "./button";
import { cn } from "./cn";
import { Collapse } from "./collapse";
import { DeltaRows } from "./delta-rows";
import { CountUp } from "./motion";
import { DropStrip, ItemTag } from "./inbox";
import { InfoTip } from "./info-tip";
import { PulsePlot, pulseSeries } from "./pulse";
import { ReportHeader } from "./report-header";
import { formatDate, formatUsd } from "./report-utils";
import { RangePlot, SignalStrip } from "./viz";

const fmt = (value: number, unit: string | null) =>
  unit === "usd" ? formatUsd(value) : unit === "percent" ? `${value.toLocaleString("en-US")}%` : value.toLocaleString("en-US");

/** "Filed under Acme AI · Change": filing to the wrong company is the costliest inbox mistake, so it's always undoable. */
export function FiledToast({
  itemId,
  company,
  onMoved,
}: {
  itemId: string;
  company: string;
  onMoved: (companyId: string) => void;
}) {
  const [changing, setChanging] = useState(false);
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    if (changing) listCompanies().then(setCompanies).catch(() => {});
  }, [changing]);

  async function move(target: { companyId?: string; newCompany?: string }) {
    const { company_id } = await moveItem(itemId, target);
    setChanging(false);
    onMoved(company_id);
  }

  return (
    <div role="status" className={cn("mb-4 bg-ink px-4 py-2 text-[13px] leading-5 text-paper", changing ? "rounded-xl" : "rounded-full")}>
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 text-paper/80">
          <CheckCircle aria-hidden="true" size={16} weight="light" className="shrink-0 text-paper" />
          <span className="truncate">
            Filed under <span className="font-medium text-paper">{company}</span>
          </span>
        </span>
        <button type="button" className="shrink-0 text-xs font-medium text-paper underline underline-offset-4" onClick={() => setChanging(!changing)}>
          {changing ? "Cancel" : "Change"}
        </button>
      </div>
      {changing && (
        <div className="mt-2 space-y-1 border-t border-paper/20 pt-2">
          {companies
            .filter((c) => c.name !== company)
            .map((c) => (
              <button key={c.id} type="button" className="block text-left text-paper hover:underline" onClick={() => move({ companyId: c.id })}>
                {c.name}
              </button>
            ))}
          <form
            className="flex gap-2 pt-1"
            onSubmit={(event) => {
              event.preventDefault();
              if (name.trim()) move({ newCompany: name.trim() });
            }}
          >
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="New company name"
              className="h-7 min-w-0 flex-1 rounded-full border border-paper/30 bg-paper px-3 text-xs text-ink"
            />
            <Button type="submit" variant="quiet" size="xs">
              Move
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

/**
 * A contradiction between the investor's own sources (decision 29): the
 * spread counts up, every value sits on one number line naming its item, and
 * the quotes wait behind a tap.
 */
export function ContradictionCard({ check, index = 0 }: { check: Check; index?: number }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const values = check.values ?? [];
  const nums = values.map((v) => v.value);
  const lo = Math.min(...nums);
  const hi = Math.max(...nums);
  const format = (n: number) => fmt(n, check.unit);
  const title = check.metric
    ? check.metric.length <= 4
      ? check.metric.toUpperCase()
      : check.metric[0].toUpperCase() + check.metric.slice(1)
    : check.claim_type === "headcount"
      ? "Headcount"
      : "Total raised";
  const delay = 0.1 + index * STAGGER;

  return (
    <motion.li
      className="tray"
      initial={{ opacity: 0, y: RISE }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.reveal, ease: EASE_ENTER, delay }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-sm leading-5 font-medium text-ink">
          <WarningDiamond aria-hidden="true" size={16} weight="duotone" className="shrink-0 text-signal" />
          {title}
        </span>
        <span className="flex items-baseline gap-1.5 text-xs text-graphite">
          spread
          <CountUp value={hi - lo} format={format} delay={delay + 0.3} className="font-serif text-xl leading-6 text-signal" />
        </span>
      </div>
      <div className="fragment mt-3 px-3 pt-4 pb-1">
        <RangePlot values={values.map((v) => ({ value: v.value, label: v.item_label.split(" · ").pop() ?? v.item_label }))} format={format} delay={delay + 0.1} />
      </div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="mt-2.5 inline-flex min-h-6 items-center gap-1 text-xs font-medium text-graphite transition-colors duration-150 hover:text-ink"
      >
        {values.length} sources
        <CaretDown
          aria-hidden="true"
          size={12}
          weight="light"
          className={cn("transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]", open && "rotate-180")}
        />
      </button>
      <Collapse id={id} open={open}>
        <ul className="space-y-1.5 pt-2">
          {values.map((v, i) => (
            <li key={i} className="fragment flex items-center gap-3 px-3 py-2.5">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] leading-5 font-medium text-ink">
                  {v.item_label} <span className="font-normal text-graphite">· {formatDate(v.item_day)}</span>
                </span>
                {v.claim_text && <span className="block truncate text-xs leading-4 text-graphite">&ldquo;{v.claim_text}&rdquo;</span>}
              </span>
              <span className="shrink-0 font-serif text-lg leading-6 text-ink">{format(v.value)}</span>
            </li>
          ))}
        </ul>
      </Collapse>
    </motion.li>
  );
}

function QuestionCards({ companyId, questions }: { companyId: string; questions: Question[] }) {
  const key = `vs-asked-${companyId}`;
  // Mounted only on the client (after the company loads), so reading storage up front is safe.
  const [asked, setAsked] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(key) ?? "[]");
    } catch {
      return [];
    }
  });
  const [copied, setCopied] = useState<number | "all" | null>(null);

  function toggle(q: string) {
    const next = asked.includes(q) ? asked.filter((x) => x !== q) : [...asked, q];
    setAsked(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
  }

  async function copy(text: string, which: number | "all") {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 1200);
  }

  if (!questions.length) return <p className="text-[13px] text-graphite">No open questions for this company.</p>;
  return (
    <>
      <div className="flex justify-end">
        <Button variant="quiet" size="xs" onClick={() => copy(questions.map((q, i) => `${i + 1}. ${q.question}`).join("\n"), "all")}>
          {copied === "all" ? "Copied" : "Copy all"}
        </Button>
      </div>
      {/* One fragment, ruled rows (v2): serif index in data blue, the "why" names the sources. */}
      <ol className="fragment mt-3 divide-y divide-rule px-3">
        {questions.map((q, i) => {
          const done = asked.includes(q.question);
          return (
            <motion.li
              key={q.question}
              className={cn("flex gap-3 py-3 transition-opacity duration-300", done && "opacity-60")}
              initial={{ opacity: 0, y: RISE / 2 }}
              animate={{ opacity: done ? 0.6 : 1, y: 0 }}
              transition={{ duration: DUR.reveal, ease: EASE_ENTER, delay: 0.05 + i * STAGGER }}
            >
              <span className="w-4 shrink-0 text-right font-serif text-lg leading-5 text-data">{i + 1}</span>
              <div className="min-w-0 flex-1">
              <p className="text-sm leading-5 text-ink">{q.question}</p>
              <div className="mt-1.5 flex items-center justify-between gap-3">
                <span className="text-xs leading-4 text-graphite">{q.why}</span>
                <span className="flex shrink-0 gap-3 text-xs">
                  <button type="button" className="inline-flex min-h-6 items-center gap-1 text-ink underline-offset-4 hover:underline" onClick={() => copy(q.question, i)}>
                    <Copy aria-hidden="true" size={14} weight="light" />
                    {copied === i ? "Copied" : "Copy"}
                  </button>
                  <button type="button" className="text-ink underline-offset-4 hover:underline" onClick={() => toggle(q.question)}>
                    {done ? "Asked ✓" : "Mark asked"}
                  </button>
                </span>
              </div>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </>
  );
}

export type CompanyTab = "checks" | "items" | "questions";

/** A figure tile on the company screen; tapping it opens the matching details. */
function NumberTile({
  glyph,
  value,
  caption,
  onClick,
  active,
  index,
}: {
  glyph: "dot" | "diamond" | "question";
  value: number;
  caption: string;
  onClick: () => void;
  active: boolean;
  index: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "fragment flex flex-col items-start px-3 py-2.5 text-left transition-shadow duration-150",
        active && "outline-1 outline-data/40",
      )}
      initial={{ opacity: 0, y: RISE }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.reveal, ease: EASE_ENTER, delay: 0.15 + index * STAGGER }}
    >
      {glyph === "question" ? (
        <ChatCircleDots aria-hidden="true" size={13} weight="duotone" className="text-data" />
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            "mt-[3px] block",
            glyph === "dot" ? "h-[7px] w-[7px] rounded-full bg-signal" : "mx-px h-[6px] w-[6px] rotate-45 border-[1.25px] border-signal",
          )}
        />
      )}
      <CountUp
        value={value}
        delay={0.2 + index * STAGGER}
        className={cn("mt-1.5 font-serif text-[26px] leading-7", glyph !== "question" && value > 0 ? "text-signal" : "text-ink")}
      />
      <span className="text-[11px] leading-4 text-graphite">{caption}</span>
    </motion.button>
  );
}

/** Actions (decision 50): the top question with Copy, and the way to add another item. */
function TopQuestion({ question, onAll }: { question: Question; onAll: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex gap-2.5">
      <span className="w-3 shrink-0 text-right font-serif text-base leading-5 text-data">1</span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] leading-5 text-ink">{question.question}</p>
        <div className="mt-2 flex items-center gap-3 text-xs">
          <button
            type="button"
            className="inline-flex min-h-6 items-center gap-1 font-medium text-ink underline-offset-4 hover:underline"
            onClick={async () => {
              await navigator.clipboard.writeText(question.question);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
          >
            <Copy aria-hidden="true" size={14} weight="light" />
            {copied ? "Copied" : "Copy"}
          </button>
          <button type="button" onClick={onAll} className="min-h-6 font-medium text-graphite hover:text-ink">
            All questions
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * One company (decision 50, the wireframe's "pulse check"): pulse plot,
 * three figures, a one-line summary, actions, then the details.
 */
export function CompanyScreen({
  companyId,
  filedItemId,
  summary,
  initialTab = "checks",
  backLabel = "Home",
  onBack,
  onOpen,
  onDrop,
  busy,
  step,
}: {
  companyId: string;
  filedItemId?: string | null;
  /** The row it was opened from: lets the name and strip glide in before the data loads. */
  summary?: CompanySummary;
  initialTab?: CompanyTab;
  backLabel?: string;
  onBack: () => void;
  onOpen: (id: string, filedItemId?: string | null) => void;
  onDrop: (input: { file?: File; text?: string; kind?: "email" | "notes"; companyId?: string }) => void;
  busy?: boolean;
  step?: number;
}) {
  const [view, setView] = useState<CompanyView | null>(null);
  const [report, setReport] = useState<DeltaReport | null>(null);
  const [tab, setTab] = useState<CompanyTab>(initialTab);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    Promise.all([getCompany(companyId), getReport({ companyId }).catch(() => null)])
      .then(([v, r]) => {
        if (!live) return;
        setView(v);
        setReport(r);
        try {
          localStorage.setItem(`vs-seen-${companyId}`, new Date().toISOString());
        } catch {}
      })
      .catch((e) => live && setError(e.message));
    return () => {
      live = false;
    };
  }, [companyId, filedItemId]);

  const back = (
    <button
      type="button"
      onClick={onBack}
      className="group mb-3 inline-flex min-h-6 items-center gap-1 text-[13px] text-graphite transition-colors duration-150 hover:text-ink"
    >
      <ArrowLeft aria-hidden="true" size={14} weight="light" className="transition-transform duration-150 ease-out group-hover:-translate-x-0.5" />
      {backLabel}
    </button>
  );

  const contradictions = view?.checks.filter((c) => c.source === "your_sources") ?? [];
  const publicRows = (report?.rows ?? []).filter((r) => !r.signal.endsWith("across your sources"));
  // Without the report (it failed or is loading), keep the counts the row showed rather than claiming "nothing flagged".
  const discrepancies = report ? publicRows.filter((r) => r.status === "discrepancy").length : (summary?.discrepancies ?? 0);
  const contradictionCount = view ? contradictions.length : (summary?.contradictions ?? 0);
  const name = view ? view.company.name + (view.company.fictional ? " (fictional)" : "") : summary?.name;
  // The report opens in a normal tab, whose storage may not be the extension iframe's: pass the inbox (and a custom backend) along.
  const sauceHref = `/sauce?${new URLSearchParams({
    company: companyId,
    ws: WORKSPACE,
    ...(API !== DEFAULT_API ? { api: API } : {}),
  })}`;

  const header = name && (
    <div className="flex items-start justify-between gap-3">
      <ReportHeader
        layoutId={`company-name-${companyId}`}
        company={{ name, domain: (view?.company.domain ?? summary?.domain) || undefined }}
      >
        <motion.span layoutId={`company-strip-${companyId}`} className="mt-2 mb-1 flex">
          <SignalStrip discrepancies={discrepancies} contradictions={contradictionCount} />
        </motion.span>
      </ReportHeader>
      <span className="mt-1 flex shrink-0 items-center gap-1">
        {view?.company.form_d_entity && (
          <InfoTip label="Matched SEC filer">
            Matched SEC filer: <span className="text-ink">{view.company.form_d_entity}</span>
            {view.company.cik && <span className="font-mono"> · CIK {view.company.cik}</span>}
          </InfoTip>
        )}
        <a
          href={sauceHref}
          target="_blank"
          rel="noopener noreferrer"
          title="Sauce Report (PDF)"
          aria-label="Sauce Report, PDF (opens in a new tab)"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-rule-strong bg-surface text-ink transition-colors duration-150 hover:bg-tray"
        >
          <DownloadSimple aria-hidden="true" size={15} weight="light" />
        </a>
      </span>
    </div>
  );

  if (error) {
    return (
      <>
        {back}
        <p className="text-[13px] text-graphite">{error}</p>
      </>
    );
  }
  if (!view) {
    return (
      <>
        {back}
        {header}
        <p role="status" className="sr-only">Loading</p>
        <div aria-hidden="true" className="tray mt-5 h-[150px]" />
        <div aria-hidden="true" className="mt-3 grid grid-cols-3 gap-2">
          <div className="tray h-20" />
          <div className="tray h-20" />
          <div className="tray h-20" />
        </div>
      </>
    );
  }

  const series = pulseSeries(view);
  const disagreeing = (label: string) => contradictions.filter((c) => c.values?.some((v) => label.endsWith(v.item_label.split(" · ").pop() ?? ""))).length;
  const checkCount = contradictions.length + publicRows.length;
  const tabs: [CompanyTab, string, number | null][] = [
    ["checks", "Checks", checkCount || null],
    ["items", "Items", view.items.length],
    ["questions", "Questions", view.questions.length],
  ];
  const open = (next: CompanyTab) => {
    setTab(next);
    document.getElementById(`details-${companyId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {back}
      {filedItemId && (
        <FiledToast itemId={filedItemId} company={view.company.name} onMoved={(id) => onOpen(id, null)} />
      )}
      {header}

      {/* The screen's one hero tray: the pulse. */}
      <motion.section
        aria-labelledby={`pulse-${companyId}`}
        className="tray mt-5"
        initial={{ opacity: 0, y: RISE }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DUR.reveal, ease: EASE_ENTER, delay: 0.05 }}
      >
        <h2 id={`pulse-${companyId}`} className="flex items-baseline justify-between gap-3 text-xs leading-4 font-medium text-graphite">
          <span>
            Pulse <span className="text-ink">· {series ? series.metric : "items"}</span>
          </span>
          <span className="font-normal">{view.items.length} items</span>
        </h2>
        {series ? (
          <div className="mt-4">
            <PulsePlot series={series} />
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2 text-xs leading-4 text-graphite">
            <CheckCircle aria-hidden="true" size={14} weight="light" className="text-steady" />
            Your items agree on every figure
          </div>
        )}
      </motion.section>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <NumberTile glyph="dot" value={discrepancies} caption="vs public" onClick={() => open("checks")} active={false} index={0} />
        <NumberTile glyph="diamond" value={contradictionCount} caption="between items" onClick={() => open("checks")} active={false} index={1} />
        <NumberTile glyph="question" value={view.questions.length} caption="to ask" onClick={() => open("questions")} active={false} index={2} />
      </div>

      {report?.headline && <p className="mt-4 text-[13px] leading-5 text-graphite">{report.headline}</p>}

      {view.questions[0] && (
        <motion.section
          aria-label="Next step"
          className="fragment mt-4 px-3.5 py-3"
          initial={{ opacity: 0, y: RISE }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.reveal, ease: EASE_ENTER, delay: 0.3 }}
        >
          <TopQuestion question={view.questions[0]} onAll={() => open("questions")} />
        </motion.section>
      )}

      <div id={`details-${companyId}`} className="scroll-mt-14" />
      {/* Segmented control (v2): the white pill slides between tabs on a spring. */}
      <div role="tablist" aria-label="Details" className="mt-6 flex gap-0.5 rounded-full bg-tray-strong p-[3px]">
        {tabs.map(([id, label, count]) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "relative flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full text-[13px] font-medium transition-colors duration-150 ease-out",
              tab === id ? "text-ink" : "text-graphite hover:text-ink",
            )}
          >
            {tab === id && (
              <motion.span
                layoutId={`tab-pill-${companyId}`}
                className="fragment absolute inset-0 z-0"
                style={{ borderRadius: 9999 }}
                transition={SPRING}
              />
            )}
            {/* Labels stack above the pill: mid-slide it passes under its neighbours' text. */}
            <span className="relative z-10">{label}</span>
            {count !== null && <span className="relative z-10 text-data">{count}</span>}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          className="mt-5"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          transition={{ duration: DUR.base, ease: EASE_STATE }}
        >
          {tab === "checks" && (
            <div className="space-y-8">
              {contradictions.length > 0 && (
                <section>
                  <h2 className="mb-2 flex items-center gap-2 text-sm leading-5 font-medium text-ink">
                    <span aria-hidden="true" className="mx-px block h-[6px] w-[6px] rotate-45 border-[1.25px] border-signal" />
                    Between your items <span className="text-signal">{contradictions.length}</span>
                  </h2>
                  <ul className="space-y-3">
                    {contradictions.map((c, i) => (
                      <ContradictionCard key={`${c.claim_type}-${c.metric}`} check={c} index={i} />
                    ))}
                  </ul>
                </section>
              )}
              {publicRows.length > 0 ? (
                <section>
                  <h2 className="mb-2 flex items-center gap-2 text-sm leading-5 font-medium text-ink">
                    <span aria-hidden="true" className="block h-[7px] w-[7px] rounded-full bg-signal" />
                    Public records <span className="text-data">{publicRows.length}</span>
                  </h2>
                  <DeltaRows rows={publicRows} />
                </section>
              ) : (
                <p className="text-[13px] text-graphite">No public-record checks yet.</p>
              )}
            </div>
          )}

          {tab === "items" && (
            <>
              <ol className="space-y-2">
                {[...view.items].reverse().map((item, i) => {
                  const n = disagreeing(item.label);
                  return (
                    <motion.li
                      key={item.id}
                      className="fragment px-3 py-3"
                      initial={{ opacity: 0, y: RISE / 2 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: DUR.reveal, ease: EASE_ENTER, delay: i * STAGGER }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-2">
                          <ItemTag kind={item.kind} />
                          <span className="truncate text-[13px] text-ink">{item.label}</span>
                        </span>
                        <span className="shrink-0 text-[11px] text-graphite">{formatDate(item.item_date ?? item.received_at)}</span>
                      </div>
                      {/* One dot per claim found in the item; the diamonds are the ones another item disputes. */}
                      <p
                        role="img"
                        aria-label={`${item.claim_count} ${item.claim_count === 1 ? "claim" : "claims"}${n ? `, ${n} disputed by another item` : ""}`}
                        className="mt-2 flex flex-wrap items-center gap-[5px]"
                      >
                        {Array.from({ length: Math.min(item.claim_count, 24) }, (_, k) => (
                          <span key={k} aria-hidden="true" className="block h-[5px] w-[5px] rounded-full bg-data/45" />
                        ))}
                        {n > 0 && <SignalStrip discrepancies={0} contradictions={n} delay={i * STAGGER} className="ml-1" />}
                      </p>
                    </motion.li>
                  );
                })}
              </ol>
              <div className="mt-4">
                <DropStrip busy={busy} step={step} label="Drop another item" onDrop={(input) => onDrop({ ...input, companyId })} />
              </div>
            </>
          )}

          {tab === "questions" && <QuestionCards companyId={companyId} questions={view.questions} />}
        </motion.div>
      </AnimatePresence>

      {/* The wireframe's DOWNLOAD: the whole check as a branded PDF. */}
      <div className="mt-8 flex justify-end">
        <a
          href={sauceHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center gap-2 rounded-full bg-ink px-4 text-[13px] font-medium text-paper transition-colors duration-150 hover:bg-ink/90"
        >
          <DownloadSimple aria-hidden="true" size={15} weight="light" />
          Download Sauce Report
          <span className="sr-only"> (PDF, opens in a new tab)</span>
        </a>
      </div>
    </>
  );
}
