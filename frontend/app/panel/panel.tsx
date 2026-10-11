"use client";

import { type FormEvent, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { AddToCompany, type FilingChoice } from "@/components/add-to-company";
import { ArtDropZone, type DropInput } from "@/components/art-drop";
import { MiniBrief } from "@/components/brief";
import { DealsScreen } from "@/components/deals";
import { DealsChart, Greeting, StatTiles } from "@/components/home";
import { Masthead, type Scene } from "@/components/masthead";
import { Button } from "@/components/button";
import { cn } from "@/components/cn";
import { ErrorState } from "@/components/error-state";
import { FirstRun } from "@/components/first-run";
import { LoadingSteps, jobStep } from "@/components/loading-steps";
import { ReportHeader } from "@/components/report-header";
import { ReportView } from "@/components/report-view";
import { ThemeParam } from "@/components/theme-param";
import type { DeltaReport } from "@/lib/types";
import { type CompanyTab, CompanyScreen } from "@/components/company";
import { DigestScreen } from "@/components/digest";
import { type CompanySummary, dropItem, getReport, listCompanies, loadExample, moveItem } from "@/lib/api";
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
  | { kind: "home" }
  | { kind: "deals" }
  | { kind: "company"; id: string; filed?: string | null; summary?: CompanySummary; tab?: CompanyTab; from?: "home" | "deals" | "digest" }
  | { kind: "digest" };

const DEPTH: Record<Screen["kind"], number> = { home: 0, deals: 1, digest: 1, company: 2 };
const SCENE: Record<Screen["kind"], Scene> = { home: "home", deals: "deals", company: "company", digest: "digest" };
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
  input.file?.name ?? (input.kind === "notes" ? "Call notes" : input.kind === "email" ? "Founder email" : "Pasted text");

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
  const [loadingExample, setLoadingExample] = useState(false);
  const navigated = useRef(false);

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

  /** Files an item. `choice` comes from the add-to-company sheet; drops on a company's screen pass its id. */
  async function onDrop(input: DropInput & { companyId?: string }, choice: FilingChoice = {}) {
    setError(null);
    setFiling(itemName(input));
    setJob("parsing");
    try {
      const done = await dropItem({ ...input, companyId: input.companyId ?? choice.companyId }, (j) => setJob(j.status));
      let companyId = done.company_id;
      // "+ New company": the backend files by detection, then the item moves to the named company.
      if (choice.newCompany && done.item_id) companyId = (await moveItem(done.item_id, { newCompany: choice.newCompany })).company_id;
      // Fake mode replays a fixture without filing it, so there may be no company to open.
      if (companyId) setScreen({ kind: "company", id: companyId, filed: done.item_id, from: "home" });
      else setError("Checked, but it wasn't filed under a company.");
    } catch (e) {
      setError((e as Error).message);
    }
    setJob(null);
    setFiling(null);
  }

  // From home, an item first goes through "Add to company" (decision 48); with no companies yet there's nothing to choose.
  function onPick(input: DropInput) {
    if (job !== null) return;
    if (!companies?.length) onDrop(input);
    else setPending(input);
  }
  const cancelPick = useCallback(() => setPending(null), []);

  // ⌘V anywhere on home or a company: a screenshot or copied file is filed as-is; copied text (outside a text
  // box) is filed as an email when it has mail headers, else as a note. In a text box, only images are taken over.
  useEffect(() => {
    if (screen.kind === "digest" || screen.kind === "deals" || pending) return;
    function onPaste(event: ClipboardEvent) {
      if (job !== null || !event.clipboardData) return;
      const target = event.target as HTMLElement | null;
      const typing = !!target && (target.isContentEditable || ["INPUT", "TEXTAREA"].includes(target.tagName));
      const companyId = screen.kind === "company" ? screen.id : undefined;
      const file = Array.from(event.clipboardData.files)[0];
      let input: DropInput | null = null;
      if (file) {
        const named = file.type.startsWith("image/") && /^image\.\w+$/.test(file.name)
          ? new File([file], `pasted-screenshot.${file.type.split("/")[1] || "png"}`, { type: file.type })
          : file;
        input = { file: named };
      } else {
        const text = event.clipboardData.getData("text/plain").trim();
        if (typing || text.length < 20) return;
        input = { text, kind: /^(from|subject):/im.test(text) ? "email" : undefined };
      }
      event.preventDefault();
      if (companyId) onDrop({ ...input, companyId });
      else onPick(input);
    }
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
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
      {!(screen.kind === "home" && firstRun) && <Masthead scene={SCENE[screen.kind]} />}
      <div className={cn(!(screen.kind === "home" && firstRun) && "relative mt-1")}>
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
              {error && <p role="alert" className="mb-3 text-xs text-signal">{error}</p>}
              <FirstRun
                onPick={onPick}
                busy={busy}
                step={step}
                filing={filing}
                onLookup={onLookup}
                onExample={onExample}
                loadingExample={loadingExample}
              />
            </>
          )}
          {screen.kind === "home" && companies && companies.length > 0 && (
            <>
              <Greeting onDeals={() => setScreen({ kind: "deals" })} />
              {notInInbox && detected && (
                <p className="mt-2 text-[13px] leading-5 text-graphite">
                  <span className="text-ink">{detected.domain}</span> isn&apos;t in your inbox yet.
                </p>
              )}
              <div className="mt-5">
                <StatTiles companies={companies} />
              </div>
              <div className="mt-3">
                <MiniBrief onOpen={() => setScreen({ kind: "digest" })} />
              </div>
              <div className="mt-3">
                <DealsChart
                  companies={companies}
                  seen={seen}
                  onOpen={(company) => openCompany(company, "home")}
                  onAll={() => setScreen({ kind: "deals" })}
                />
              </div>
              {error && <p role="alert" className="mt-3 text-xs text-signal">{error}</p>}
              <div className="mt-3">
                <ArtDropZone onPick={onPick} busy={busy} step={step} filing={filing} />
              </div>
            </>
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
              {error && <p role="alert" className="mb-3 text-xs text-signal">{error}</p>}
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
      <AddToCompany
        label={pending ? itemName(pending) : null}
        companies={companies ?? []}
        onCancel={cancelPick}
        onSubmit={(choice) => {
          const input = pending;
          setPending(null);
          if (input) onDrop(input, choice);
        }}
      />
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
