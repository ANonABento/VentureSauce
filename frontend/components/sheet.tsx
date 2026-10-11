"use client";

import { type ReactNode, useEffect, useId, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "@phosphor-icons/react/dist/ssr";
import { DUR, EASE_ENTER, SPRING } from "@/lib/motion";

/**
 * A bottom sheet over the panel (decision 62): details one tap away from the
 * figure that summarises them. Escape, the scrim or ✕ closes it; focus moves
 * into the sheet and back to whatever opened it.
 */
export function Sheet({ open, title, onClose, children }: { open: boolean; title: ReactNode; onClose: () => void; children: ReactNode }) {
  return <AnimatePresence>{open && <Panel title={title} onClose={onClose}>{children}</Panel>}</AnimatePresence>;
}

function Panel({ title, onClose, children }: { title: ReactNode; onClose: () => void; children: ReactNode }) {
  const id = useId();
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    body.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center">
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-ink/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: DUR.base }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        className="relative flex max-h-[82vh] w-full max-w-[420px] flex-col rounded-t-2xl bg-paper shadow-[0_-8px_32px_-8px_rgb(10_31_61/0.2)]"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%", transition: { duration: 0.2, ease: EASE_ENTER } }}
        transition={SPRING}
      >
        <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-2">
          <h2 id={id} className="flex items-center gap-2 font-serif text-lg leading-6 text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-graphite transition-colors duration-150 hover:bg-tray hover:text-ink"
          >
            <X aria-hidden="true" size={16} weight="light" />
          </button>
        </div>
        <div ref={body} tabIndex={-1} className="overflow-y-auto px-4 pb-6 outline-none">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
