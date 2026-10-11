"use client";

import { type FormEvent, useEffect, useState } from "react";
import { motion } from "motion/react";
import { DownloadSimple, MagnifyingGlass, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { API, getHealth } from "@/lib/api";
import { DUR, EASE_ENTER, RISE } from "@/lib/motion";
import { ArtDropZone, type DropInput } from "./art-drop";
import { Button } from "./button";
import { Greeting } from "./home";

/**
 * The empty inbox (decisions 32, 46): the same home layout with only the
 * greeting, the art drop zone, the example and the lookup. On drop the art
 * breaks into its dot grid and the card becomes the source flow.
 */
export function FirstRun({
  onPick,
  busy,
  step,
  filing,
  onLookup,
  onExample,
  loadingExample = false,
}: {
  onPick: (input: DropInput) => void;
  busy: boolean;
  step: number;
  filing?: string | null;
  /** Resolves to a message to show when the company isn't in the inbox. */
  onLookup: (name: string) => Promise<string | null>;
  /** Copies the prebuilt example inbox into this workspace (a fictional company plus two real startups' public claims). */
  onExample?: () => void;
  loadingExample?: boolean;
}) {
  const [name, setName] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);
  // Say plainly when public-record lookups aren't connected yet (/health reports sources: stub | live).
  const [live, setLive] = useState(true);
  useEffect(() => {
    getHealth()
      .then((h) => setLive(h.sources === "live"))
      .catch(() => {});
  }, []);

  async function lookup(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setLooking(true);
    setNote(await onLookup(name.trim()));
    setLooking(false);
  }

  return (
    <div>
      <Greeting />
      <motion.div
        className="mt-5"
        initial={{ opacity: 0, y: RISE }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DUR.reveal, ease: EASE_ENTER, delay: 0.05 }}
      >
        <ArtDropZone tall onPick={onPick} busy={busy} step={step} filing={filing} />
      </motion.div>

      {onExample && (
        <motion.div
          className="mt-4 flex items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: busy ? 0.4 : 1 }}
          transition={{ duration: DUR.reveal, ease: EASE_ENTER, delay: 0.2 }}
        >
          <Button variant="quiet" onClick={onExample} disabled={busy || loadingExample}>
            <Sparkle aria-hidden="true" size={14} weight="duotone" className="mr-1.5 text-data" />
            {loadingExample ? "Loading…" : "Try an example"}
          </Button>
          <a
            href={`${API}/samples/`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-graphite transition-colors duration-150 hover:text-ink"
          >
            <DownloadSimple aria-hidden="true" size={14} weight="light" />
            Test files
          </a>
        </motion.div>
      )}

      <motion.form
        onSubmit={lookup}
        className="mt-7"
        initial={{ opacity: 0, y: RISE }}
        animate={{ opacity: busy ? 0.4 : 1, y: 0 }}
        transition={{ duration: DUR.reveal, ease: EASE_ENTER, delay: 0.24 }}
      >
        <label htmlFor="lookup" className="block text-sm leading-5 font-medium text-ink">
          Or look up a company
        </label>
        <div className="@container mt-2">
          <div className="flex flex-col gap-2 @[22rem]:flex-row">
            <span className="relative block min-w-0 flex-1">
              <MagnifyingGlass
                aria-hidden="true"
                size={16}
                weight="light"
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-graphite"
              />
              <input
                id="lookup"
                value={name}
                disabled={busy}
                onChange={(event) => {
                  setName(event.target.value);
                  setNote(null);
                }}
                autoComplete="off"
                placeholder="e.g. Quillfeather Robotics"
                className="block h-9 w-full rounded-full border border-rule-strong bg-surface pr-3 pl-9 text-sm text-ink placeholder:text-graphite"
              />
            </span>
            <Button type="submit" variant="quiet" disabled={busy || looking}>
              {looking ? "Looking…" : "Check"}
            </Button>
          </div>
        </div>
        {note && (
          <p role="status" className="mt-2 text-xs leading-4 text-graphite">
            {note}
          </p>
        )}
      </motion.form>

      <p className="mt-6 text-[11px] leading-4 text-graphite">
        Private to this browser. The example is a fictional company plus two real startups&apos; public claims.
        {!live && " Public-record lookups aren't connected yet; your items are still compared with each other."}
      </p>
    </div>
  );
}
