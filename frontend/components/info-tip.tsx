"use client";

import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Info } from "@phosphor-icons/react/dist/ssr";
import { DUR, EASE_ENTER } from "@/lib/motion";
import { cn } from "./cn";

/**
 * An ⓘ button with a small popover (decision 41): fine print that stays one
 * tap away instead of printed on every screen. Escape or a click outside closes it.
 */
export function InfoTip({
  label,
  children,
  align = "end",
  className,
}: {
  /** The button's accessible name. */
  label: string;
  children: ReactNode;
  align?: "start" | "end";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const onClick = (event: MouseEvent) => !root.current?.contains(event.target as Node) && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <span ref={root} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full transition-colors duration-150",
          open ? "bg-tray text-ink" : "text-graphite hover:text-ink",
        )}
      >
        <Info aria-hidden="true" size={15} weight="light" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            role="note"
            className={cn(
              "fragment absolute top-7 z-20 block w-60 rounded-lg px-3 py-2.5 text-left text-[11px] leading-4 text-graphite",
              align === "end" ? "right-0" : "left-0",
            )}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: DUR.fast * 1.5, ease: EASE_ENTER }}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
