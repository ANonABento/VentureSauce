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
import { Button } from "./button";
import { cn } from "./cn";
import { DeltaRows } from "./delta-rows";
import { DropStrip, ItemTag } from "./inbox";
import { ReportHeader } from "./report-header";
import { formatDate, formatUsd } from "./report-utils";
import { Verdict } from "./verdict";

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
    <div role="status" className="mb-5 rounded-md border border-border-strong bg-surface px-3 py-2 text-[13px] leading-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-graphite">
          Filed under <span className="font-medium text-ink">{company}</span>
        </span>
        <button type="button" className="text-xs text-ink underline underline-offset-4" onClick={() => setChanging(!changing)}>
          {changing ? "Cancel" : "Change"}
        </button>
      </div>
      {changing && (
        <div className="mt-2 space-y-1 border-t border-rule pt-2">
          {companies
            .filter((c) => c.name !== company)
            .map((c) => (
              <button key={c.id} type="button" className="block text-left text-ink hover:underline" onClick={() => move({ companyId: c.id })}>
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
              className="h-7 min-w-0 flex-1 rounded-[2px] border border-rule bg-paper px-2 text-xs"
            />
            <Button type="submit" variant="quiet" className="h-7 px-2 text-xs">
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
  const pos = (v: number) => (hi === lo ? 50 : 4 + ((v - lo) / (hi - lo)) * 92);
  const title = check.metric
    ? check.metric.length <= 4
      ? check.metric.toUpperCase()
      : check.metric[0].toUpperCase() + check.metric.slice(1)
    : check.claim_type === "headcount"
      ? "Headcount"
      : "Total raised";

  return (
    <li className="relative border-b border-rule py-5">
      <span aria-hidden="true" className="absolute top-5 bottom-5 -left-3 w-0.5 bg-signal" />
      <div className="flex items-baseline justify-between gap-3 text-[13px] leading-5">
        <span className="font-medium text-ink">{title}</span>
        <span className="font-medium text-signal">{values.length} sources disagree</span>
      </div>
      <div className="relative mt-4 h-6" aria-hidden="true">
        <div className="absolute top-3 right-0 left-0 h-px bg-rule" />
        {values.map((v) => (
          <span
            key={`${v.item_label}-${v.value}`}
            title={`${v.item_label}: ${fmt(v.value, check.unit)}`}
            className="absolute top-[9px] h-[7px] w-[7px] -translate-x-1/2 rounded-full border border-signal bg-surface"
            style={{ left: `${pos(v.value)}%` }}
          />
        ))}
      </div>
      <ul className="mt-2 space-y-1 text-xs leading-4">
        {[...values]
          .sort((a, b) => a.value - b.value)
          .map((v) => (
            <li key={`${v.item_label}-${v.value}`} className="flex justify-between gap-3">
              <span className="truncate text-graphite">
                {v.item_label} · {formatDate(v.item_day)}
              </span>
              <span className="shrink-0 font-mono text-ink">{fmt(v.value, check.unit)}</span>
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
      <ol className="mt-3 space-y-3">
        {questions.map((q, i) => {
          const done = asked.includes(q.question);
          return (
            <li key={q.question} className={cn("rounded-md border border-border-strong bg-surface p-3", done && "opacity-60")}>
              <p className="text-[13px] leading-5 text-ink">
                <span className="mr-2 font-mono text-graphite">{i + 1}</span>
                {q.question}
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="micro-label text-graphite">{q.why}</span>
                <span className="flex gap-3 text-xs">
                  <button type="button" className="text-ink underline-offset-4 hover:underline" onClick={() => copy(q.question, i)}>
                    {copied === i ? "Copied" : "Copy"}
                  </button>
                  <button type="button" className="text-ink underline-offset-4 hover:underline" onClick={() => toggle(q.question)}>
                    {done ? "Asked ✓" : "Mark asked"}
                  </button>
                </span>
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

  if (error) {
    return (
      <>
        <button type="button" onClick={onBack} className="micro-label mb-4 text-graphite hover:text-ink">
          ← Inbox
        </button>
        <p role="alert" className="text-[13px] leading-5 text-ink">
          This company couldn&apos;t be opened ({error}).
        </p>
      </>
    );
  }
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
      <button type="button" onClick={onBack} className="micro-label mb-4 text-graphite hover:text-ink">
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

      {report && report.rows.length > 0 && (
        <div className="mt-5">
          <Verdict rows={report.rows} />
        </div>
      )}

      <div role="tablist" className="mt-5 flex gap-1 rounded-full bg-tray-strong p-1">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "h-8 flex-1 rounded-full text-[13px] transition-colors duration-150 ease-out",
              tab === id ? "bg-surface font-medium text-ink shadow-fragment" : "text-graphite hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "checks" && (
          <div className="space-y-8">
            {contradictions.length > 0 && (
              <section>
                <h2 className="micro-label border-b border-rule pb-2 text-signal">Your sources disagree</h2>
                <ul>
                  {contradictions.map((c) => (
                    <ContradictionCard key={`${c.claim_type}-${c.metric}`} check={c} />
                  ))}
                </ul>
              </section>
            )}
            {publicRows.length > 0 ? (
              <section>
                <h2 className="mb-3 text-sm leading-5 font-medium text-ink">Public records</h2>
                <DeltaRows rows={publicRows} />
              </section>
            ) : (
              <p className="text-[13px] text-graphite">No public-record checks yet for this company.</p>
            )}
          </div>
        )}

        {tab === "items" && (
          <>
            <ol>
              {[...view.items].reverse().map((item) => {
                const n = disagreeing(item.label);
                return (
                  <li key={item.id} className="border-b border-rule py-3">
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
