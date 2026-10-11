"use client";

import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { AddToCompanyScreen, type FilingChoice } from "@/components/add-to-company";
import { DropZone, type DropInput } from "@/components/drop-zone";
import { FiledToast } from "@/components/company";
import { SauceViews } from "@/components/sauce-views";
import { DealsScreen } from "@/components/deals";
import { DealsChart, Greeting, ReportBar, StatTiles } from "@/components/home";
import { Masthead, type Scene } from "@/components/masthead";
import { Button } from "@/components/button";
import { ErrorState } from "@/components/error-state";
import { FirstRun } from "@/components/first-run";
import { LoadingSteps, jobStep } from "@/components/loading-steps";
import { ReportHeader } from "@/components/report-header";
import { ReportView } from "@/components/report-view";
import { ThemeParam } from "@/components/theme-param";
import type { DeltaReport } from "@/lib/types";
import { type CompanyTab, CompanyScreen } from "@/components/company";
import { DigestScreen } from "@/components/digest";
import { type CompanySummary, dropItem, getReport, listCompanies, moveItem } from "@/lib/api";
import { DUR, EASE_ENTER } from "@/lib/motion";
import { detectCompany } from "./get-delta-report";
import { PanelFrame } from "./panel-frame";
import { type FileInput, usePasteToFile } from "./use-paste-to-file";

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
  | { kind: "home" }
  | { kind: "file" }
  | { kind: "report"; id?: string; filed?: string | null }
  | { kind: "deals" }
  | { kind: "company"; id: string; filed?: string | null; summary?: CompanySummary; tab?: CompanyTab; from?: "home" | "deals" | "digest" }
  | { kind: "digest" };

const DEPTH: Record<Screen["kind"], number> = { home: 0, deals: 1, digest: 1, file: 1, report: 2, company: 2 };
const SCENE: Record<Screen["kind"], Scene> = { home: "home", deals: "deals", company: "company", digest: "digest", file: "deals", report: "company" };
const screenKey = (screen: Screen) => (screen.kind === "company" ? `company-${screen.id}` : screen.kind);

const JOB_STEP: Record<string, string> = {
  parsing: "Reading the item",
  checking_sec: "Reading SEC filings",
  checking_linkedin: "Checking LinkedIn",
  checking_press: "Reading the press",
  comparing_sources: "Comparing with your other items",
  ready: "Filed",
};

const itemName = (input: DropInput) =>
  input.file?.name ?? input.url ?? (input.kind === "notes" ? "Call notes" : input.kind === "email" ? "Founder email" : "Pasted text");

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
          data-screen={id}
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

/** The deal inbox: Home → Deals → Company (pulse + details), and the Digest. */
function InboxApp({ pageUrl }: { pageUrl: string | null }) {
  const detected = detectCompany(pageUrl);
  const [screen, setScreenState] = useState<Screen>({ kind: "home" });
  const [direction, setDirection] = useState(1);
  const [companies, setCompanies] = useState<CompanySummary[] | null>(null);
  const [seen, setSeen] = useState<Record<string, string>>({});
  const [job, setJob] = useState<string | null>(null);
  const [filing, setFiling] = useState<string | null>(null);
  const [pending, setPending] = useState<DropInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notInInbox, setNotInInbox] = useState(false);
  const navigated = useRef(false);

  function setScreen(next: Screen) {
    setDirection(DEPTH[next.kind] >= DEPTH[screen.kind] ? 1 : -1);
    setScreenState(next);
    navigated.current = true;
    window.scrollTo({ top: 0 });
  }

  // After a screen change, move focus to the new screen's title so keyboard and screen-reader users land there.
  useEffect(() => {
    if (!navigated.current) return;
    const frame = requestAnimationFrame(() => {
      const title = document.querySelector<HTMLElement>(`[data-screen="${screenKey(screen)}"] h1`);
      if (!title) return;
      title.setAttribute("tabindex", "-1");
      title.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [screen]);

  useEffect(() => {
    if (screen.kind !== "home" && screen.kind !== "deals") return;
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

  /**
   * Files an item. From home it follows the wireframe (decision 61): Add to company → checking → the Sauce Report.
   * Drops on a company's own screen pass its id and stay there.
   */
  async function onDrop(input: FileInput, choice: FilingChoice = {}) {
    const fromHome = !input.companyId;
    setError(null);
    setFiling(itemName(input));
    setJob("parsing");
    if (fromHome) setScreen({ kind: "report" });
    try {
      const done = await dropItem({ ...input, companyId: input.companyId ?? choice.companyId }, (j) => setJob(j.status));
      let companyId = done.company_id;
      // "+ New company": the backend files by detection, then the item moves to the named company.
      if (choice.newCompany && done.item_id) companyId = (await moveItem(done.item_id, { newCompany: choice.newCompany })).company_id;
      // Fake mode replays a fixture without filing it, so there may be no company to open.
      if (companyId && fromHome) setScreen({ kind: "report", id: companyId, filed: done.item_id });
      else if (companyId) setScreen({ kind: "company", id: companyId, filed: done.item_id, from: "home" });
      else setError("Checked, but it wasn't filed under a company.");
    } catch (e) {
      setError((e as Error).message);
    }
    setJob(null);
    setFiling(null);
  }

  // From home, an item first goes to the "Add to company" screen (decisions 48, 61); with no companies yet there's nothing to choose.
  function onPick(input: DropInput) {
    if (job !== null) return;
    if (!companies?.length) return onDrop(input);
    setPending(input);
    setScreen({ kind: "file" });
  }

  // ⌘V or drop a file, link, company name or text anywhere (see use-paste-to-file.ts). Keep this when reskinning.
  // From home or Deals an item goes through onPick (Add to company → Sauce Report); on a company it's filed there.
  // A company name, or a homepage of one already in the inbox, opens its company screen.
  usePasteToFile({
    enabled: job === null && (screen.kind === "home" || screen.kind === "deals" || screen.kind === "company"),
    companyId: screen.kind === "company" ? screen.id : undefined,
    onFile: (input) => (input.companyId ? onDrop(input) : onPick(input)),
    openCompany: async (q) => {
      try {
        const id = ((await getReport(q)).company as { id?: string }).id;
        if (id) setScreen({ kind: "company", id, from: screen.kind === "deals" ? "deals" : "home" });
        return !!id;
      } catch {
        return false;
      }
    },
    onMessage: setError,
  });

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
  const openCompany = (company: CompanySummary, from: "home" | "deals") =>
    setScreen({ kind: "company", id: company.id, summary: company, from });

  return (
    <PanelFrame>
      {/* The horizon band pans along the arc per screen (decisions 53, 55); first run shows the art in its drop zone instead. */}
      <Masthead scene={SCENE[screen.kind]} inner={screen.kind !== "home"} />
      {/* Content sits below the art band, on paper. */}
      <div className="relative mt-1">
        {status}
        <ScreenTransition id={screenKey(screen)} direction={direction}>
          {screen.kind === "home" && companies === null && (
            <>
              <Greeting />
              <div aria-hidden="true" className="mt-5 grid grid-cols-3 gap-2">
                <div className="tray h-[104px]" />
                <div className="tray h-[104px]" />
                <div className="tray h-[104px]" />
              </div>
            </>
          )}
          {screen.kind === "home" && firstRun && (
            <>
              {error && <p role="alert" className="mb-3 text-xs font-medium text-ink">{error}</p>}
              <FirstRun
                onPick={onPick}
                busy={busy}
                step={step}
                filing={filing}
                onLookup={onLookup}
              />
            </>
          )}
          {screen.kind === "home" && companies && companies.length > 0 && (
            // Fills the panel's height: tiles grow a little, the deals chart and the dropzone take the rest.
            <div className="flex min-h-[calc(100dvh-192px)] flex-col gap-3">
              <div className="mb-2">
                <Greeting onDeals={() => setScreen({ kind: "deals" })} />
                {notInInbox && detected && (
                  <p className="mt-2 text-[13px] leading-5 text-graphite">
                    <span className="text-ink">{detected.domain}</span> isn&apos;t in your inbox yet.
                  </p>
                )}
              </div>
              <StatTiles companies={companies} />
              <ReportBar onListen={() => setScreen({ kind: "digest" })} />
              <DealsChart
                className="flex-[1.3]"
                companies={companies}
                seen={seen}
                onOpen={(company) => openCompany(company, "home")}
                onAll={() => setScreen({ kind: "deals" })}
              />
              {error && <p role="alert" className="text-xs font-medium text-ink">{error}</p>}
              <DropZone className="flex-1" onPick={onPick} busy={busy} step={step} filing={filing} onError={setError} />
            </div>
          )}
          {screen.kind === "file" && pending && (
            <AddToCompanyScreen
              label={itemName(pending)}
              companies={companies ?? []}
              onCancel={() => {
                setPending(null);
                setScreen({ kind: "home" });
              }}
              onSubmit={(choice) => {
                const input = pending;
                setPending(null);
                onDrop(input, choice);
              }}
            />
          )}
          {screen.kind === "report" && (
            <ReportScreen
              companyId={screen.id}
              filed={screen.filed}
              busy={busy}
              step={step}
              filing={filing}
              error={error}
              onHome={() => setScreen({ kind: "home" })}
              onPulse={(id) => setScreen({ kind: "company", id, from: "home" })}
              onMoved={(id) => setScreen({ kind: "report", id })}
            />
          )}
          {screen.kind === "deals" && (
            <DealsScreen
              companies={companies ?? []}
              seen={seen}
              onBack={() => setScreen({ kind: "home" })}
              onOpen={(company) => openCompany(company, "deals")}
            />
          )}
          {screen.kind === "company" && (
            <>
              {error && <p role="alert" className="mb-3 text-xs font-medium text-ink">{error}</p>}
              <CompanyScreen
                companyId={screen.id}
                filedItemId={screen.filed}
                summary={screen.summary}
                initialTab={screen.tab}
                backLabel={screen.from === "deals" ? "Deals" : screen.from === "digest" ? "Digest" : "Home"}
                busy={busy}
                step={step}
                onBack={() => setScreen({ kind: screen.from === "deals" ? "deals" : screen.from === "digest" ? "digest" : "home" })}
                onOpen={(id, filed) => setScreen({ kind: "company", id, filed })}
                onDrop={(input) => onDrop(input)}
              />
            </>
          )}
          {screen.kind === "digest" && (
            <DigestScreen
              onBack={() => setScreen({ kind: "home" })}
              onOpen={(id, tab) => setScreen({ kind: "company", id, tab, from: "digest" })}
            />
          )}
        </ScreenTransition>
      </div>
    </PanelFrame>
  );
}

/**
 * The wireframe's third screen (decision 61): the Sauce Report for what was just
 * filed, in the panel as a Human or Agent view, with Download and the way into the pulse.
 * While the item is still being checked it shows the progress card.
 */
function ReportScreen({
  companyId,
  filed,
  busy,
  step,
  filing,
  error,
  onHome,
  onPulse,
  onMoved,
}: {
  companyId?: string;
  filed?: string | null;
  busy: boolean;
  step: number;
  filing: string | null;
  error: string | null;
  onHome: () => void;
  onPulse: (id: string) => void;
  onMoved: (id: string) => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onHome}
        className="group mb-3 inline-flex min-h-6 items-center gap-1 text-[13px] text-graphite transition-colors duration-150 hover:text-ink"
      >
        <ArrowLeft aria-hidden="true" size={14} weight="light" className="transition-transform duration-150 ease-out group-hover:-translate-x-0.5" />
        Home
      </button>
      {!companyId ? (
        <>
          <h1 className="font-serif text-[26px] leading-8 tracking-[-0.02em] text-ink">Sauce Report</h1>
          <div className="mt-5">
            {busy ? (
              <DropZone onPick={() => {}} busy step={step} filing={filing} />
            ) : (
              error && <p role="alert" className="text-[13px] font-medium text-ink">{error}</p>
            )}
            <div aria-hidden="true" className="tray mt-4 h-64 animate-pulse motion-reduce:animate-none" />
          </div>
        </>
      ) : (
        // The Human | Agent switch lives here only (decision 70); Download follows it.
        <SauceViews
          companyId={companyId}
          notice={filed && <FiledToastFor companyId={companyId} itemId={filed} onMoved={onMoved} />}
          onPulse={() => onPulse(companyId)}
        />
      )}
    </>
  );
}

/** "Filed under X · Change" for the report screen, with the company's name looked up. */
function FiledToastFor({ companyId, itemId, onMoved }: { companyId: string; itemId: string; onMoved: (id: string) => void }) {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    listCompanies()
      .then((list) => live && setName(list.find((c) => c.id === companyId)?.name ?? null))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [companyId]);
  if (!name) return null;
  return <FiledToast itemId={itemId} company={name} onMoved={onMoved} />;
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
