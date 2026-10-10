"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/button";
import { DeltaRows } from "@/components/delta-rows";
import { Disclaimer } from "@/components/disclaimer";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LOADING_STEPS, LoadingSteps } from "@/components/loading-steps";
import { ReportHeader } from "@/components/report-header";
import { hasFiling } from "@/components/report-utils";
import type { DeltaReport } from "@/lib/types";
import {
  type DeltaQuery,
  detectCompany,
  getDeltaReport,
} from "./get-delta-report";
import { PanelFrame } from "./panel-frame";

// getDeltaReport is a single call, so the steps advance on a timer and the
// last one stays in progress until the report arrives.
const STEP_MS = 800;

type Status = "idle" | "detected" | "loading" | "report" | "empty" | "error";
type Subject = { name?: string; domain?: string };

export function Panel() {
  const pageUrl = useSearchParams().get("url");
  // Start over whenever the extension points the panel at another page.
  return <PanelFlow key={pageUrl ?? ""} pageUrl={pageUrl} />;
}

function PanelFlow({ pageUrl }: { pageUrl: string | null }) {
  const detected = detectCompany(pageUrl);

  const [status, setStatus] = useState<Status>(detected ? "detected" : "idle");
  const [subject, setSubject] = useState<Subject>(detected ?? {});
  const [query, setQuery] = useState<DeltaQuery>(
    detected && pageUrl ? { url: pageUrl } : {},
  );
  const [report, setReport] = useState<DeltaReport | null>(null);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");

  useEffect(() => {
    if (status !== "loading") return;
    const timer = setInterval(
      () => setStep((value) => Math.min(value + 1, LOADING_STEPS.length - 1)),
      STEP_MS,
    );
    return () => clearInterval(timer);
  }, [status]);

  async function run(nextQuery: DeltaQuery, nextSubject: Subject) {
    setQuery(nextQuery);
    setSubject(nextSubject);
    setStep(0);
    setStatus("loading");
    try {
      const result = await getDeltaReport(nextQuery);
      setReport(result);
      setStatus(hasFiling(result) ? "report" : "empty");
    } catch {
      setStatus("error");
    }
  }

  function submitName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const company = name.trim();
    if (company) run({ company }, { name: company });
  }

  const hasReport = status === "report" || status === "empty";
  const title = subject.name ?? subject.domain ?? "";
  const subjectHeader = (
    <ReportHeader
      company={{ name: title, domain: subject.name ? (subject.domain ?? "") : "" }}
    />
  );

  return (
    <PanelFrame company={hasReport ? report?.company.name : title}>
      {status === "idle" && (
        <>
          <h1 className="font-serif text-[22px] leading-7 font-medium tracking-tight text-ink">
            No company detected on this page.
          </h1>
          <p className="mt-2 text-sm leading-5 text-graphite">
            Type a company name to compare what it filed with the SEC against
            what it says publicly.
          </p>
          <form onSubmit={submitName} className="mt-6">
            <label htmlFor="company" className="micro-label block text-graphite">
              Company name
            </label>
            <input
              id="company"
              name="company"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              autoComplete="off"
              placeholder="e.g. Quillfeather Robotics"
              className="mt-2 block h-9 w-full rounded-[2px] border border-rule bg-surface px-3 text-sm text-ink placeholder:text-graphite"
            />
            <Button type="submit" className="mt-3">
              Compare filings
            </Button>
          </form>
        </>
      )}

      {status === "detected" && (
        <>
          {subjectHeader}
          <p className="mt-4 text-sm leading-5 text-graphite">
            Compare what this company filed with the SEC against what it says
            publicly.
          </p>
          <Button className="mt-6" onClick={() => run(query, subject)}>
            Compare filings
          </Button>
        </>
      )}

      {status === "loading" && (
        <>
          {subjectHeader}
          <div className="mt-6 border-t border-rule pt-4">
            <LoadingSteps current={step} />
          </div>
        </>
      )}

      {status === "report" && report && (
        <>
          <ReportHeader
            company={report.company}
            checkedAt={report.generatedAt}
            headline={report.headline}
          />
          <div className="mt-6">
            <DeltaRows rows={report.rows} />
          </div>
          <Disclaimer className="mt-6" />
        </>
      )}

      {status === "empty" && report && (
        <>
          <ReportHeader
            company={report.company}
            checkedAt={report.generatedAt}
          />
          <div className="mt-6 border-t border-rule pt-4">
            <EmptyState />
          </div>
        </>
      )}

      {status === "error" && (
        <>
          {subjectHeader}
          <div className="mt-6 border-t border-rule pt-4">
            <ErrorState onRetry={() => run(query, subject)} />
          </div>
        </>
      )}
    </PanelFrame>
  );
}
