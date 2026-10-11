"use client";

import { useEffect, useState } from "react";
import { cn } from "./cn";
import { InfoTip } from "./info-tip";
import { Wordmark } from "./logo";

/** How far the page scrolls before the header is over content instead of the horizon art. */
const OVER_CONTENT = 72;

/**
 * The panel's header as a floating glass pane (decisions 64–65): frosted,
 * with a specular top edge, over the horizon art that runs up behind it.
 * Over the art it is clear glass with white text; once content scrolls under
 * it, it turns milky with navy text, so the wordmark always keeps its contrast.
 */
export function GlassHeader({ embedded = false }: { embedded?: boolean }) {
  const [overContent, setOverContent] = useState(embedded);

  useEffect(() => {
    if (embedded) return;
    const update = () => setOverContent(window.scrollY > OVER_CONTENT);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [embedded]);

  return (
    <div className="sticky top-0 z-20 shrink-0 px-2 pt-2">
      <div
        className={cn(
          "relative flex h-12 items-center justify-between overflow-hidden rounded-2xl border px-3.5 transition-[background-color,border-color,box-shadow] duration-300 ease-out",
          "backdrop-blur-[14px] backdrop-saturate-[1.8]",
          overContent
            ? "border-ink/10 bg-surface/70 shadow-[0_8px_24px_-12px_rgb(10_31_61/0.25),inset_0_1px_0_rgb(255_255_255/0.9)]"
            : "border-white/25 bg-white/10 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.45),inset_0_1px_0_rgb(255_255_255/0.4),inset_0_-1px_0_rgb(255_255_255/0.06)]",
        )}
      >
        {/* The specular sheen: light catching the top of the glass. */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b to-transparent transition-opacity duration-300",
            overContent ? "from-white/60 opacity-60" : "from-white/20 opacity-100",
          )}
        />
        <span className="relative">
          <Wordmark inverse={!overContent} />
        </span>
        {/* The fine print, one tap away on every screen instead of printed at the foot of each (decision 41). */}
        <InfoTip inverse={!overContent} label="About these checks" className="relative">
          Differences between sources, not findings of wrongdoing. Automated comparison of public records; may be
          incomplete or out of date. Not investment advice. Your inbox is private to this browser.
        </InfoTip>
      </div>
    </div>
  );
}
