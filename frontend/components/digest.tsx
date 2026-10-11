"use client";

import { useEffect, useId, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CaretDown, ChatCircleDots, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { type Digest, getDigest } from "@/lib/api";
import { SPRING, STAGGER } from "@/lib/motion";
import { BriefPlayer } from "./brief";
import { cn } from "./cn";
import { Collapse } from "./collapse";
import { KindIcons } from "./inbox";
import { CountUp, Rise } from "./motion";
import { DitherBar, Figure } from "./viz";

type DigestCompanyData = Digest["companies"][number];

/*
 * Data rule: each company's `discrepancies` already includes its "across your
 * sources" rows, and `contradictions` counts those. So flags = discrepancies
 * length and public-record flags = flags − contradictions; totals likewise.
 */

/** The glyphs, with the exact classes SignalStrip uses, so the legend matches the cards. */
function Dot() {
  return <span aria-hidden="true" className="block h-[7px] w-[7px] shrink-0 rounded-full bg-signal" />;
}

function Diamond() {
  return <span aria-hidden="true" className="mx-px block h-[6px] w-[6px] shrink-0 rotate-45 border-[1.25px] border-signal" />;
}

/** The glyph key (decision 38): ● and ◇ are defined once, here, by the two top figures. */
function GlyphLegend({ totals }: { totals: Digest["totals"] }) {
  const publicCount = totals.discrepancies - totals.contradictions;
  return (
    <Rise delay={0.1} className="mt-5 grid grid-cols-2 gap-3">
      <Figure
        value={
          <span className="inline-flex items-center gap-2.5">
            <Dot />
            <CountUp value={publicCount} delay={0.15} />
          </span>
        }
        caption="vs public records"
        tone={publicCount > 0 ? "signal" : "ink"}
      />
      <Figure
        value={
          <span className="inline-flex items-center gap-2.5">
            <Diamond />
            <CountUp value={totals.contradictions} delay={0.15} />
          </span>
        }
        caption="between your items"
        tone={totals.contradictions > 0 ? "signal" : "ink"}
      />
    </Rise>
  );
}

/** "● 2  ◇ 2", glyphs alone (the legend above defines them). Zero counts are left out. */
function GlyphCounts({ publicCount, contradictions }: { publicCount: number; contradictions: number }) {
  return (
    <span aria-hidden="true" className="inline-flex items-center gap-3">
      {publicCount > 0 && (
        <span className="inline-flex items-center gap-1.5">
          <Dot />
          <span className="font-serif text-[15px] leading-5 text-ink">{publicCount}</span>
        </span>
      )}
      {contradictions > 0 && (
        <span className="inline-flex items-center gap-1.5">
          <Diamond />
          <span className="font-serif text-[15px] leading-5 text-ink">{contradictions}</span>
        </span>
      )}
    </span>
  );
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** One company: serif name, new-item kinds, flag count, a ranked bar, glyph counts (differences behind a tap) and its questions. */
function DigestCompany({
  company: c,
  scale,
  index,
  onOpen,
}: {
  company: DigestCompanyData;
  scale: number;
  index: number;
  onOpen: (id: string, tab?: "questions") => void;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const flags = c.discrepancies.length;
  const publicCount = flags - c.contradictions;
  const delay = 0.2 + index * STAGGER;
  const label = [
    publicCount > 0 && plural(publicCount, "discrepancy with public records", "discrepancies with public records"),
    c.contradictions > 0 && plural(c.contradictions, "contradiction between your items", "contradictions between your items"),
  ]
    .filter(Boolean)
    .join(", ");
  // Which glyph leads each row: all of one kind when the counts say so, else the "across your sources" rows are ◇.
  const isContradiction = (signal: string) =>
    c.contradictions === flags || (c.contradictions > 0 && /across your sources$/i.test(signal));

  return (
    <Rise as="section" index={index} delay={0.2} className="fragment px-3.5 py-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onOpen(c.id)}
          className="min-w-0 truncate text-left font-serif text-lg leading-6 text-ink underline decoration-transparent underline-offset-4 transition-colors duration-150 hover:decoration-current"
        >
          {c.name}
          {c.fictional && <span className="ml-1.5 font-sans text-[11px] text-graphite">fictional</span>}
        </button>
        <span className="ml-auto flex shrink-0 items-center gap-2.5">
          {c.new_items.length > 0 && <KindIcons kinds={[...new Set(c.new_items.map((i) => i.kind))]} />}
          <span className={cn("font-serif text-lg leading-6", flags ? "text-signal" : "text-graphite")}>
            <CountUp value={flags} delay={delay} />
            <span className="sr-only"> {flags === 1 ? "flag" : "flags"}</span>
          </span>
        </span>
      </div>
      <DitherBar
        className="mt-2"
        delay={delay + 0.1}
        total={scale}
        segments={[
          { value: publicCount, tone: "signal" },
          { value: c.contradictions, tone: "signal-soft" },
        ]}
      />
      <div className="mt-2 flex min-h-7 items-center justify-between gap-3">
        {flags > 0 ? (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={id}
            aria-label={label}
            onClick={() => setOpen((value) => !value)}
            className="-ml-1 inline-flex min-h-7 items-center gap-1.5 rounded-full px-1 text-graphite transition-colors duration-150 hover:text-ink"
          >
            <GlyphCounts publicCount={publicCount} contradictions={c.contradictions} />
            <CaretDown
              aria-hidden="true"
              size={12}
              weight="light"
              className={cn("transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]", open && "rotate-180")}
            />
          </button>
        ) : (
          <p className="flex items-center gap-1.5 text-xs leading-4 text-graphite">
            <CheckCircle aria-hidden="true" size={14} weight="light" className="shrink-0 text-steady" />
            Nothing new flagged
          </p>
        )}
        {c.questions.length > 0 && (
          <button
            type="button"
            onClick={() => onOpen(c.id, "questions")}
            aria-label={`${plural(c.questions.length, "founder question", "founder questions")}. Open`}
            className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-tray px-2.5 text-ink transition-colors duration-150 hover:bg-tray-strong"
          >
            <ChatCircleDots aria-hidden="true" size={15} weight="light" className="text-data" />
            <span className="font-serif text-[15px] leading-5">{c.questions.length}</span>
          </button>
        )}
      </div>
      {flags > 0 && (
        <Collapse id={id} open={open}>
          <ul className="space-y-1.5 pt-2 text-[13px] leading-5">
            {c.discrepancies.map((d, i) => (
              <li key={`${d.signal}-${i}`} className="flex items-center gap-2.5">
                <span className="flex w-2 shrink-0 justify-center">{isContradiction(d.signal) ? <Diamond /> : <Dot />}</span>
                <span className="min-w-0 flex-1 truncate text-ink">{d.signal}</span>
                {d.short && <span className="shrink-0 text-xs text-signal">{d.short}</span>}
              </li>
            ))}
          </ul>
        </Collapse>
      )}
    </Rise>
  );
}

export function DigestScreen({ onBack, onOpen }: { onBack: () => void; onOpen: (id: string, tab?: "questions") => void }) {
  const [period, setPeriod] = useState<"day" | "week">("day");
  const [digest, setDigest] = useState<Digest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDigest(period)
      .then((d) => {
        setDigest(d);
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  }, [period]);
  const current = digest?.period === period ? digest : null;
  const ranked = current ? [...current.companies].sort((a, b) => b.discrepancies.length - a.discrepancies.length) : [];
  // Bars share one scale (the most-flagged company) so they compare across cards.
  const scale = Math.max(1, ...ranked.map((c) => c.discrepancies.length));

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="group mb-3 inline-flex min-h-6 items-center gap-1 text-[13px] text-graphite transition-colors duration-150 hover:text-ink"
      >
        <ArrowLeft aria-hidden="true" size={14} weight="light" className="transition-transform duration-150 ease-out group-hover:-translate-x-0.5" />
        Home
      </button>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-[26px] leading-8 tracking-[-0.02em] text-ink">{period === "day" ? "Today" : "This week"}</h1>
        <div className="flex rounded-full bg-tray p-0.5 text-xs font-medium">
          {(["day", "week"] as const).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={period === p}
              onClick={() => setPeriod(p)}
              className={cn("relative h-7 rounded-full px-3 transition-colors duration-150", period === p ? "text-ink" : "text-graphite hover:text-ink")}
            >
              {period === p && (
                <motion.span layoutId="digest-period" className="fragment absolute inset-0 z-0" style={{ borderRadius: 9999 }} transition={SPRING} />
              )}
              <span className="relative z-10">{p === "day" ? "Today" : "Week"}</span>
            </button>
          ))}
        </div>
      </div>
      {error ? <p className="mt-4 text-[13px] text-graphite">{error}</p> : <BriefPlayer digest={current} />}
      {current && (
        <>
          <GlyphLegend totals={current.totals} />
          {ranked.length > 0 && (
            <section className="mt-5">
              <h2 className="sr-only">Companies</h2>
              <div className="space-y-2">
                {ranked.map((c, i) => (
                  <DigestCompany key={c.id} company={c} scale={scale} index={i} onOpen={onOpen} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
