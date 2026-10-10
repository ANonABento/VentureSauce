"use client";

import { type ReactNode, useEffect, useState } from "react";
import { MotionConfig, animate, motion, useReducedMotion } from "motion/react";
import { DUR, EASE_ENTER, RISE, STAGGER } from "@/lib/motion";

/** Honors the OS reduced-motion setting for every motion component below it. */
export function MotionRoot({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

const TAGS = { div: motion.div, li: motion.li, section: motion.section, p: motion.p } as const;

/**
 * Rises 8px and fades in once, `index` steps after its siblings (40ms each).
 * Under reduced motion, MotionConfig drops the rise and keeps a plain fade.
 */
export function Rise({
  index = 0,
  delay = 0,
  as = "div",
  className,
  children,
}: {
  index?: number;
  delay?: number;
  as?: keyof typeof TAGS;
  className?: string;
  children: ReactNode;
}) {
  const Tag = TAGS[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: RISE }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.reveal, ease: EASE_ENTER, delay: delay + index * STAGGER }}
    >
      {children}
    </Tag>
  );
}

/**
 * A figure that counts up to its value once, so it resolves instead of popping
 * in. Screen readers get the final value only; the running digits are hidden.
 */
export function CountUp({
  value,
  format = (n) => String(n),
  delay = 0.08,
  className,
}: {
  value: number;
  format?: (n: number) => string;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const controls = animate(0, value, {
      duration: DUR.reveal,
      ease: EASE_ENTER,
      delay,
      onUpdate: (n) => setShown(Math.round(n)),
    });
    return () => controls.stop();
  }, [value, delay, reduce]);

  return (
    <span className={className}>
      <span aria-hidden="true">{format(reduce ? value : shown)}</span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}
