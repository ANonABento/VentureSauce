"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { type CompanyView, getCompany, getReport } from "@/lib/api";
import type { DeltaReport } from "@/lib/types";
import { Button } from "@/components/button";
import { SauceReport } from "@/components/sauce-report";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; view: CompanyView; report: DeltaReport | null };

/** `?print=1` waits for the entrance (count-up, dither bars, range plots) to settle before opening the dialog. */
const AUTO_PRINT_DELAY_MS = 1400;

/** Jumps running entrance animations to their end, so a print started mid-reveal shows final values. */
function settleAnimations() {
  for (const animation of document.getAnimations()) {
    if (animation.effect?.getComputedTiming().endTime !== Infinity) animation.finish();
  }
}

function printReport() {
  settleAnimations();
  window.print();
}

/** The page frame: the screen-only toolbar, then the document column. */
function Frame({ toolbar, children }: { toolbar?: ReactNode; children: ReactNode }) {
  return (
    <main className="w-full flex-1 px-4 pt-6 pb-16 sm:px-8 print:p-0">
      <div className="mx-auto flex min-h-9 w-full max-w-[656px] items-center justify-end print:hidden">{toolbar}</div>
      <div className="mt-6 print:mt-0">{children}</div>
    </main>
  );
}

/** Loading, empty and error states: one quiet line, plus an action when there is one. */
export function SauceStatus({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <Frame>
      <div className="mx-auto flex w-full max-w-[656px] items-center gap-3">
        <p role="status" className="text-[13px] leading-5 text-graphite">
          {children}
        </p>
        {action}
      </div>
    </Frame>
  );
}

export function SauceReportPage() {
  const params = useSearchParams();
  const companyId = params.get("company");
  const autoPrint = params.get("print") === "1";
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const printed = useRef(false);

  useEffect(() => {
    if (!companyId) return;
    let live = true;
    Promise.all([getCompany(companyId), getReport({ companyId }).catch(() => null)])
      .then(([view, report]) => {
        if (live) setState({ status: "ready", view, report });
      })
      .catch((error: unknown) => {
        if (live) setState({ status: "error", message: error instanceof Error ? error.message : String(error) });
      });
    return () => {
      live = false;
    };
  }, [companyId, attempt]);

  // The saved PDF takes its filename from the title.
  const name = state.status === "ready" ? state.view.company.name : null;
  useEffect(() => {
    if (name) document.title = `Sauce Report — ${name}`;
  }, [name]);

  // ⌘P from the browser menu prints the final state too.
  useEffect(() => {
    window.addEventListener("beforeprint", settleAnimations);
    return () => window.removeEventListener("beforeprint", settleAnimations);
  }, []);

  // ?print=1: open the print dialog once, after the data and fonts are in. The flag is dropped
  // from the URL so a reload shows the report instead of printing again.
  const ready = state.status === "ready";
  useEffect(() => {
    if (!ready || !autoPrint) return;
    const timer = window.setTimeout(() => {
      if (printed.current) return;
      printed.current = true;
      const url = new URL(window.location.href);
      url.searchParams.delete("print");
      window.history.replaceState(null, "", url);
      document.fonts.ready.then(printReport);
    }, AUTO_PRINT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [ready, autoPrint]);

  if (!companyId) {
    return (
      <SauceStatus
        action={
          <Link href="/panel" className="text-[13px] leading-5 font-medium text-ink underline underline-offset-4">
            Open the inbox
          </Link>
        }
      >
        No company chosen.
      </SauceStatus>
    );
  }

  if (state.status === "loading") return <SauceStatus>Loading the report</SauceStatus>;

  if (state.status === "error") {
    return (
      <SauceStatus
        action={
          <Button
            variant="quiet"
            size="xs"
            onClick={() => {
              setState({ status: "loading" });
              setAttempt((n) => n + 1);
            }}
          >
            Retry
          </Button>
        }
      >
        Couldn&rsquo;t load this report ({state.message}).
      </SauceStatus>
    );
  }

  return (
    <Frame
      toolbar={
        <Button className="gap-1.5" title="Opens the print dialog; choose Save as PDF" onClick={printReport}>
          <DownloadSimple aria-hidden="true" size={16} weight="light" />
          Download PDF
        </Button>
      }
    >
      <SauceReport view={state.view} report={state.report} />
    </Frame>
  );
}
