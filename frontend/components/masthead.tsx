"use client";

import { motion } from "motion/react";
import { DUR, EASE_ENTER } from "@/lib/motion";

/*
 * The masthead (decisions 53, 55): a band of the horizon art at the top of
 * every screen: starry sky, the cobalt atmosphere line, the top of the navy
 * planet fading into the paper. Each screen frames a different stretch of the
 * arc; moving between screens pans along it. Decorative only: the title sits
 * below the band, on paper.
 */

export type Scene = "home" | "deals" | "company" | "digest";

/** Horizontal focus along the arc per screen (kept away from the edges so the band never shows blank). */
const FOCUS_X: Record<Scene, number> = { home: 0.5, deals: 0.3, company: 0.7, digest: 0.4 };
/** Vertical focus: the atmosphere line sits in the upper third, the planet fills the rest and fades out. */
const FOCUS_Y = 0.77;

export function Masthead({ scene }: { scene: Scene }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative -mx-4 -mt-3 h-[108px] overflow-hidden"
      // The sky is the paper colour already; only the dense planet fades out at the bottom.
      style={{ maskImage: "linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)" }}
    >
      <motion.img
        src="/art/horizon.webp"
        alt=""
        className="absolute top-1/2 left-1/2 w-[220%] max-w-none"
        initial={false}
        animate={{ x: `${-FOCUS_X[scene] * 100}%`, y: `${-FOCUS_Y * 100}%` }}
        transition={{ duration: DUR.signature + 0.2, ease: EASE_ENTER }}
      />
    </div>
  );
}
