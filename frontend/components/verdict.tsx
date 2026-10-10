"use client";

import { useEffect, useState } from "react";
import type { DeltaRow, DeltaStatus } from "@/lib/types";
import { cn } from "./cn";
import { STATUS, STATUS_ORDER } from "./status";

const SCRAMBLE = "#@%&*0123456789";

/** Resolves from random characters to the real value over ~400ms, once. */
function useScramble(value: string): string {
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const timer = setInterval(() => {
      frame += 1;
      if (frame >= 9) {
        clearInterval(timer);
        setShown(value);
        return;
      }
      setShown(
        [...value]
          .map(() => SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)])
          .join(""),
      );
    }, 45);
    return () => clearInterval(timer);
  }, [value]);

  return shown;
}

/**
 * The glance card: how many discrepancies, out of how many signals, with a
 * dithered bar showing the share of signals by status.
 */
export function Verdict({
  rows,
  size = "panel",
}: {
  rows: DeltaRow[];
  size?: "panel" | "page";
}) {
  const count = (status: DeltaStatus) =>
    rows.filter((row) => row.status === status).length;
  const discrepancies = count("discrepancy");
  const present = STATUS_ORDER.filter((status) => count(status) > 0);
  const number = useScramble(String(discrepancies));

  return (
    <section className="rounded-xl bg-tray p-2">
      <div className="rounded-lg bg-surface p-4 shadow-fragment">
        <p className="flex items-end gap-3">
          <span
            // The scramble shows other characters; read the real value.
            aria-label={String(discrepancies)}
            className={cn(
              "font-serif tracking-[-0.03em] lining-nums",
              size === "page" ? "text-[80px] leading-[64px]" : "text-[64px] leading-[52px]",
              discrepancies > 0 ? "text-signal" : "text-data",
            )}
          >
            <span aria-hidden="true">{number}</span>
          </span>
          <span className="pb-0.5">
            <span className="block text-sm leading-5 font-medium text-ink">
              {discrepancies === 1 ? "discrepancy" : "discrepancies"} found
            </span>
            <span className="block text-xs leading-4 text-graphite">
              of {rows.length} {rows.length === 1 ? "signal" : "signals"} checked
            </span>
          </span>
        </p>

        {/* Decorative: the legend below carries the same numbers as text. */}
        <div aria-hidden="true" className="mt-5 flex h-4 animate-grow gap-1">
          {present.map((status) => (
            <span
              key={status}
              className="dither"
              style={{
                flexGrow: count(status),
                flexBasis: 0,
                ["--dot" as string]: STATUS[status].dot,
              }}
            />
          ))}
        </div>

        <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs leading-4 text-graphite">
          {present.map((status) => (
            <li key={status} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: STATUS[status].dot }}
              />
              <span>
                <span className="text-ink">{count(status)}</span>{" "}
                {status === "discrepancy" && count(status) !== 1
                  ? "discrepancies"
                  : STATUS[status].label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
