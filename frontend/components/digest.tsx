"use client";

import { type CSSProperties, useEffect, useId, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CaretDown, CheckCircle, Pause, Play, XCircle } from "@phosphor-icons/react/dist/ssr";
import { API, type Digest, chatStream, getDigest, recordBrief, transcribe, ttsUrl } from "@/lib/api";
import { startWavRecording } from "@/lib/recorder";
import { Button } from "./button";
import { DUR, EASE_ENTER, RISE, SPRING, STAGGER } from "@/lib/motion";
import { cn } from "./cn";
import { Collapse } from "./collapse";
import { KindIcons } from "./inbox";
import { CountUp } from "./motion";
import { DitherBar, Figure } from "./viz";

/** The digest at a glance (decision 31): three counted-up figures, one word each. */
function Glance({ totals }: { totals: Digest["totals"] }) {
  const flags = totals.discrepancies + totals.contradictions;
  return (
    <div className="mt-5 grid grid-cols-3 gap-3">
      <Figure value={<CountUp value={totals.items} />} caption={totals.items === 1 ? "new item" : "new items"} />
      <Figure value={<CountUp value={totals.companies} />} caption={totals.companies === 1 ? "company" : "companies"} />
      <Figure value={<CountUp value={flags} />} caption={flags === 1 ? "flag" : "flags"} tone={flags > 0 ? "signal" : "ink"} />
    </div>
  );
}

/** Sentences end at . ! or ? followed by a space, so "$1.5M" stays whole. */
const sentences = (text: string) => text.split(/(?<=[.!?])\s+/).filter(Boolean);

const SPEAKER: Record<string, string> = { S: "Sam", R: "Riley" };

/** The brief's turns ("S: …" / "R: …" lines from the backend); a script without speakers is one turn. */
function turns(script: string) {
  const parsed = [...script.matchAll(/^([SR]):\s*(.+)$/gm)].map((m) => ({ speaker: SPEAKER[m[1]], text: m[2].trim() }));
  return parsed.length ? parsed : [{ speaker: null, text: script }];
}

/**
 * The brief, shown only while it's being read (decision 34). The current turn
 * is lit; timing is estimated from each turn's length, so the highlight
 * follows the voice closely without word-level timestamps.
 */
function Transcript({ script, progress }: { script: string; progress: number }) {
  const lines = turns(script);
  const total = lines.reduce((acc, line) => acc + line.text.length, 0) || 1;
  const ends = lines.map((_, i) => (lines.slice(0, i + 1).reduce((acc, line) => acc + line.text.length, 0) / total) * 100);
  const current = progress >= 100 ? -1 : ends.findIndex((end) => progress < end);
  return (
    <ol className="space-y-2 text-[13px] leading-5">
      {lines.map((line, i) => (
        <li
          key={i}
          className={cn(
            "flex gap-2.5 transition-colors duration-300 ease-out",
            i === current || current === -1 ? "text-ink" : i < current ? "text-graphite" : "text-graphite/60",
          )}
        >
          {line.speaker && <span className="w-9 shrink-0 pt-px font-mono text-[11px] leading-5 text-data">{line.speaker}</span>}
          <span className="min-w-0">{line.text}</span>
        </li>
      ))}
    </ol>
  );
}

const SPEEDS = [1, 1.2, 1.4, 1.6];

/** Remembered per browser (a convenience; falls back to the default if storage is blocked). */
function savedSpeed(key: string, fallback: number): number {
  try {
    const v = Number(localStorage.getItem(key));
    return SPEEDS.includes(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

function SpeedButton({ speed, onChange, label }: { speed: number; onChange: (v: number) => void; label: string }) {
  return (
    <button
      type="button"
      aria-label={`${label}: ${speed}×. Change speed`}
      onClick={() => onChange(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])}
      className="h-8 min-w-11 shrink-0 rounded-full border border-rule-strong bg-surface px-2.5 font-mono text-[11px] text-graphite hover:text-ink"
    >
      {speed}×
    </button>
  );
}

/** Ink play button + progress (never amber). Records the brief with Fish Audio on first play. */
function BriefPlayer({ script }: { script: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [state, setState] = useState<"idle" | "recording" | "playing" | "paused" | "unavailable">("idle");
  const [progress, setProgress] = useState(0);
  const [src, setSrc] = useState<string | null>(null);
  const [rate, setRate] = useState(() => (typeof window === "undefined" ? 1 : savedSpeed("vs.briefRate", 1)));

  function changeRate(v: number) {
    setRate(v);
    if (audio.current) audio.current.playbackRate = v;
    try {
      localStorage.setItem("vs.briefRate", String(v));
    } catch {}
  }

  async function toggle() {
    const el = audio.current;
    if (!el) return;
    if (state === "playing") return el.pause();
    if (!src) {
      setState("recording");
      try {
        const { audio_url } = await recordBrief(script);
        setSrc(`${API}${audio_url}`);
        el.src = `${API}${audio_url}`;
      } catch {
        return setState("unavailable");
      }
    }
    el.playbackRate = rate;
    el.play().catch(() => setState("unavailable"));
  }

  const started = state === "playing" || state === "paused";
  if (state === "unavailable") {
    return (
      <>
        <p className="text-xs text-graphite">Audio isn&apos;t available right now.</p>
        <div className="mt-2">
          <Transcript script={script} progress={100} />
        </div>
      </>
    );
  }
  return (
    <>
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        aria-label={state === "playing" ? "Pause briefing" : "Play briefing"}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-paper transition-transform duration-150 ease-out hover:scale-105 active:scale-95"
      >
        {state === "playing" ? (
          <Pause aria-hidden="true" size={16} weight="fill" className="text-paper" />
        ) : (
          <Play aria-hidden="true" size={16} weight="fill" className="ml-0.5 text-paper" />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[13px] leading-5 font-medium text-ink">
            {state === "recording" ? "Recording your briefing…" : "Your briefing"}
          </span>
          <span className="shrink-0 font-mono text-xs text-graphite">~1 min</span>
        </p>
        {/* Decorative: playback state is carried by the button label. */}
        <div
          aria-hidden="true"
          className="dither mt-1.5"
          style={{ "--dither-on": "var(--data)", "--dither-fill": `${progress}%` } as CSSProperties}
        />
      </div>
      <SpeedButton speed={rate} onChange={changeRate} label="Briefing speed" />
      <audio
        ref={audio}
        onPlay={() => setState("playing")}
        onPause={() => setState("paused")}
        onEnded={() => setState("paused")}
        onTimeUpdate={(e) => setProgress((e.currentTarget.currentTime / (e.currentTarget.duration || 1)) * 100)}
      />
    </div>
    <Collapse open={started}>
      <div className="mt-3 border-t border-rule pt-3">
        <Transcript script={script} progress={progress} />
      </div>
    </Collapse>
    </>
  );
}

type Msg = { role: "user" | "assistant"; content: string };

/** The voice analyst: speaks sentence by sentence; tap Ask to interrupt by voice, or type. */
function TalkPanel() {
  const [log, setLog] = useState<{ role: Msg["role"]; text: string; interim?: boolean }[]>([]);
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState("");
  const [speed, setSpeed] = useState(() => (typeof window === "undefined" ? 1.2 : savedSpeed("vs.talkSpeed", 1.2)));
  const speedRef = useRef(speed);

  function changeSpeed(v: number) {
    setSpeed(v);
    speedRef.current = v;
    try {
      localStorage.setItem("vs.talkSpeed", String(v));
    } catch {}
  }

  const s = useRef({ messages: [] as Msg[], queue: [] as { text: string; audio: HTMLAudioElement }[], playing: null as null | { text: string; audio: HTMLAudioElement }, spoken: [] as string[], full: "", gen: 0, abort: null as AbortController | null, interrupted: false, committed: -1, recog: null as null | { stop: () => void } });

  function playNext() {
    const st = s.current;
    const next = st.queue.shift() ?? null;
    st.playing = next;
    if (!next) return;
    const gen = st.gen;
    const finished = () => {
      if (gen !== st.gen) return;
      st.spoken.push(next.text);
      playNext();
    };
    next.audio.onended = finished;
    next.audio.onerror = finished;
    next.audio.play().catch(finished);
  }

  function stop() {
    const st = s.current;
    st.abort?.abort();
    st.gen += 1;
    for (const q of [st.playing, ...st.queue]) if (q) { q.audio.onended = q.audio.onerror = null; q.audio.pause(); q.audio.removeAttribute("src"); q.audio.load(); }
    st.queue = [];
    st.playing = null;
    if (st.full) {
      const said = st.spoken.join(" ");
      st.interrupted = said.length < st.full.trim().length;
      const msg: Msg = { role: "assistant", content: said || st.full };
      if (st.committed >= 0) st.messages[st.committed] = msg;
      else st.messages.push(msg);
    }
    st.full = "";
    st.spoken = [];
    st.committed = -1;
    setBusy(false);
  }

  async function ask(question: string) {
    stop();
    const st = s.current;
    const note = st.interrupted ? "[I cut you off mid-answer.] " : "";
    st.interrupted = false;
    st.messages.push({ role: "user", content: note + question });
    setLog((l) => [...l, { role: "user", text: question }, { role: "assistant", text: "…" }]);
    const ctrl = new AbortController();
    st.abort = ctrl;
    setBusy(true);
    try {
      await chatStream(st.messages, (sentence) => {
        st.full += sentence;
        const audio = new Audio(ttsUrl(sentence.trim(), speedRef.current));
        audio.preload = "auto";
        st.queue.push({ text: sentence.trim(), audio });
        if (!st.playing) playNext();
        setLog((l) => [...l.slice(0, -1), { role: "assistant", text: st.full }]);
      }, ctrl.signal);
      if (st.abort === ctrl) {
        st.messages.push({ role: "assistant", content: st.full });
        st.committed = st.messages.length - 1;
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setLog((l) => [...l.slice(0, -1), { role: "assistant", text: "The analyst is unavailable right now." }]);
    }
    setBusy(false);
  }

  function listen() {
    stop();
    type SR = { lang: string; interimResults: boolean; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void; onend: () => void; onerror: () => void; start: () => void; stop: () => void };
    const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return recordAndTranscribe();
    const r = new Ctor();
    r.lang = "en-US";
    r.interimResults = true;
    let finalText = "";
    setListening(true);
    setLog((l) => [...l, { role: "user", text: "Listening…", interim: true }]);
    r.onresult = (e) => {
      const results = Array.from(e.results);
      const t = results.map((x) => x[0].transcript).join(" ");
      setLog((l) => [...l.slice(0, -1), { role: "user", text: t, interim: true }]);
      if (results[results.length - 1].isFinal) finalText = t;
    };
    r.onend = () => {
      setListening(false);
      s.current.recog = null;
      setLog((l) => l.filter((m) => !m.interim));
      if (finalText.trim()) ask(finalText.trim());
    };
    r.onerror = () => {};
    s.current.recog = r;
    r.start();
  }

  /** No built-in recognition: record WAV, tap again to send, transcribe on the server. */
  async function recordAndTranscribe() {
    let rec: Awaited<ReturnType<typeof startWavRecording>>;
    try {
      rec = await startWavRecording();
    } catch {
      return setText("Microphone blocked. Allow it in the address bar, or type your question.");
    }
    setListening(true);
    setLog((l) => [...l, { role: "user", text: "Listening… tap again to send", interim: true }]);
    s.current.recog = {
      stop: async () => {
        s.current.recog = null;
        setListening(false);
        setLog((l) => [...l.slice(0, -1), { role: "user", text: "Transcribing…", interim: true }]);
        try {
          const heard = await transcribe(await rec.stop());
          setLog((l) => l.filter((m) => !m.interim));
          if (heard) ask(heard);
        } catch {
          setLog((l) => l.filter((m) => !m.interim));
          setText("Couldn't hear that. Try again, or type your question.");
        }
      },
    };
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm leading-5 font-medium text-ink">Talk to your briefing</h2>
          <p className="mt-1 text-xs text-graphite">Interrupt any time.</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={() => ask("Start my briefing.")}>Start</Button>
        <Button variant={listening ? "primary" : "quiet"} size="sm" onClick={() => (s.current.recog ? s.current.recog.stop() : listen())}>
          {listening ? "Tap to send" : "Ask by voice"}
        </Button>
        {busy && <Button variant="quiet" size="sm" onClick={stop}>Stop</Button>}
        <span className="ml-auto">
          <SpeedButton speed={speed} onChange={changeSpeed} label="Speaking speed" />
        </span>
      </div>
      {log.length > 0 && (
        <div className="mt-4 flex max-h-96 flex-col gap-2 overflow-y-auto">
          {log.map((m, i) => (
            <p key={i} className={cn("max-w-[90%] rounded-2xl px-3 py-2 text-[13px] leading-5", m.role === "user" ? "self-end bg-ink text-paper" : "fragment self-start text-ink", m.interim && "opacity-60")}>
              {m.text}
            </p>
          ))}
        </div>
      )}
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) {
            ask(text.trim());
            setText("");
          }
        }}
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Or type: check if Acme filed a new Form D" className="h-8 min-w-0 flex-1 rounded-full border border-rule-strong bg-surface px-3 text-xs text-ink placeholder:text-graphite" />
        <Button type="submit" variant="quiet" size="sm">Send</Button>
      </form>
    </section>
  );
}

/** One company in the digest: its flags as a ranked bar, the differences behind a tap, and the top question. */
function DigestCompany({
  company: c,
  scale,
  index,
  onOpen,
}: {
  company: Digest["companies"][number];
  scale: number;
  index: number;
  onOpen: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const flags = c.discrepancies.length + c.contradictions;
  const delay = 0.2 + index * STAGGER;
  return (
    <motion.section
      className="fragment px-3.5 py-3"
      initial={{ opacity: 0, y: RISE }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.reveal, ease: EASE_ENTER, delay }}
    >
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onOpen(c.id)}
          className="min-w-0 truncate text-left font-serif text-lg leading-6 text-ink underline decoration-transparent underline-offset-4 transition-colors duration-150 hover:decoration-current"
        >
          {c.name}
          {c.fictional ? " (fictional)" : ""}
        </button>
        <span className="flex shrink-0 items-center gap-2">
          {c.new_items.length > 0 && <KindIcons kinds={[...new Set(c.new_items.map((i) => i.kind))]} />}
          <CountUp value={flags} delay={delay} className={cn("font-serif text-lg leading-6", flags ? "text-signal" : "text-graphite")} />
        </span>
      </div>
      <DitherBar
        className="mt-2"
        delay={delay + 0.1}
        total={scale}
        segments={[
          { value: c.discrepancies.length, tone: "signal" },
          { value: c.contradictions, tone: "signal-soft" },
        ]}
      />
      {flags > 0 ? (
        <>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={id}
            onClick={() => setOpen((value) => !value)}
            className="mt-2 inline-flex min-h-6 items-center gap-1 text-xs font-medium text-graphite transition-colors duration-150 hover:text-ink"
          >
            {c.discrepancies.length > 0 && `${c.discrepancies.length} with public records`}
            {c.discrepancies.length > 0 && c.contradictions > 0 && " · "}
            {c.contradictions > 0 && `${c.contradictions} between your items`}
            {c.discrepancies.length > 0 && (
              <CaretDown aria-hidden="true" size={12} weight="light" className={cn("transition-transform duration-300", open && "rotate-180")} />
            )}
          </button>
          {c.discrepancies.length > 0 && (
            <Collapse id={id} open={open}>
              <ul className="space-y-1.5 pt-1.5 text-[13px] leading-5">
                {c.discrepancies.map((d) => (
                  <li key={d.signal} className="flex items-start gap-2 text-signal">
                    <XCircle aria-hidden="true" size={14} weight="light" className="mt-[3px] shrink-0" />
                    <span className="min-w-0 flex-1 text-ink">{d.signal}</span>
                    {d.short && <span className="shrink-0">{d.short}</span>}
                  </li>
                ))}
              </ul>
            </Collapse>
          )}
        </>
      ) : (
        <p className="mt-2 flex items-center gap-1.5 text-xs leading-4 text-steady">
          <CheckCircle aria-hidden="true" size={14} weight="light" className="shrink-0" />
          Nothing new flagged
        </p>
      )}
      {c.questions[0] && (
        <p className="mt-3 flex gap-2.5 rounded-md bg-tray px-3 py-2 text-[13px] leading-5 text-ink">
          <span className="w-3 shrink-0 text-right font-serif text-base leading-5 text-data">1</span>
          <span className="min-w-0">
            <span className="sr-only">Ask: </span>
            {c.questions[0].question}
          </span>
        </p>
      )}
    </motion.section>
  );
}

export function DigestScreen({ onBack, onOpen }: { onBack: () => void; onOpen: (id: string) => void }) {
  const [period, setPeriod] = useState<"day" | "week">("day");
  const [digest, setDigest] = useState<Digest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDigest(period).then(setDigest).catch((e) => setError(e.message));
  }, [period]);
  const current = digest?.period === period ? digest : null;
  const ranked = current
    ? [...current.companies].sort(
        (a, b) => b.discrepancies.length + b.contradictions - (a.discrepancies.length + a.contradictions),
      )
    : [];
  const scale = Math.max(1, ...ranked.map((c) => c.discrepancies.length + c.contradictions));

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="group mb-3 inline-flex min-h-6 items-center gap-1 text-[13px] text-graphite transition-colors duration-150 hover:text-ink"
      >
        <ArrowLeft aria-hidden="true" size={14} weight="light" className="transition-transform duration-150 ease-out group-hover:-translate-x-0.5" />
        Inbox
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
      {error && <p className="mt-4 text-[13px] text-graphite">{error}</p>}
      {!current && !error && (
        <>
          <p role="status" className="sr-only">Building your briefing</p>
          <div aria-hidden="true" className="tray mt-5 h-24" />
        </>
      )}
      {current && (
        <>
          {/* The digest's one hero tray: the headline and the brief's audio; the full text appears as it's read. */}
          <motion.div
            key={current.script}
            className="tray mt-5"
            initial={{ opacity: 0, y: RISE }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.reveal, ease: EASE_ENTER }}
          >
            <p className="font-serif text-lg leading-6 text-ink">{sentences(current.summary)[0]}</p>
            {current.companies.length > 0 && (
              <div className="fragment mt-3 px-3 py-2.5">
                <BriefPlayer key={current.script} script={current.script} />
              </div>
            )}
          </motion.div>
          <Glance totals={current.totals} />
          {ranked.length > 0 && (
            <section className="mt-6">
              <h2 className="text-sm leading-5 font-medium text-ink">
                By company <span className="text-data">{ranked.length}</span>
              </h2>
              <div className="mt-3 space-y-2">
                {ranked.map((c, i) => (
                  <DigestCompany key={c.id} company={c} scale={scale} index={i} onOpen={onOpen} />
                ))}
              </div>
            </section>
          )}
          <TalkPanel />
        </>
      )}
    </>
  );
}
