import type { ReactNode } from "react";

/** The side panel's column: sticky top bar with the wordmark, then content. */
export function PanelFrame({
  embedded = false,
  children,
}: {
  /** Sized by its container instead of the viewport (the /panel/states overview). */
  embedded?: boolean;
  children?: ReactNode;
}) {
  return (
    // Fills the extension's side panel; capped and edged when opened as a page.
    <div
      className={
        embedded
          ? "flex min-h-full w-full flex-col"
          : "mx-auto flex min-h-dvh w-full max-w-[420px] flex-col border-rule min-[421px]:border-x"
      }
    >
      <div className="sticky top-0 z-10 flex h-11 shrink-0 items-center gap-2 bg-paper/90 px-5 backdrop-blur">
        {/* The sunrise mark: one of amber's four allowed uses. */}
        <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
          <path d="M3.5 10a4.5 4.5 0 0 1 9 0z" fill="var(--accent)" />
          <rect x="1" y="10" width="14" height="2" rx="1" fill="var(--ink)" />
        </svg>
        <span className="text-[13px] leading-4 font-semibold text-ink">VentureSauce</span>
      </div>
      <main className="flex-1 px-5 pt-3 pb-8">{children}</main>
    </div>
  );
}
