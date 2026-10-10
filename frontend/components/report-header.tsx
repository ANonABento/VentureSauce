"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "./cn";
import { formatDate } from "./report-utils";

/** Compact header: company name, then domain and date checked on one quiet line. */
export function ReportHeader({
  company,
  checkedAt,
  size = "panel",
  layoutId,
  children,
}: {
  company: { name: string; domain?: string };
  checkedAt?: string;
  size?: "panel" | "page";
  /** Shared-element id: the name glides here from the inbox row it was opened from. */
  layoutId?: string;
  /** Sits under the name, before the meta line (the company's signal strip). */
  children?: ReactNode;
}) {
  const meta = [
    company.domain,
    checkedAt && `checked ${formatDate(checkedAt)}`,
  ].filter(Boolean);

  return (
    <header>
      <motion.h1
        layoutId={layoutId}
        className={cn(
          // w-fit keeps the box the shape of the text, so the shared-element glide scales it evenly.
          "w-fit max-w-full font-serif tracking-[-0.02em] text-ink",
          size === "page" ? "text-[36px] leading-10" : "text-[26px] leading-[30px]",
        )}
      >
        {company.name}
      </motion.h1>
      {children}
      {meta.length > 0 && (
        <p className="mt-1 truncate text-xs leading-4 text-graphite">
          {meta.join(" · ")}
        </p>
      )}
    </header>
  );
}
