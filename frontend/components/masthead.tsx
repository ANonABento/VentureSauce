"use client";

import { motion } from "motion/react";
import { DUR, EASE_ENTER } from "@/lib/motion";

/*
 * The masthead (decisions 53, 55, 56): the horizon art flipped, so the navy
 * planet surface continues straight out of the navy header and its ASCII
 * characters dissolve downward past the cobalt atmosphere line into the page.
 * Each screen frames a different stretch of the arc; navigating pans along it.
 * Decorative only: the title sits below, on paper.
 */

export type Scene = "home" | "deals" | "company" | "digest";

/** Horizontal focus along the arc per screen (kept away from the edges so the band never shows blank). */
const FOCUS_X: Record<Scene, number> = { home: 0.5, deals: 0.3, company: 0.7, digest: 0.4 };
/** Vertical focus on the flipped art: the densest surface meets the header, the atmosphere line sits low in the band. */
const FOCUS_Y = 0.33;

export function Masthead({ scene }: { scene: Scene }) {
  return (
    <div
      aria-hidden="true"
      // Pulled up behind the floating glass header (56px with its margin, plus the page's 12px padding), so the art shows through it.
      className="pointer-events-none relative -mx-4 -mt-[68px] h-[176px] overflow-hidden"
      // Solid where it meets the header, gone by the bottom.
      style={{ maskImage: "linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)" }}
    >
      <motion.img
        src="/art/horizon.webp"
        alt=""
        className="absolute top-1/2 left-1/2 w-[220%] max-w-none"
        initial={false}
        animate={{ x: `${-FOCUS_X[scene] * 100}%`, y: `${-FOCUS_Y * 100}%`, scaleY: -1 }}
        transition={{ duration: DUR.signature + 0.2, ease: EASE_ENTER }}
      />
    </div>
  );
}
