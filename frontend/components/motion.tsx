"use client";

import { type ReactNode, useLayoutEffect, useRef } from "react";
import { MotionConfig, animate, motion } from "motion/react";
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

/** Decimal places in a value (max 2), so a count-up of 2.5 doesn't land on "3". */
const decimals = (value: number) => Math.min(2, (String(value).split(".")[1] ?? "").length);

/**
 * A figure that counts up to its value once, so it resolves instead of popping
 * in. The server and first paint show the final value (no hydration mismatch,
 * correct without JS); the count-up writes to the DOM directly. Screen readers
 * get the final value only.
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
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const places = decimals(value);
    const show = (n: number) => {
      node.textContent = format(Number(n.toFixed(places)));
    };
    show(0);
    const controls = animate(0, value, { duration: DUR.reveal, ease: EASE_ENTER, delay, onUpdate: show });
    return () => {
      controls.stop();
      node.textContent = format(value);
    };
    // format is usually an inline arrow; the value is what matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay]);

  return (
    <span className={className}>
      <span ref={ref} aria-hidden="true">
        {format(value)}
      </span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}
