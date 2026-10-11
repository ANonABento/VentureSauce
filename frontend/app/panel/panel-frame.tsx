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
      {/*
       * Glass (decision 64): frosted navy over the horizon art, which runs up behind it. The tint stays dark
       * enough that the white wordmark holds its contrast when white cards scroll underneath.
       */}
      <div className="sticky top-0 z-20 flex h-11 shrink-0 items-center justify-between border-b border-white/10 bg-ink/62 px-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.1)] backdrop-blur-[6px] backdrop-saturate-150">
        <Wordmark inverse />
        {/* The fine print, one tap away on every screen instead of printed at the foot of each (decision 41). */}
        <InfoTip inverse label="About these checks">
          Differences between sources, not findings of wrongdoing. Automated comparison of public records; may be
          incomplete or out of date. Not investment advice. Your inbox is private to this browser.
        </InfoTip>
      </div>
      <main className="flex-1 px-4 pt-3 pb-8">{children}</main>
    </div>
  );
}
