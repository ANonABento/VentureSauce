"use client";

import { motion } from "motion/react";
import { DUR, EASE_ENTER } from "@/lib/motion";

/*
 * The masthead (decision 53): a band of the landscape at the top of every
 * screen, fading into the paper. Each screen frames a different part of the
 * valley; moving between screens pans across it, so the panel feels like one
 * place. Decorative only: titles sit in the faded part, data stays on paper.
 */

export type Scene = "sunrise" | "ridges" | "river" | "mist";

/** Focal points on the art, as fractions of its width and height (kept away from the edges so the band never shows blank). */
const FOCUS: Record<Scene, [number, number]> = {
  sunrise: [0.74, 0.24],
  ridges: [0.46, 0.3],
  river: [0.5, 0.66],
  mist: [0.3, 0.46],
};

export function Masthead({ scene }: { scene: Scene }) {
  const [fx, fy] = FOCUS[scene];
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative -mx-4 -mt-3 h-[150px] overflow-hidden"
      // Solid at the top, gone by 85%: the title row overlaps only the faint end.
      style={{ maskImage: "linear-gradient(to bottom, #000 0%, #000 30%, transparent 85%)" }}
    >
      <motion.img
        src="/art/landscape.webp"
        alt=""
        className="absolute top-1/2 left-1/2 w-[220%] max-w-none"
        initial={false}
        animate={{ x: `${-fx * 100}%`, y: `${-fy * 100}%` }}
        transition={{ duration: DUR.signature + 0.2, ease: EASE_ENTER }}
      />
    </div>
  );
}
