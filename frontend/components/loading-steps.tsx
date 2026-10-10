import { cn } from "./cn";

export const LOADING_STEPS = [
  "Reading SEC filings",
  "Reading the web",
  "Comparing",
];

/**
 * A quiet status log. `current` is the index of the step in progress; every
 * step before it is complete. `steps` defaults to the three report steps.
 */
export function LoadingSteps({
  current,
  steps = LOADING_STEPS,
}: {
  current: number;
  steps?: string[];
}) {
  return (
    <div>
      <p role="status" className="sr-only">
        {steps[Math.min(current, steps.length - 1)]}
      </p>
      <ol className="space-y-3">
        {steps.map((label, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li
              key={label}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 text-[13px] leading-5 transition-colors duration-200 ease-out",
                done ? "text-ink" : "text-graphite",
              )}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 12 12"
                className={cn(
                  "h-3 w-3 text-ink transition-opacity duration-200 ease-out",
                  done ? "opacity-100" : "opacity-0",
                )}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M2 6.5l2.5 2.5L10 3.5" />
              </svg>
              <span>
                {label}
                {active && "…"}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
