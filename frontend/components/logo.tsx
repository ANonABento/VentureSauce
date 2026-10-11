import { cn } from "./cn";

/** A cobalt sun cresting the horizon. `inverse` draws it for the navy header. Figma: Logo/Mark. */
export function LogoMark({ className, inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <path d="M5 14a7 7 0 0 1 14 0Z" className={inverse ? "fill-[#8ea0ff]" : "fill-accent"} />
      <rect x="2" y="15" width="20" height="2" rx="1" className={inverse ? "fill-paper" : "fill-ink"} />
    </svg>
  );
}

/** Mark + wordmark, Geist semibold. Figma: Logo/Lockup (compact). */
export function Wordmark({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <LogoMark inverse={inverse} className="h-[18px] w-[18px]" />
      <span className={cn("text-[13px] leading-4 font-semibold tracking-[-0.02em]", inverse ? "text-paper" : "text-ink")}>
        VentureSauce
      </span>
    </span>
  );
}
