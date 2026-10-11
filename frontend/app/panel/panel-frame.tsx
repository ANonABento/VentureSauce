import type { ReactNode } from "react";
import { TopBar } from "@/components/top-bar";

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
      <TopBar embedded={embedded} />
      <main className="flex-1 px-4 pt-3 pb-8">{children}</main>
    </div>
  );
}
