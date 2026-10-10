"use client";

import { useEffect, useState } from "react";
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
import { CheckCircle, Copy, WarningDiamond } from "@phosphor-icons/react/dist/ssr";
import { Button } from "./button";
import { cn } from "./cn";
import { DeltaRows } from "./delta-rows";
import { DropStrip, ItemTag } from "./inbox";
import { ReportHeader } from "./report-header";
import { formatDate, formatUsd } from "./report-utils";

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
            <Button type="submit" variant="quiet" className="h-7 px-3 text-xs">
              Move
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

/** A contradiction between the investor's own sources: every value on one number line, each naming its item and date. */
export function ContradictionCard({ check }: { check: Check }) {
  const values = check.values ?? [];
  const nums = values.map((v) => v.value);
  const lo = Math.min(...nums);
  const hi = Math.max(...nums);
  const title = check.metric
    ? check.metric.length <= 4
      ? check.metric.toUpperCase()
      : check.metric[0].toUpperCase() + check.metric.slice(1)
    : check.claim_type === "headcount"
      ? "Headcount"
      : "Total raised";

  // The values as an equation, in the order the items arrived; the spread in brick.
  return (
    <li className="tray">
      <div className="flex items-center justify-between gap-3 text-sm leading-5">
        <span className="flex items-center gap-1.5 font-medium text-ink">
          <WarningDiamond aria-hidden="true" size={16} weight="duotone" className="shrink-0 text-signal" />
          {title}
        </span>
        <span className="text-xs text-signal">Your sources disagree</span>
      </div>
      <p className="mt-3 flex flex-wrap items-start gap-x-3 gap-y-2" aria-label={values.map((v) => `${v.item_label}: ${fmt(v.value, check.unit)}`).join("; ")}>
        {values.map((v, i) => (
          <span key={`${v.item_label}-${v.value}`} className="flex items-start gap-3" aria-hidden="true">
            {i > 0 && <span className="pt-3 font-serif text-2xl leading-none text-rule-strong">·</span>}
            <span className="flex flex-col">
              <span className="font-serif text-[44px] leading-[48px] tracking-[-0.03em] text-ink">{fmt(v.value, check.unit)}</span>
              <span className="max-w-[9em] truncate text-xs leading-4 text-graphite">{v.item_label.split(" · ")[0]}</span>
            </span>
          </span>
        ))}
      </p>
      <p className="mt-3 text-sm leading-5 font-medium text-signal">
        Spread of {fmt(hi - lo, check.unit)}
        <span className="ml-2 text-xs font-normal text-graphite">across {values.length} items</span>
      </p>
      <ul className="mt-3 space-y-1.5">
        {values.map((v) => (
          <li key={`${v.item_label}-${v.value}`} className="fragment flex items-center gap-3 px-3 py-2.5">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] leading-5 font-medium text-ink">
                {v.item_label} <span className="font-normal text-graphite">· {formatDate(v.item_day)}</span>
              </span>
              {v.claim_text && <span className="block truncate text-xs leading-4 text-graphite">&ldquo;{v.claim_text}&rdquo;</span>}
            </span>
            <span className="shrink-0 font-serif text-lg leading-6 text-ink">{fmt(v.value, check.unit)}</span>
          </li>
        ))}
      </ul>
    </li>
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
        <Button variant="quiet" className="h-7 px-2 text-xs" onClick={() => copy(questions.map((q, i) => `${i + 1}. ${q.question}`).join("\n"), "all")}>
          {copied === "all" ? "Copied" : "Copy all"}
        </Button>
      </div>
      {/* One fragment, ruled rows (v2): serif index in data blue, the "why" names the sources. */}
      <ol className="fragment mt-3 divide-y divide-rule px-3">
        {questions.map((q, i) => {
          const done = asked.includes(q.question);
          return (
            <li key={q.question} className={cn("flex gap-3 py-3", done && "opacity-60")}>
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
            </li>
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
  onBack,
  onOpen,
  onDrop,
  busy,
}: {
  companyId: string;
  filedItemId?: string | null;
  onBack: () => void;
  onOpen: (id: string, filedItemId?: string | null) => void;
  onDrop: (input: { file?: File; text?: string; kind?: "email" | "notes"; companyId?: string }) => void;
  busy?: boolean;
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

  if (error) return <p className="text-[13px] text-graphite">{error}</p>;
  if (!view) return <p className="text-[13px] text-graphite">Loading…</p>;

  const contradictions = view.checks.filter((c) => c.source === "your_sources");
  const publicRows = (report?.rows ?? []).filter((r) => !r.signal.endsWith("across your sources"));
  const disagreeing = (label: string) => contradictions.filter((c) => c.values?.some((v) => label.endsWith(v.item_label.split(" · ").pop() ?? ""))).length;
  const tabs: [Tab, string][] = [
    ["checks", `Checks${contradictions.length + publicRows.length ? ` ${contradictions.length + publicRows.length}` : ""}`],
    ["items", `Items ${view.items.length}`],
    ["questions", `Questions ${view.questions.length}`],
  ];

  return (
    <>
      <button type="button" onClick={onBack} className="mb-3 inline-flex min-h-6 items-center text-[13px] text-graphite hover:text-ink">
        ← Inbox
      </button>
      {filedItemId && (
        <FiledToast itemId={filedItemId} company={view.company.name} onMoved={(id) => onOpen(id, null)} />
      )}
      <ReportHeader company={{ name: view.company.name + (view.company.fictional ? " (fictional)" : ""), domain: view.company.domain ?? undefined }} />
      {view.company.form_d_entity && (
        <p className="mt-1 text-[11px] leading-4 text-graphite">
          Matched SEC filer: {view.company.form_d_entity}
          {view.company.cik && <span className="font-mono"> · CIK {view.company.cik}</span>}
        </p>
      )}

      {/* Segmented control (v2): tray-strong track, the active tab is a white pill. */}
      <div role="tablist" className="mt-5 flex gap-0.5 rounded-full bg-tray-strong p-[3px]">
        {tabs.map(([id, label]) => {
          const [name, count] = label.split(" ");
          return (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full text-[13px] font-medium transition-colors duration-150 ease-out",
                tab === id ? "fragment text-ink" : "text-graphite hover:text-ink",
              )}
            >
              {name}
              {count && <span className="text-data">{count}</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {tab === "checks" && (
          <div className="space-y-8">
            {contradictions.length > 0 && (
              <section>
                <h2 className="mb-2 text-sm leading-5 font-medium text-ink">
                  Your sources disagree <span className="text-signal">{contradictions.length}</span>
                </h2>
                <ul className="space-y-3">
                  {contradictions.map((c) => (
                    <ContradictionCard key={`${c.claim_type}-${c.metric}`} check={c} />
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
              <p className="text-[13px] text-graphite">No public-record checks yet for this company.</p>
            )}
          </div>
        )}

        {tab === "items" && (
          <>
            <ol className="space-y-2">
              {[...view.items].reverse().map((item) => {
                const n = disagreeing(item.label);
                return (
                  <li key={item.id} className="fragment px-3 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-2">
                        <ItemTag kind={item.kind} />
                        <span className="truncate text-[13px] text-ink">{item.label}</span>
                      </span>
                      <span className="shrink-0 text-[11px] text-graphite">{formatDate(item.item_date ?? item.received_at)}</span>
                    </div>
                    <p className="mt-1 text-xs text-graphite">
                      {item.claim_count} claim{item.claim_count === 1 ? "" : "s"}
                      {n > 0 && <span className="text-signal"> · {n} disagree with other items</span>}
                    </p>
                  </li>
                );
              })}
            </ol>
            <div className="mt-4">
              <DropStrip dashed busy={busy} label="Drop another item for this company" onDrop={(input) => onDrop({ ...input, companyId })} />
            </div>
          </>
        )}

        {tab === "questions" && <QuestionCards companyId={companyId} questions={view.questions} />}
      </div>

      <footer className="mt-8 text-[11px] leading-4 text-graphite">
        Discrepancies are differences between sources, not findings of wrongdoing. Automated comparison of public records;
        may be incomplete or out of date. Not investment advice.
      </footer>
    </>
  );
}
