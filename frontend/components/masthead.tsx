"use client";

import { motion } from "motion/react";
import { DUR, EASE_ENTER } from "@/lib/motion";

/*
 * The masthead (decisions 53, 55, 68): the horizon art flipped, so the navy
 * planet starts at the very top edge, under a top bar with no background,
 * and its ASCII surface dissolves downward past the cobalt atmosphere line
 * into the page. Each screen frames a different stretch of the arc; moving
 * between screens pans along it. Decorative only.
 */

export type Scene = "home" | "deals" | "company" | "digest";

/** Horizontal focus along the arc per screen (kept away from the edges so the band never shows blank). */
const FOCUS_X: Record<Scene, number> = { home: 0.5, deals: 0.3, company: 0.7, digest: 0.4 };
/** Vertical focus on the flipped art: high enough that the dense surface reaches the top edge at any panel width. */
const FOCUS_Y = 0.32;

/**
 * Band height in px, measured from the very top edge. Home keeps the full band (its min-h calc in
 * panel.tsx counts on it); inner screens use a shorter one so the back link and title sit just under
 * the art's faded end instead of below a strip of empty paper (decision 69).
 */
const BAND = { full: 160, inner: 104 } as const;

export function Masthead({ scene, inner = false }: { scene: Scene; inner?: boolean }) {
  return (
    <motion.div
      aria-hidden="true"
      // Pulled up behind the top bar (44px) and the page's 12px padding, so the art reaches the top edge.
      className="pointer-events-none relative -mx-4 -mt-[56px] overflow-hidden"
      style={{ maskImage: "linear-gradient(to bottom, #000 0%, #000 45%, transparent 100%)" }}
      initial={false}
      animate={{ height: inner ? BAND.inner : BAND.full }}
      transition={{ duration: DUR.base, ease: EASE_ENTER }}
    >
      <motion.img
        src="/art/horizon.webp"
        alt=""
        className="absolute top-1/2 left-1/2 w-[220%] max-w-none"
        initial={false}
        animate={{ x: `${-FOCUS_X[scene] * 100}%`, y: `${-FOCUS_Y * 100}%`, scaleY: -1 }}
        transition={{ duration: DUR.signature + 0.2, ease: EASE_ENTER }}
      />
      {/* A soft navy shade where the top bar sits, so the white wordmark reads over the characters. Not a bar: it fades out. */}
      <div className="absolute inset-x-0 top-0 h-[72px] bg-gradient-to-b from-ink/85 via-ink/55 to-transparent" />
    </motion.div>
  );
}
