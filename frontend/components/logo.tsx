/** Sunrise mark: an amber sun cresting the horizon. Figma: Logo/Mark. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <path d="M5 14a7 7 0 0 1 14 0Z" className="fill-accent" />
      <rect x="2" y="15" width="20" height="2" rx="1" className="fill-ink" />
    </svg>
  );
}

/** Mark + wordmark, Geist semibold. Figma: Logo/Lockup (compact). */
export function Wordmark() {
  return (
    <span className="flex items-center gap-1.5">
      <LogoMark className="h-[18px] w-[18px]" />
      <span className="text-[13px] leading-4 font-semibold tracking-[-0.02em] text-ink">VentureSauce</span>
    </span>
  );
}
