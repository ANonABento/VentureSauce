"use client";

import { type ReactNode, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CaretRight, Copy, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { DUR, EASE_ENTER, SPRING } from "@/lib/motion";
import { markdownFileName, reportMarkdown } from "@/lib/report-markdown";
import { sauceUrl } from "@/lib/sauce";
import { Button } from "./button";
import { cn } from "./cn";
import { HumanReport } from "./sauce-human";
import { useSauceReport } from "./sauce-report";

/*
 * The in-panel Sauce Report with a Human | Agent switch (decisions 70–72).
 * Human is the visual-first report and downloads the PDF; Agent shows the
 * Markdown an AI agent receives, exactly, and downloads it as a .md file.
 * Only the report screen has the switch; the choice is remembered per browser.
 */

export type ReportMode = "human" | "agent";

const MODE_KEY = "vs.report-view";
const MODES: { key: ReportMode; label: string }[] = [
  { key: "human", label: "Human" },
  { key: "agent", label: "Agent" },
];

function storedMode(): ReportMode {
  try {
    return localStorage.getItem(MODE_KEY) === "agent" ? "agent" : "human";
  } catch {
    return "human";
  }
}

function useReportMode(): [ReportMode, (mode: ReportMode) => void] {
  const [mode, setMode] = useState<ReportMode>(storedMode);
  const choose = (next: ReportMode) => {
    setMode(next);
    try {
      localStorage.setItem(MODE_KEY, next);
    } catch {}
  };
  return [mode, choose];
}

/** Saves text as a file through a temporary object URL. */
function saveFile(text: string, name: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/markdown;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** The segmented switch, in the style of the Deals sort: tray track, white pill on a spring. */
function ViewToggle({ mode, onChange }: { mode: ReportMode; onChange: (mode: ReportMode) => void }) {
  return (
    <div role="group" aria-label="Report view" className="flex shrink-0 rounded-full bg-tray p-0.5 text-xs font-medium">
      {MODES.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          aria-pressed={mode === key}
          onClick={() => onChange(key)}
          className={cn("relative h-7 rounded-full px-3 transition-colors duration-150", mode === key ? "text-ink" : "text-graphite hover:text-ink")}
        >
          {mode === key && (
            <motion.span layoutId="report-view" className="fragment absolute inset-0 z-0" style={{ borderRadius: 9999 }} transition={SPRING} />
          )}
          <span className="relative z-10">{label}</span>
        </button>
      ))}
    </div>
  );
}

export function SauceViews({ companyId, notice, onPulse }: { companyId: string; notice?: ReactNode; onPulse: () => void }) {
  const { state, retry } = useSauceReport(companyId);
  const [mode, setMode] = useReportMode();
  const reduce = useReducedMotion();
  const ready = state.status === "ready" ? state : null;
  // Without the public-record comparison (its own timestamp), the newest item's arrival dates the report.
  const fallbackDate = ready?.view.items.map((item) => item.received_at).sort().at(-1) ?? "unknown";
  const markdown = ready ? reportMarkdown(ready.view, ready.report, fallbackDate) : "";
  const fileName = ready ? markdownFileName(ready.view.company.name) : "sauce-report.md";

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-[26px] leading-8 tracking-[-0.02em] text-ink">Sauce Report</h1>
        <ViewToggle mode={mode} onChange={setMode} />
      </div>
      {notice && <div className="mt-4">{notice}</div>}

      <div className="mt-4">
        {!ready ? (
          <div className="flex min-h-24 items-center gap-3">
            <p role="status" className="min-w-0 text-[13px] leading-5 text-graphite">
              {state.status === "error" ? `Couldn’t load this report (${state.message}).` : "Loading the report"}
            </p>
            {state.status === "error" && (
              <Button variant="quiet" size="xs" onClick={retry}>
                Retry
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            key={mode}
            initial={reduce ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.base, ease: EASE_ENTER }}
          >
            {mode === "human" ? (
              <HumanReport view={ready.view} report={ready.report} />
            ) : (
              <AgentReport markdown={markdown} fileName={fileName} />
            )}
          </motion.div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button type="button" onClick={onPulse} className="group inline-flex min-h-9 items-center gap-1 text-[13px] font-medium text-ink">
          Open pulse
          <CaretRight aria-hidden="true" size={13} weight="light" className="transition-transform duration-150 group-hover:translate-x-0.5" />
        </button>
        {mode === "human" ? (
          <a
            href={sauceUrl({ company: companyId, print: true })}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-full bg-ink px-4 text-[13px] font-medium text-paper transition-colors duration-150 hover:bg-ink/90"
          >
            <DownloadSimple aria-hidden="true" size={15} weight="light" />
            Download
            <span className="sr-only"> the Sauce Report (PDF, opens in a new tab)</span>
          </a>
        ) : (
          <Button disabled={!ready} onClick={() => saveFile(markdown, fileName)} className="gap-2">
            <DownloadSimple aria-hidden="true" size={15} weight="light" />
            Download
            <span className="sr-only"> the Sauce Report as Markdown ({fileName})</span>
          </Button>
        )}
      </div>
    </>
  );
}

/** The Markdown exactly as an agent receives it: monospaced, scrollable, selectable, with Copy and Download. */
function AgentReport({ markdown, fileName }: { markdown: string; fileName: string }) {
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied("done");
    } catch {
      setCopied("failed");
    }
    window.setTimeout(() => setCopied("idle"), 1800);
  }

  return (
    <section aria-label="Sauce Report as Markdown for an AI agent">
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate font-mono text-[11px] leading-4 text-graphite">{fileName}</p>
        <div className="flex shrink-0 gap-1.5">
          <Button variant="quiet" size="xs" onClick={copy} className="gap-1.5">
            <Copy aria-hidden="true" size={13} weight="light" />
            {copied === "done" ? "Copied" : "Copy"}
          </Button>
          <Button variant="quiet" size="xs" onClick={() => saveFile(markdown, fileName)} className="gap-1.5">
            <DownloadSimple aria-hidden="true" size={13} weight="light" />
            Download .md
          </Button>
        </div>
      </div>
      <p role="status" className="sr-only">
        {copied === "done" ? "Markdown copied" : copied === "failed" ? "Couldn't copy. Select the text and copy it." : ""}
      </p>
      {copied === "failed" && <p className="mt-1 text-xs leading-4 text-graphite">Couldn&rsquo;t copy. Select the text and copy it.</p>}
      <pre
        tabIndex={0}
        aria-label="Markdown"
        className="mt-2 max-h-[560px] overflow-auto rounded-xl bg-tray p-3 font-mono text-[11px] leading-[17px] whitespace-pre-wrap text-ink select-text [overflow-wrap:anywhere]"
      >
        {markdown}
      </pre>
    </section>
  );
}
