"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CaretRight, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/button";
import { ErrorState } from "@/components/error-state";
import { LoadingSteps } from "@/components/loading-steps";
import { ReportHeader } from "@/components/report-header";
import { ReportView } from "@/components/report-view";
import { ThemeParam } from "@/components/theme-param";
import type { DeltaReport } from "@/lib/types";
import { CompanyScreen } from "@/components/company";
import { DigestScreen } from "@/components/digest";
import { CompanyList, DropStrip } from "@/components/inbox";
import { type CompanySummary, dropItem, getReport, listCompanies } from "@/lib/api";
import { detectCompany } from "./get-delta-report";
import { PanelFrame } from "./panel-frame";

export type Status =
  | "idle"
  | "detected"
  | "loading"
  | "report"
  | "empty"
  | "error";
export type Subject = { name?: string; domain?: string };

export function Panel() {
  const pageUrl = useSearchParams().get("url");
  // Start over whenever the extension points the panel at another page.
  return (
    <>
      <ThemeParam />
      <InboxApp key={pageUrl ?? ""} pageUrl={pageUrl} />
    </>
  );
}

type Screen = { kind: "inbox" } | { kind: "company"; id: string; filed?: string | null } | { kind: "digest" };

const JOB_STEP: Record<string, string> = {
  parsing: "Reading the item",
  checking_sec: "Reading SEC filings",
  checking_linkedin: "Checking LinkedIn",
  checking_press: "Reading the press",
  comparing_sources: "Comparing with your other items",
  ready: "Filed",
};

/** The deal inbox: Inbox → Company (Checks / Items / Questions) → Digest. */
function InboxApp({ pageUrl }: { pageUrl: string | null }) {
  const detected = detectCompany(pageUrl);
  const [screen, setScreen] = useState<Screen>({ kind: "inbox" });
  const [companies, setCompanies] = useState<CompanySummary[] | null>(null);
  const [seen, setSeen] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notInInbox, setNotInInbox] = useState(false);

  useEffect(() => {
    if (screen.kind !== "inbox") return;
    listCompanies()
      .then((list) => {
        setCompanies(list);
        const marks: Record<string, string> = {};
        for (const c of list) {
          try {
            const at = localStorage.getItem(`vs-seen-${c.id}`);
            if (at) marks[c.id] = at;
          } catch {}
        }
        setSeen(marks);
      })
      .catch(() => setError("Can't reach the VentureSauce backend."));
  }, [screen]);

  // Opened on a company's site: jump to it if it's already in the inbox.
  useEffect(() => {
    if (!pageUrl || !detected) return;
    getReport({ url: pageUrl })
      .then((r) => {
        const id = (r.company as { id?: string }).id;
        if (id) setScreen({ kind: "company", id });
      })
      .catch(() => setNotInInbox(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageUrl]);

  async function onDrop(input: { file?: File; text?: string; kind?: "email" | "notes"; companyId?: string }) {
    setError(null);
    setProgress("Reading the item");
    try {
      const job = await dropItem(input, (j) => setProgress(JOB_STEP[j.status] ?? "Working"));
      setScreen({ kind: "company", id: job.company_id!, filed: job.item_id });
    } catch (e) {
      setError((e as Error).message);
    }
    setProgress(null);
  }

  const busy = progress !== null;
  return (
    <PanelFrame>
      {screen.kind === "inbox" && (
        <>
          <h1 className="font-serif text-[26px] leading-8 tracking-[-0.02em] text-ink">Deal inbox</h1>
          {/* The inbox's one hero tray: the way into today's digest. */}
          <button
            type="button"
            onClick={() => setScreen({ kind: "digest" })}
            className="tray group mt-4 flex w-full items-center gap-3 text-left"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm leading-5 font-medium text-ink group-hover:underline group-hover:underline-offset-4">
                Today&apos;s digest
              </span>
              <span className="block text-xs leading-4 text-graphite">
                {companies ? (
                  <>
                    Your briefing across{" "}
                    <span className="font-serif text-base text-data">{companies.length}</span>{" "}
                    {companies.length === 1 ? "company" : "companies"}
                  </>
                ) : (
                  "Your briefing, read aloud or skimmed"
                )}
              </span>
            </span>
            <CaretRight aria-hidden="true" size={16} weight="light" className="shrink-0 text-graphite" />
          </button>
          {notInInbox && detected && (
            <p className="mt-2 text-[13px] leading-5 text-graphite">
              Nothing about <span className="text-ink">{detected.domain}</span> in your inbox yet. Drop its deck or a founder email.
            </p>
          )}
          <div className="mt-4">
            <DropStrip onDrop={onDrop} busy={busy} />
          </div>
          {progress && <p role="status" className="mt-2 text-xs text-graphite">{progress}…</p>}
          {error && <p role="alert" className="mt-2 text-xs text-signal">{error}</p>}
          {companies && (
            <CompanyList companies={companies} seen={seen} onOpen={(id) => setScreen({ kind: "company", id })} />
          )}
        </>
      )}
      {screen.kind === "company" && (
        <>
          {progress && <p role="status" className="mb-3 text-xs text-graphite">{progress}…</p>}
          {error && <p role="alert" className="mb-3 text-xs text-signal">{error}</p>}
          <CompanyScreen
            companyId={screen.id}
            filedItemId={screen.filed}
            busy={busy}
            onBack={() => setScreen({ kind: "inbox" })}
            onOpen={(id, filed) => setScreen({ kind: "company", id, filed })}
            onDrop={onDrop}
          />
        </>
      )}
      {screen.kind === "digest" && (
        <DigestScreen onBack={() => setScreen({ kind: "inbox" })} onOpen={(id) => setScreen({ kind: "company", id })} />
      )}
    </PanelFrame>
  );
}

/** One panel state, rendered from props. Also used by /panel/states. */
export function PanelView({
  status,
  subject = {},
  report = null,
  step = 0,
  name = "",
  embedded = false,
  onNameChange,
  onSubmitName,
  onRun,
}: {
  status: Status;
  subject?: Subject;
  report?: DeltaReport | null;
  step?: number;
  name?: string;
  embedded?: boolean;
  onNameChange?: (value: string) => void;
  onSubmitName?: (event: FormEvent<HTMLFormElement>) => void;
  onRun?: () => void;
}) {
  const hasReport = status === "report" || status === "empty";
  const title = subject.name ?? subject.domain ?? "";
  const subjectHeader = (
    <ReportHeader
      company={{ name: title, domain: subject.name ? subject.domain : undefined }}
    />
  );

  return (
    <PanelFrame embedded={embedded}>
      {status === "idle" && (
        <>
          <h1 className="font-serif text-xl leading-6 font-medium tracking-tight text-ink">
            No company detected on this page.
          </h1>
          <p className="mt-2 text-[13px] leading-5 text-graphite">
            Type a company name to compare what it filed with the SEC against
            what it says publicly.
          </p>
          <form onSubmit={onSubmitName} className="mt-6">
            <label htmlFor="company" className="block text-sm leading-5 font-medium text-ink">
              Company name
            </label>
            {/* One row when there's room for the full placeholder; stacked full-width in a narrow panel. */}
            <div className="@container mt-2">
              <div className="flex flex-col gap-2 @[24rem]:flex-row">
                <span className="relative block min-w-0 flex-1">
                  <MagnifyingGlass
                    aria-hidden="true"
                    size={16}
                    weight="light"
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-graphite"
                  />
                  <input
                    id="company"
                    name="company"
                    value={name}
                    onChange={(event) => onNameChange?.(event.target.value)}
                    required
                    autoComplete="off"
                    placeholder="e.g. Quillfeather Robotics"
                    className="block h-9 w-full rounded-full border border-rule-strong bg-surface pr-3 pl-9 text-sm text-ink placeholder:text-graphite"
                  />
                </span>
                <Button type="submit" className="shrink-0">
                  Compare filings
                </Button>
              </div>
            </div>
          </form>
        </>
      )}

      {status === "detected" && (
        <>
          {subjectHeader}
          <p className="mt-4 text-[13px] leading-5 text-graphite">
            Compare what this company filed with the SEC against what it says
            publicly.
          </p>
          <Button className="mt-6" onClick={onRun}>
            Compare filings
          </Button>
        </>
      )}

      {status === "loading" && (
        <>
          {subjectHeader}
          <div className="mt-5 border-t border-rule pt-4">
            <LoadingSteps current={step} />
          </div>
        </>
      )}

      {hasReport && report && <ReportView report={report} />}

      {status === "error" && (
        <>
          {subjectHeader}
          <div className="mt-5 border-t border-rule pt-4">
            <ErrorState onRetry={() => onRun?.()} />
          </div>
        </>
      )}
    </PanelFrame>
  );
}
