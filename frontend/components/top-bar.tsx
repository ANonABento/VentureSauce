"use client";

import { useEffect, useState } from "react";
import { cn } from "./cn";
import { InfoTip } from "./info-tip";
import { Wordmark } from "./logo";

/** How far the page scrolls before the bar is over content instead of the horizon art. */
const OVER_CONTENT = 64;

/**
 * The panel's top bar (decision 68). At the top it has no background: the
 * flipped horizon art starts at the very edge and the wordmark sits on the
 * navy planet in white, so there is no white-to-navy seam. Once content
 * scrolls under it, it becomes the plain paper bar with the navy wordmark.
 */
export function TopBar({ embedded = false }: { embedded?: boolean }) {
  const [overContent, setOverContent] = useState(embedded);

  useEffect(() => {
    if (embedded) return;
    const update = () => setOverContent(window.scrollY > OVER_CONTENT);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [embedded]);

  return (
    <div
      className={cn(
        "sticky top-0 z-20 flex h-11 shrink-0 items-center justify-between px-4 transition-[background-color,box-shadow] duration-300 ease-out",
        overContent ? "bg-paper/95 shadow-[0_1px_0_var(--rule)] backdrop-blur-[2px]" : "bg-transparent",
      )}
    >
      <Wordmark inverse={!overContent} />
      {/* The fine print, one tap away on every screen instead of printed at the foot of each (decision 41). */}
      <InfoTip inverse={!overContent} label="About these checks">
        Differences between sources, not findings of wrongdoing. Automated comparison of public records; may be
        incomplete or out of date. Not investment advice. Your inbox is private to this browser.
      </InfoTip>
    </div>
  );
}
