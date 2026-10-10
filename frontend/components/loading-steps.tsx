import { CheckCircle, MinusCircle } from "@phosphor-icons/react/dist/ssr";
import { cn } from "./cn";

export const LOADING_STEPS = [
  "Reading SEC filings",
  "Reading the web",
  "Comparing",
];

/**
 * The live status log (v2): one mono line per step in a mist tray. `current`
 * is the index of the step in progress; every step before it is complete.
 * The running step's spinner is one of amber's four sanctioned uses.
 */
export function LoadingSteps({ current }: { current: number }) {
  return (
    <div className="tray py-2.5">
      <p role="status" className="sr-only">
        {LOADING_STEPS[Math.min(current, LOADING_STEPS.length - 1)]}
      </p>
      <ol>
        {LOADING_STEPS.map((label, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li
              key={label}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex items-center gap-2.5 py-1.5 font-mono text-xs leading-[18px] transition-colors duration-200 ease-out",
                done || active ? "text-ink" : "text-graphite",
              )}
            >
              {done ? (
                <CheckCircle aria-hidden="true" size={16} weight="light" className="shrink-0 text-data" />
              ) : active ? (
                <span
                  aria-hidden="true"
                  className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-[1.5px] border-tray-strong border-t-accent motion-reduce:animate-none"
                />
              ) : (
                <MinusCircle aria-hidden="true" size={16} weight="light" className="shrink-0 text-rule-strong" />
              )}
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
