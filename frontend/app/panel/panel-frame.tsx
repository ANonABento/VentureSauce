import type { ReactNode } from "react";
import { InfoTip } from "@/components/info-tip";
import { Wordmark } from "@/components/logo";

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
      <div className="sticky top-0 z-10 flex h-11 shrink-0 items-center justify-between bg-paper/95 px-4 backdrop-blur-[2px]">
        <Wordmark />
        {/* The fine print, one tap away on every screen instead of printed at the foot of each (decision 41). */}
        <InfoTip label="About these checks">
          Differences between sources, not findings of wrongdoing. Automated comparison of public records; may be
          incomplete or out of date. Not investment advice. Your inbox is private to this browser.
        </InfoTip>
      </div>
      <main className="flex-1 px-4 pt-3 pb-8">{children}</main>
    </div>
  );
}
