import { SourceFlow } from "./viz";

/** The single-company check (the /panel/states flow). */
export const LOADING_STEPS = ["SEC filings", "The web", "Compare"];

/** A dropped item's job, one node per source it is checked against. */
export const JOB_FLOW = ["Item", "SEC", "LinkedIn", "Press", "Your items"];

const JOB_INDEX: Record<string, number> = {
  parsing: 0,
  checking_sec: 1,
  checking_linkedin: 2,
  checking_press: 3,
  comparing_sources: 4,
  ready: 5,
};

/** Which JOB_FLOW node a job status is on. Unknown statuses stay on the first node. */
export const jobStep = (status: string | null | undefined) => JOB_INDEX[status ?? ""] ?? 0;

/**
 * Loading as a source-flow diagram in a mist tray (decision 28). `current` is
 * the index of the step in progress; every step before it is complete.
 */
export function LoadingSteps({ current, steps = LOADING_STEPS }: { current: number; steps?: string[] }) {
  return (
    <div className="tray px-4 pt-4 pb-3">
      <SourceFlow steps={steps} current={current} />
    </div>
  );
}
