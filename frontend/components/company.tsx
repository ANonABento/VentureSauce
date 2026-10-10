"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
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
import { ArrowLeft, CaretDown, CheckCircle, Copy, WarningDiamond } from "@phosphor-icons/react/dist/ssr";
import { DUR, EASE_ENTER, EASE_STATE, RISE, SPRING, STAGGER } from "@/lib/motion";
import { Button } from "./button";
import { cn } from "./cn";
import { Collapse } from "./collapse";
import { DeltaRows } from "./delta-rows";
import { CountUp } from "./motion";
import { Verdict } from "./verdict";
import { DropStrip, ItemTag } from "./inbox";
import { ReportHeader } from "./report-header";
import { formatDate, formatUsd } from "./report-utils";
import { RangePlot, SignalStrip } from "./viz";

type Tab = "checks" | "items" | "questions";

const fmt = (value: number, unit: string | null) => (unit === "usd" ? formatUsd(value) : value.toLocaleString("en-US"));

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
        <RangePlot values={values.map((v) => ({ value: v.value, label: v.item_label.split(" · ")[0] }))} format={format} delay={delay + 0.1} />
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
          {values.map((v) => (
            <li key={`${v.item_label}-${v.value}`} className="fragment flex items-center gap-3 px-3 py-2.5">
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

/** One company in the inbox: Checks / Items / Questions. */
export function CompanyScreen({
  companyId,
  filedItemId,
  summary,
  onBack,
  onOpen,
  onDrop,
  busy,
  step,
}: {
  companyId: string;
  filedItemId?: string | null;
  /** The inbox row it was opened from: lets the name and strip glide in before the data loads. */
  summary?: CompanySummary;
  onBack: () => void;
  onOpen: (id: string, filedItemId?: string | null) => void;
  onDrop: (input: { file?: File; text?: string; kind?: "email" | "notes"; companyId?: string }) => void;
  busy?: boolean;
  step?: number;
}) {
  const [view, setView] = useState<CompanyView | null>(null);
  const [report, setReport] = useState<DeltaReport | null>(null);
  const [tab, setTab] = useState<Tab>("checks");
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
      Inbox
    </button>
  );

  const contradictions = view?.checks.filter((c) => c.source === "your_sources") ?? [];
  const publicRows = (report?.rows ?? []).filter((r) => !r.signal.endsWith("across your sources"));
  const discrepancies = view ? publicRows.filter((r) => r.status === "discrepancy").length : (summary?.discrepancies ?? 0);
  const contradictionCount = view ? contradictions.length : (summary?.contradictions ?? 0);
  const name = view ? view.company.name + (view.company.fictional ? " (fictional)" : "") : summary?.name;

  const header = name && (
    <ReportHeader
      layoutId={`company-name-${companyId}`}
      company={{ name, domain: (view?.company.domain ?? summary?.domain) || undefined }}
    >
      <motion.span layoutId={`company-strip-${companyId}`} className="mt-2 mb-1 flex">
        <SignalStrip discrepancies={discrepancies} contradictions={contradictionCount} />
      </motion.span>
    </ReportHeader>
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
        <div aria-hidden="true" className="tray mt-5 h-10 rounded-full" />
        <div aria-hidden="true" className="tray mt-6 h-32" />
      </>
    );
  }

  const disagreeing = (label: string) => contradictions.filter((c) => c.values?.some((v) => label.endsWith(v.item_label.split(" · ").pop() ?? ""))).length;
  const checkCount = contradictions.length + publicRows.length;
  const tabs: [Tab, string, number | null][] = [
    ["checks", "Checks", checkCount || null],
    ["items", "Items", view.items.length],
    ["questions", "Questions", view.questions.length],
  ];

  return (
    <>
      {back}
      {filedItemId && (
        <FiledToast itemId={filedItemId} company={view.company.name} onMoved={(id) => onOpen(id, null)} />
      )}
      {header}
      {view.company.form_d_entity && (
        <p className="mt-1 text-[11px] leading-4 text-graphite">
          SEC filer: {view.company.form_d_entity}
          {view.company.cik && <span className="font-mono"> · CIK {view.company.cik}</span>}
        </p>
      )}

      {/* Segmented control (v2): the white pill slides between tabs on a spring. */}
      {report && report.rows.length > 0 && (
        <div className="mt-4">
          <Verdict rows={report.rows} />
        </div>
      )}

      <div role="tablist" className="mt-5 flex gap-0.5 rounded-full bg-tray-strong p-[3px]">
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
          className="mt-6"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          transition={{ duration: DUR.base, ease: EASE_STATE }}
        >
          {tab === "checks" && (
            <div className="space-y-8">
              {contradictions.length > 0 && (
                <section>
                  <h2 className="mb-2 text-sm leading-5 font-medium text-ink">
                    Your sources disagree <span className="text-signal">{contradictions.length}</span>
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
                  <h2 className="mb-2 text-sm leading-5 font-medium text-ink">
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
                      <p className="mt-1.5 flex items-center gap-2 text-xs leading-4 text-graphite">
                        <span>
                          <span className="font-medium text-ink">{item.claim_count}</span> claim{item.claim_count === 1 ? "" : "s"}
                        </span>
                        {n > 0 && <SignalStrip discrepancies={0} contradictions={n} delay={i * STAGGER} />}
                      </p>
                    </motion.li>
                  );
                })}
              </ol>
              <div className="mt-4">
                <DropStrip busy={busy} step={step} label="Drop another item for this company" onDrop={(input) => onDrop({ ...input, companyId })} />
              </div>
            </>
          )}

          {tab === "questions" && <QuestionCards companyId={companyId} questions={view.questions} />}
        </motion.div>
      </AnimatePresence>

      <footer className="mt-8 text-[11px] leading-4 text-graphite">
        Differences between sources, not findings of wrongdoing. Not investment advice.
      </footer>
    </>
  );
}
