import { cn } from "./cn";

export const LOADING_STEPS = [
  "Reading SEC filings",
  "Reading the web",
  "Comparing",
];

/**
 * Three quiet steps. `current` is the index of the step in progress;
 * every step before it is complete.
 */
export function LoadingSteps({ current }: { current: number }) {
  return (
    <div>
      <p role="status" className="sr-only">
        {LOADING_STEPS[Math.min(current, LOADING_STEPS.length - 1)]}
      </p>
      <ol className="space-y-3">
        {LOADING_STEPS.map((label, index) => {
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
