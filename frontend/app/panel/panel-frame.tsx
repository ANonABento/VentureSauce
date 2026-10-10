import type { ReactNode } from "react";

/** The side panel's column: sticky top bar with wordmark + company, then content. */
export function PanelFrame({
  company,
  embedded = false,
  children,
}: {
  company?: string;
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
      <div className="sticky top-0 z-10 flex h-10 shrink-0 items-center justify-between gap-4 border-b border-rule bg-paper px-5">
        <span className="micro-label shrink-0 text-graphite">Filing Delta</span>
        {company && (
          <span className="truncate text-xs leading-4 text-graphite">
            {company}
          </span>
        )}
      </div>
      <main className="flex-1 px-5 pt-6 pb-8">{children}</main>
    </div>
  );
}
