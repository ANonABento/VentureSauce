"use client";

import { type ReactNode, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/button";
import { type DigestPeriod, DigestReport, digestReportTitle, useDigestReport } from "@/components/digest-report";
import { SauceReport, useSauceReport } from "@/components/sauce-report";

/** `?print=1` waits for the entrance (count-up, bars, range plots) to settle before opening the dialog. */
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

/**
 * Print plumbing shared by both reports: the tab title (the saved PDF's
 * filename), final values on ⌘P, and `?print=1` opening the dialog once the
 * report is ready. The flag is dropped from the URL so a reload doesn't print again.
 */
function usePrintable(title: string | null, ready: boolean) {
  const autoPrint = useSearchParams().get("print") === "1";
  const printed = useRef(false);

  useEffect(() => {
    if (title) document.title = title;
  }, [title]);

  useEffect(() => {
    window.addEventListener("beforeprint", settleAnimations);
    return () => window.removeEventListener("beforeprint", settleAnimations);
  }, []);

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

function DownloadButton() {
  return (
    <Button className="gap-1.5" title="Opens the print dialog; choose Save as PDF" onClick={printReport}>
      <DownloadSimple aria-hidden="true" size={16} weight="light" />
      Download PDF
    </Button>
  );
}

function RetryButton({ onRetry }: { onRetry: () => void }) {
  return (
    <Button variant="quiet" size="xs" onClick={onRetry}>
      Retry
    </Button>
  );
}

/** /sauce?company=<id> or /sauce?digest=day|week. Either takes `print=1`, `ws` and `api` (lib/api.ts). */
export function SauceReportPage() {
  const params = useSearchParams();
  const digest = params.get("digest");
  if (digest !== null) return <DigestReportPage period={digest === "week" ? "week" : "day"} />;
  return <CompanyReportPage companyId={params.get("company")} />;
}

function CompanyReportPage({ companyId }: { companyId: string | null }) {
  const { state, retry } = useSauceReport(companyId);
  const ready = state.status === "ready";
  usePrintable(ready ? `Sauce Report — ${state.view.company.name}` : null, ready);

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
      <SauceStatus action={<RetryButton onRetry={retry} />}>
        Couldn&rsquo;t load this report ({state.message}).
      </SauceStatus>
    );
  }

  return (
    <Frame toolbar={<DownloadButton />}>
      <SauceReport view={state.view} report={state.report} />
    </Frame>
  );
}

function DigestReportPage({ period }: { period: DigestPeriod }) {
  const { state, retry } = useDigestReport(period);
  const ready = state.status === "ready";
  usePrintable(ready ? digestReportTitle(period, state.at) : null, ready);

  if (state.status === "loading") return <SauceStatus>Loading the report</SauceStatus>;

  if (state.status === "error") {
    return (
      <SauceStatus action={<RetryButton onRetry={retry} />}>
        Couldn&rsquo;t load this report ({state.message}).
      </SauceStatus>
    );
  }

  return (
    <Frame toolbar={<DownloadButton />}>
      <DigestReport digest={state.digest} at={state.at} />
    </Frame>
  );
}
