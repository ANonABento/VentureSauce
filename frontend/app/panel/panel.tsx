"use client";

import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { CaretRight, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/button";
import { ErrorState } from "@/components/error-state";
import { FirstRun } from "@/components/first-run";
import { LoadingSteps, jobStep } from "@/components/loading-steps";
import { ReportHeader } from "@/components/report-header";
import { ReportView } from "@/components/report-view";
import { ThemeParam } from "@/components/theme-param";
import type { DeltaReport } from "@/lib/types";
import { CompanyScreen } from "@/components/company";
import { DigestScreen } from "@/components/digest";
import { CompanyList, DropStrip } from "@/components/inbox";
import { type CompanySummary, dropItem, getReport, listCompanies, loadExample } from "@/lib/api";
import { DUR, EASE_ENTER } from "@/lib/motion";
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

type Screen =
  | { kind: "inbox" }
  | { kind: "company"; id: string; filed?: string | null; summary?: CompanySummary }
  | { kind: "digest" };

const DEPTH: Record<Screen["kind"], number> = { inbox: 0, digest: 1, company: 2 };
const screenKey = (screen: Screen) => (screen.kind === "company" ? `company-${screen.id}` : screen.kind);

const JOB_STEP: Record<string, string> = {
  parsing: "Reading the item",
  checking_sec: "Reading SEC filings",
  checking_linkedin: "Checking LinkedIn",
  checking_press: "Reading the press",
  comparing_sources: "Comparing with your other items",
  ready: "Filed",
};

/**
 * Screen changes (decision 33): content slides 12px in the direction of
 * travel and exits with a short blur-fade; shared elements (company name,
 * signal strip) glide between screens via their layoutId.
 */
function ScreenTransition({ id, direction, children }: { id: string; direction: number; children: ReactNode }) {
  return (
    // popLayout takes the exiting screen out of flow; it positions against this box.
    <div className="relative">
    <AnimatePresence mode="popLayout" initial={false} custom={direction}>
      <motion.div
        key={id}
        custom={direction}
        variants={{
          enter: (dir: number) => ({ opacity: 0, x: dir * 12 }),
          center: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: DUR.base, ease: EASE_ENTER } },
          exit: { opacity: 0, filter: "blur(4px)", transition: { duration: 0.2, ease: EASE_ENTER } },
        }}
        initial="enter"
        animate="center"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
    </div>
  );
}

/** The deal inbox: Inbox → Company (Checks / Items / Questions) → Digest. */
function InboxApp({ pageUrl }: { pageUrl: string | null }) {
  const detected = detectCompany(pageUrl);
  const [screen, setScreenState] = useState<Screen>({ kind: "inbox" });
  const [direction, setDirection] = useState(1);
  const [companies, setCompanies] = useState<CompanySummary[] | null>(null);
  const [seen, setSeen] = useState<Record<string, string>>({});
  const [job, setJob] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notInInbox, setNotInInbox] = useState(false);
  const [loadingExample, setLoadingExample] = useState(false);

  async function onExample() {
    setError(null);
    setLoadingExample(true);
    try {
      await loadExample();
      setCompanies(await listCompanies());
    } catch (e) {
      setError((e as Error).message);
    }
    setLoadingExample(false);
  }

  function setScreen(next: Screen) {
    setDirection(DEPTH[next.kind] >= DEPTH[screen.kind] ? 1 : -1);
    setScreenState(next);
    window.scrollTo({ top: 0 });
  }

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
        if (id) setScreenState({ kind: "company", id });
      })
      .catch(() => setNotInInbox(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageUrl]);

  // ⌘V anywhere on the inbox or a company: a screenshot or copied file is filed as-is; copied text (outside a text
  // box) is filed as an email when it has mail headers, else as a note. In a text box, only images are taken over.
  useEffect(() => {
    if (screen.kind === "digest") return;
    function onPaste(event: ClipboardEvent) {
      if (job !== null || !event.clipboardData) return;
      const target = event.target as HTMLElement | null;
      const typing = !!target && (target.isContentEditable || ["INPUT", "TEXTAREA"].includes(target.tagName));
      const companyId = screen.kind === "company" ? screen.id : undefined;
      const file = Array.from(event.clipboardData.files)[0];
      if (file) {
        event.preventDefault();
        const named = file.type.startsWith("image/") && /^image\.\w+$/.test(file.name)
          ? new File([file], `pasted-screenshot.${file.type.split("/")[1] || "png"}`, { type: file.type })
          : file;
        onDrop({ file: named, companyId });
        return;
      }
      const text = event.clipboardData.getData("text/plain").trim();
      if (typing || text.length < 20) return;
      event.preventDefault();
      onDrop({ text, kind: /^(from|subject):/im.test(text) ? "email" : undefined, companyId });
    }
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  });

  async function onDrop(input: { file?: File; text?: string; kind?: "email" | "notes"; companyId?: string }) {
    setError(null);
    setJob("parsing");
    try {
      const done = await dropItem(input, (j) => setJob(j.status));
      // Fake mode replays a fixture without filing it, so there may be no company to open.
      if (done.company_id) setScreen({ kind: "company", id: done.company_id, filed: done.item_id });
      else setError("Checked, but it wasn't filed under a company.");
    } catch (e) {
      setError((e as Error).message);
    }
    setJob(null);
  }

  async function onLookup(name: string): Promise<string | null> {
    try {
      const report = await getReport({ company: name });
      const id = (report.company as { id?: string }).id;
      if (id) {
        setScreen({ kind: "company", id });
        return null;
      }
    } catch {}
    return `${name} isn't in your inbox yet. Drop its deck or a founder email above.`;
  }

  const busy = job !== null;
  const step = jobStep(job);
  const status = job && (
    <p role="status" className="sr-only">
      {JOB_STEP[job] ?? "Working"}
    </p>
  );
  const firstRun = companies !== null && companies.length === 0;

  return (
    <PanelFrame>
      <ScreenTransition id={screenKey(screen)} direction={direction}>
        {screen.kind === "inbox" && firstRun && (
          <>
            {status}
            {error && <p role="alert" className="mb-3 text-xs text-signal">{error}</p>}
            <FirstRun onDrop={onDrop} busy={busy} step={step} onLookup={onLookup} onExample={onExample} loadingExample={loadingExample} />
          </>
        )}
        {screen.kind === "inbox" && !firstRun && (
          <>
            <h1 className="font-serif text-[26px] leading-8 tracking-[-0.02em] text-ink">Deal inbox</h1>
            {/* The inbox's one hero tray: the way into today's digest. */}
            <button
              type="button"
              onClick={() => setScreen({ kind: "digest" })}
              className="tray group mt-4 flex w-full items-center gap-3 text-left transition-colors duration-150 ease-out hover:bg-tray-strong"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm leading-5 font-medium text-ink">Today&apos;s digest</span>
                <span className="block text-xs leading-4 text-graphite">
                  {companies ? (
                    <>
                      <span className="font-serif text-base text-data">{companies.length}</span>{" "}
                      {companies.length === 1 ? "company" : "companies"}, read aloud or skimmed
                    </>
                  ) : (
                    "Read aloud or skimmed"
                  )}
                </span>
              </span>
              <CaretRight
                aria-hidden="true"
                size={16}
                weight="light"
                className="shrink-0 text-graphite transition-transform duration-150 ease-out group-hover:translate-x-0.5"
              />
            </button>
            {notInInbox && detected && (
              <p className="mt-2 text-[13px] leading-5 text-graphite">
                <span className="text-ink">{detected.domain}</span> isn&apos;t in your inbox yet.
              </p>
            )}
            <div className="mt-4">
              {status}
              <DropStrip onDrop={onDrop} busy={busy} step={step} label="Drop or ⌘V a deck or email" />
            </div>
            {error && <p role="alert" className="mt-2 text-xs text-signal">{error}</p>}
            {companies && (
              <CompanyList
                companies={companies}
                seen={seen}
                onOpen={(company) => setScreen({ kind: "company", id: company.id, summary: company })}
              />
            )}
          </>
        )}
        {screen.kind === "company" && (
          <>
            {status}
            {error && <p role="alert" className="mb-3 text-xs text-signal">{error}</p>}
            <CompanyScreen
              companyId={screen.id}
              filedItemId={screen.filed}
              summary={screen.summary}
              busy={busy}
              step={step}
              onBack={() => setScreen({ kind: "inbox" })}
              onOpen={(id, filed) => setScreen({ kind: "company", id, filed })}
              onDrop={onDrop}
            />
          </>
        )}
        {screen.kind === "digest" && (
          <DigestScreen onBack={() => setScreen({ kind: "inbox" })} onOpen={(id) => setScreen({ kind: "company", id })} />
        )}
      </ScreenTransition>
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
          <div className="mt-5">
            <LoadingSteps current={step} />
          </div>
        </>
      )}

      {hasReport && report && <ReportView report={report} />}

      {status === "error" && (
        <>
          {subjectHeader}
          <div className="mt-5">
            <ErrorState onRetry={() => onRun?.()} />
          </div>
        </>
      )}
    </PanelFrame>
  );
}
