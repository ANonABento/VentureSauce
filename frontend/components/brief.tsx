"use client";

import { type Dispatch, type FormEvent, type SetStateAction, type SyntheticEvent, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  Buildings,
  CaretRight,
  CircleNotch,
  FileText,
  Keyboard,
  Microphone,
  PaperPlaneRight,
  Pause,
  Play,
  SpeakerSlash,
  Stop,
} from "@phosphor-icons/react/dist/ssr";
import { API, type Digest, chatStream, getDigest, recordBrief, transcribe, ttsUrl } from "@/lib/api";
import { startWavRecording } from "@/lib/recorder";
import { DUR, EASE_ENTER, RISE } from "@/lib/motion";
import { cn } from "./cn";
import { Collapse } from "./collapse";
import { CountUp } from "./motion";
import { Waveform, briefTurns, turnSpans } from "./waveform";

/*
 * The brief (decisions 39, 40, 47): the Digest's hero player with the voice
 * analyst folded into a mic button, and the home screen's mini player pill.
 */

const SPEEDS = [1, 1.2, 1.4, 1.6];
const BRIEF_RATE = "vs.briefRate";
const TALK_SPEED = "vs.talkSpeed";

/** Remembered per browser (a convenience; falls back to the default if storage is blocked). */
function savedSpeed(key: string, fallback: number): number {
  try {
    const v = Number(localStorage.getItem(key));
    return SPEEDS.includes(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

function saveSpeed(key: string, v: number) {
  try {
    localStorage.setItem(key, String(v));
  } catch {}
}

/** 72.4 → "1:12". */
function clock(seconds: number): string {
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function SpeedButton({ speed, onChange, label, size = "md" }: { speed: number; onChange: (v: number) => void; label: string; size?: "sm" | "md" }) {
  return (
    <button
      type="button"
      aria-label={`${label}: ${speed}×. Change speed`}
      onClick={() => onChange(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])}
      className={cn(
        "shrink-0 rounded-full border border-rule-strong bg-surface px-2 font-mono text-[11px] text-graphite transition-colors duration-150 hover:text-ink",
        size === "sm" ? "h-6 min-w-9" : "h-8 min-w-10",
      )}
    >
      {speed}×
    </button>
  );
}

/* ── Brief audio ─────────────────────────────────────────────────────────── */

/** Recorded audio by script, so the home pill and the Digest share one recording per brief. */
const recorded = new Map<string, string>();

type BriefState = "idle" | "recording" | "playing" | "paused" | "unavailable";

/** Plays the brief, recording it (Fish Audio, via the backend) on first play. */
function useBriefAudio(script: string) {
  const audio = useRef<HTMLAudioElement>(null);
  const [state, setState] = useState<BriefState>("idle");
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [rate, setRate] = useState(() => (typeof window === "undefined" ? 1 : savedSpeed(BRIEF_RATE, 1)));

  // A brief recorded earlier (on the home pill, or before a period switch) shows its length straight away.
  useEffect(() => {
    const el = audio.current;
    const src = recorded.get(script);
    if (el && src && !el.getAttribute("src")) {
      el.preload = "metadata";
      el.src = src;
    }
  }, [script]);

  function changeRate(v: number) {
    setRate(v);
    if (audio.current) audio.current.playbackRate = v;
    saveSpeed(BRIEF_RATE, v);
  }

  async function toggle() {
    const el = audio.current;
    if (!el || state === "recording" || state === "unavailable") return;
    if (state === "playing") return el.pause();
    if (!el.getAttribute("src")) {
      setState("recording");
      try {
        const src = recorded.get(script) ?? `${API}${(await recordBrief(script)).audio_url}`;
        recorded.set(script, src);
        el.src = src;
      } catch {
        return setState("unavailable");
      }
    }
    el.playbackRate = rate;
    el.play().catch(() => setState("unavailable"));
  }

  const audioProps = {
    ref: audio,
    onPlay: () => setState("playing"),
    onPause: () => setState((s) => (s === "unavailable" ? s : "paused")),
    onEnded: () => setState("paused"),
    onError: () => setState("unavailable"),
    onTimeUpdate: (e: SyntheticEvent<HTMLAudioElement>) =>
      setProgress((e.currentTarget.currentTime / (e.currentTarget.duration || 1)) * 100),
    onLoadedMetadata: (e: SyntheticEvent<HTMLAudioElement>) => {
      const d = e.currentTarget.duration;
      if (Number.isFinite(d)) setDuration(d);
    },
  };

  return { state, progress, duration, rate, changeRate, toggle, pause: () => audio.current?.pause(), audioProps };
}

/**
 * The brief's text, shown while it's read (decision 34). The current turn is
 * lit; timing is estimated from each turn's length, so the highlight follows
 * the voice closely without word-level timestamps.
 */
function Transcript({ script, progress }: { script: string; progress: number }) {
  const lines = briefTurns(script);
  const spans = turnSpans(lines);
  const current = progress >= 100 ? -1 : spans.findIndex((s) => progress < s.end * 100);
  return (
    <ol className="space-y-2 text-[13px] leading-5">
      {lines.map((line, i) => (
        <li
          key={i}
          aria-current={i === current ? "true" : undefined}
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

/* ── Voice analyst ───────────────────────────────────────────────────────── */

type Msg = { role: "user" | "assistant"; content: string };
type Bubble = { role: Msg["role"]; text: string; interim?: boolean };
type Spoken = { text: string; audio: HTMLAudioElement };
type Recognizer = { stop: () => void; cancel: () => void };

type AnalystState = {
  messages: Msg[];
  queue: Spoken[];
  playing: Spoken | null;
  spoken: string[];
  full: string;
  gen: number;
  abort: AbortController | null;
  interrupted: boolean;
  committed: number;
  recog: Recognizer | null;
  gone: boolean;
};

/** Cuts the analyst off: aborts the stream and silences every queued sentence. */
function silence(st: AnalystState) {
  st.abort?.abort();
  st.gen += 1;
  for (const q of [st.playing, ...st.queue]) {
    if (!q) continue;
    q.audio.onended = q.audio.onerror = null;
    q.audio.pause();
    q.audio.removeAttribute("src");
    q.audio.load();
  }
  st.queue = [];
  st.playing = null;
}

/** The voice analyst: speaks sentence by sentence; ask by voice (interrupts) or type. */
function useAnalyst() {
  const [log, setLog] = useState<Bubble[]>([]);
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [speed, setSpeed] = useState(() => (typeof window === "undefined" ? 1.2 : savedSpeed(TALK_SPEED, 1.2)));
  const speedRef = useRef(speed);
  const s = useRef<AnalystState>({
    messages: [],
    queue: [],
    playing: null,
    spoken: [],
    full: "",
    gen: 0,
    abort: null,
    interrupted: false,
    committed: -1,
    recog: null,
    gone: false,
  });

  // Leaving the screen silences the analyst and releases the microphone.
  useEffect(() => {
    const st = s.current;
    st.gone = false;
    return () => {
      st.gone = true;
      silence(st);
      st.recog?.cancel();
      st.recog = null;
    };
  }, []);

  function changeSpeed(v: number) {
    setSpeed(v);
    speedRef.current = v;
    saveSpeed(TALK_SPEED, v);
  }

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

  /** Stops the answer in progress and keeps only what was actually said in the history. */
  function stop() {
    const st = s.current;
    silence(st);
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
    const st = s.current;
    if (st.gone) return;
    stop();
    setNotice(null);
    const note = st.interrupted ? "[I cut you off mid-answer.] " : "";
    st.interrupted = false;
    st.messages.push({ role: "user", content: note + question });
    setLog((l) => [...l, { role: "user", text: question }, { role: "assistant", text: "…" }]);
    const ctrl = new AbortController();
    st.abort = ctrl;
    setBusy(true);
    try {
      await chatStream(
        st.messages,
        (sentence) => {
          st.full += sentence;
          const audio = new Audio(ttsUrl(sentence.trim(), speedRef.current));
          audio.preload = "auto";
          st.queue.push({ text: sentence.trim(), audio });
          if (!st.playing) playNext();
          setLog((l) => [...l.slice(0, -1), { role: "assistant", text: st.full }]);
        },
        ctrl.signal,
      );
      if (st.abort === ctrl) {
        st.messages.push({ role: "assistant", content: st.full });
        st.committed = st.messages.length - 1;
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setLog((l) => [...l.slice(0, -1), { role: "assistant", text: "The analyst is unavailable right now." }]);
      }
    }
    setBusy(false);
  }

  function listen(onNoMic: () => void) {
    stop();
    type SR = {
      lang: string;
      interimResults: boolean;
      onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void;
      onend: () => void;
      onerror: () => void;
      start: () => void;
      stop: () => void;
      abort: () => void;
    };
    const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return recordAndTranscribe(onNoMic);
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
    s.current.recog = { stop: () => r.stop(), cancel: () => r.abort() };
    r.start();
  }

  /** No built-in recognition: record WAV, tap again to send, transcribe on the server. */
  async function recordAndTranscribe(onNoMic: () => void) {
    let rec: Awaited<ReturnType<typeof startWavRecording>>;
    try {
      rec = await startWavRecording();
    } catch {
      setNotice("Microphone blocked. Allow it in the address bar, or type.");
      return onNoMic();
    }
    setListening(true);
    setLog((l) => [...l, { role: "user", text: "Listening… tap the mic to send", interim: true }]);
    s.current.recog = {
      cancel: () => void rec.stop(),
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
          setNotice("Couldn't hear that. Try again, or type.");
        }
      },
    };
  }

  /** The mic button: first tap listens (cutting the analyst off), second tap sends. */
  function toggleMic(onNoMic: () => void) {
    if (s.current.recog) s.current.recog.stop();
    else listen(onNoMic);
  }

  return { log, listening, busy, notice, speed, changeSpeed, ask, stop, toggleMic };
}

type Analyst = ReturnType<typeof useAnalyst>;

/** The analyst's conversation, under the hero: bubbles, then the typed question when the keyboard is open. */
function Conversation({ analyst, typing }: { analyst: Analyst; typing: boolean }) {
  const [text, setText] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const open = typing || analyst.log.length > 0 || !!analyst.notice;

  // Focus once the Collapse has started opening: it is still visibility-hidden at the start of its transition.
  useEffect(() => {
    if (!typing) return;
    const timer = setTimeout(() => input.current?.focus(), DUR.fast * 1000);
    return () => clearTimeout(timer);
  }, [typing]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    analyst.ask(text.trim());
    setText("");
  }

  return (
    <Collapse open={open}>
      {/* 16px above and below, the rhythm between cards, so the tiles under it start clearly below the input. */}
      <div className="pt-4 pb-1">
        {analyst.log.length > 0 && (
          <div role="log" aria-label="Conversation with the analyst" className="flex max-h-96 flex-col gap-2 overflow-y-auto">
            {analyst.log.map((m, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: RISE / 2 }}
                animate={{ opacity: m.interim ? 0.6 : 1, y: 0 }}
                transition={{ duration: DUR.base, ease: EASE_ENTER }}
                className={cn(
                  "max-w-[88%] rounded-2xl px-3 py-2 text-[13px] leading-5",
                  m.role === "user" ? "self-end bg-ink text-paper" : "fragment self-start text-ink",
                )}
              >
                {m.text}
              </motion.p>
            ))}
          </div>
        )}
        {analyst.notice && <p className="mt-2 text-xs leading-4 text-graphite">{analyst.notice}</p>}
        <div className="mt-3 flex items-center gap-2">
          {typing ? (
            <form className="flex min-w-0 flex-1 items-center gap-1.5" onSubmit={submit}>
              <input
                ref={input}
                value={text}
                onChange={(e) => setText(e.target.value)}
                aria-label="Ask the analyst"
                placeholder="Did Acme file a new Form D?"
                className="h-8 min-w-0 flex-1 rounded-full border border-rule-strong bg-surface px-3 text-xs text-ink placeholder:text-graphite"
              />
              <button
                type="submit"
                aria-label="Send"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-paper transition-transform duration-150 ease-out active:scale-95"
              >
                <PaperPlaneRight aria-hidden="true" size={14} weight="light" />
              </button>
            </form>
          ) : (
            <span className="flex-1" />
          )}
          {analyst.busy && (
            <button
              type="button"
              onClick={analyst.stop}
              aria-label="Stop the analyst"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rule-strong bg-surface text-ink transition-colors duration-150 hover:bg-tray"
            >
              <Stop aria-hidden="true" size={12} weight="fill" />
            </button>
          )}
          {analyst.log.length > 0 && <SpeedButton speed={analyst.speed} onChange={analyst.changeSpeed} label="Speaking speed" />}
        </div>
      </div>
    </Collapse>
  );
}

/* ── The hero ────────────────────────────────────────────────────────────── */

/** A serif count led by its icon; the words are for screen readers (and the tooltip). */
function IconCount({ icon: Icon, value, label }: { icon: typeof FileText; value: number; label: string }) {
  return (
    <span title={label} className="inline-flex items-center gap-1.5">
      <Icon aria-hidden="true" size={16} weight="light" className="text-graphite" />
      <CountUp value={value} className="font-serif text-lg leading-6 text-ink" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

const ROUND = "flex shrink-0 items-center justify-center rounded-full transition-[background-color,color,transform] duration-150 ease-out active:scale-95";

/**
 * The Digest's hero tray (decision 39): items and companies as icon + figure,
 * then a large play button, the mic (decision 40) and a dithered waveform of
 * the brief with company initials where each comes up. The transcript opens
 * while it plays; the analyst's conversation opens under the tray.
 */
export function BriefPlayer({ digest }: { digest: Digest | null }) {
  const analyst = useAnalyst();
  const [typing, setTyping] = useState(false);
  return (
    <>
      {/* Keyed by script: a new brief (Today ↔ Week) resets the audio, while the conversation carries on. */}
      {digest ? (
        <HeroTray key={digest.script} digest={digest} analyst={analyst} typing={typing} onTyping={setTyping} />
      ) : (
        <>
          <p role="status" className="sr-only">
            Building your briefing
          </p>
          <div aria-hidden="true" className="tray mt-5 h-[104px]" />
        </>
      )}
      <Conversation analyst={analyst} typing={typing} />
    </>
  );
}

function HeroTray({
  digest,
  analyst,
  typing,
  onTyping: setTyping,
}: {
  digest: Digest;
  analyst: Analyst;
  typing: boolean;
  onTyping: Dispatch<SetStateAction<boolean>>;
}) {
  const brief = useBriefAudio(digest.script);
  const names = useMemo(() => digest.companies.map((c) => c.name), [digest.companies]);
  const hasBrief = names.length > 0;
  const unavailable = brief.state === "unavailable";

  function play() {
    if (analyst.busy) analyst.stop();
    brief.toggle();
  }

  function mic() {
    brief.pause();
    analyst.toggleMic(() => setTyping(true));
  }

  return (
    <motion.section
      aria-label="Briefing"
      className="tray mt-5"
      initial={{ opacity: 0, y: RISE }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.reveal, ease: EASE_ENTER }}
    >
      <div className="flex items-center gap-4">
        <IconCount icon={FileText} value={digest.totals.items} label={digest.totals.items === 1 ? "new item" : "new items"} />
        <IconCount icon={Buildings} value={digest.totals.companies} label={digest.totals.companies === 1 ? "company" : "companies"} />
        <span className="ml-auto flex items-center gap-2">
          {brief.duration !== null && (
            <span className="font-mono text-xs text-graphite">
              <span className="sr-only">Length </span>
              {clock(brief.duration)}
            </span>
          )}
          {hasBrief && !unavailable && <SpeedButton speed={brief.rate} onChange={brief.changeRate} label="Briefing speed" size="sm" />}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {hasBrief &&
          (unavailable ? (
            <span className={cn(ROUND, "h-12 w-12 bg-tray-strong text-graphite")}>
              <SpeakerSlash aria-hidden="true" size={18} weight="light" />
            </span>
          ) : (
            <button
              type="button"
              onClick={play}
              aria-busy={brief.state === "recording"}
              aria-label={brief.state === "playing" ? "Pause briefing" : brief.state === "recording" ? "Preparing briefing" : "Play briefing"}
              className={cn(ROUND, "h-12 w-12 bg-ink text-paper hover:scale-105")}
            >
              {brief.state === "recording" ? (
                <CircleNotch aria-hidden="true" size={18} weight="bold" className="animate-spin motion-reduce:animate-none" />
              ) : brief.state === "playing" ? (
                <Pause aria-hidden="true" size={18} weight="fill" />
              ) : (
                <Play aria-hidden="true" size={18} weight="fill" className="ml-0.5" />
              )}
            </button>
          ))}
        <button
          type="button"
          onClick={mic}
          aria-pressed={analyst.listening}
          aria-label={analyst.listening ? "Send your question" : "Ask the analyst by voice"}
          className={cn(
            ROUND,
            "relative h-10 w-10",
            analyst.listening ? "bg-ink text-paper" : "border border-rule-strong bg-surface text-ink hover:bg-tray-strong",
          )}
        >
          {analyst.listening && (
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 rounded-full border border-ink motion-reduce:hidden"
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 1.2, ease: "easeOut", repeat: Infinity }}
            />
          )}
          <Microphone aria-hidden="true" size={18} weight={analyst.listening ? "fill" : "light"} />
        </button>
        <button
          type="button"
          onClick={() => setTyping((t) => !t)}
          aria-pressed={typing}
          aria-label="Type a question"
          className={cn(ROUND, "h-7 w-7 text-graphite hover:bg-tray-strong hover:text-ink", typing && "bg-tray-strong text-ink")}
        >
          <Keyboard aria-hidden="true" size={16} weight="light" />
        </button>
        {hasBrief ? (
          <Waveform
            script={digest.script}
            companies={names}
            progress={unavailable ? 0 : brief.progress}
            marks
            className={cn("ml-1 flex-1", unavailable && "opacity-50")}
          />
        ) : (
          <p className="ml-1 text-xs text-graphite">Nothing new</p>
        )}
      </div>

      {unavailable && <p className="mt-3 text-xs text-graphite">Audio unavailable</p>}
      <Collapse open={brief.state === "playing" || unavailable}>
        <div className="mt-3 border-t border-rule-strong/70 pt-3">
          <Transcript script={digest.script} progress={unavailable ? 100 : brief.progress} />
        </div>
      </Collapse>
      {hasBrief && <audio {...brief.audioProps} />}
    </motion.section>
  );
}

/* ── Home pill ───────────────────────────────────────────────────────────── */

function MiniBriefPill({ digest, onOpen }: { digest: Digest; onOpen: () => void }) {
  const brief = useBriefAudio(digest.script);
  const names = useMemo(() => digest.companies.map((c) => c.name), [digest.companies]);
  const unavailable = brief.state === "unavailable";

  return (
    <motion.div
      className="relative flex h-12 items-center gap-3 rounded-full bg-ink pr-3 pl-2 text-paper"
      initial={{ opacity: 0, y: RISE }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.reveal, ease: EASE_ENTER }}
    >
      {unavailable ? (
        <span title="Audio unavailable" className={cn(ROUND, "relative z-10 h-8 w-8 bg-paper/15")}>
          <SpeakerSlash aria-hidden="true" size={14} weight="light" />
          <span className="sr-only">Audio unavailable</span>
        </span>
      ) : (
        <button
          type="button"
          onClick={brief.toggle}
          aria-busy={brief.state === "recording"}
          aria-label={brief.state === "playing" ? "Pause today's brief" : brief.state === "recording" ? "Preparing today's brief" : "Play today's brief"}
          className={cn(ROUND, "relative z-10 h-8 w-8 bg-paper text-ink hover:scale-105")}
        >
          {brief.state === "recording" ? (
            <CircleNotch aria-hidden="true" size={14} weight="bold" className="animate-spin motion-reduce:animate-none" />
          ) : brief.state === "playing" ? (
            <Pause aria-hidden="true" size={14} weight="fill" />
          ) : (
            <Play aria-hidden="true" size={14} weight="fill" className="ml-px" />
          )}
        </button>
      )}
      <Waveform script={digest.script} companies={names} progress={brief.progress} rows={5} tone="ink" className="flex-1" />
      {brief.duration !== null && <span className="font-mono text-[11px] text-paper/70">{clock(brief.duration)}</span>}
      {/* The whole pill opens the Digest: this button's ::after covers it; the play button sits above. */}
      <button
        type="button"
        onClick={onOpen}
        aria-label="Open today's digest"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-paper/70 transition-colors duration-150 after:absolute after:inset-0 after:rounded-full after:content-[''] hover:text-paper focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-data"
      >
        <CaretRight aria-hidden="true" size={14} weight="light" />
      </button>
      <audio {...brief.audioProps} />
    </motion.div>
  );
}

/**
 * Today's brief as a pill for the home screen (decision 47): ▶ plays it in
 * place, a mini waveform fills as it plays, the length shows once known, and
 * tapping anywhere else opens the Digest. Renders nothing when there's no news.
 */
export function MiniBrief({ onOpen }: { onOpen: () => void }) {
  const [digest, setDigest] = useState<Digest | null>(null);

  useEffect(() => {
    let live = true;
    getDigest("day")
      .then((d) => live && setDigest(d))
      // Home shows its own figures; without a digest the pill simply doesn't appear.
      .catch(() => live && setDigest(null));
    return () => {
      live = false;
    };
  }, []);

  if (!digest || digest.companies.length === 0) return null;
  return <MiniBriefPill key={digest.script} digest={digest} onOpen={onOpen} />;
}
