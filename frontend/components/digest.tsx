"use client";

import { useEffect, useRef, useState } from "react";
import { API, type Digest, chatStream, getDigest, recordBrief, transcribe, ttsUrl } from "@/lib/api";
import { startWavRecording } from "@/lib/recorder";
import { Button } from "./button";
import { cn } from "./cn";
import { ItemTag } from "./inbox";

/** Counts up to its value once, so the totals resolve instead of popping in. */
function Total({ label, value, signal }: { label: string; value: number; signal?: boolean }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let frame = 0;
    const steps = 12;
    const id = setInterval(() => {
      frame += 1;
      setShown(frame >= steps ? value : Math.round((value * frame) / steps));
      if (frame >= steps) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, [value]);
  return (
    <div className="border border-rule bg-surface p-3">
      <div className={cn("font-mono text-2xl leading-8", signal && value > 0 ? "text-signal" : "text-ink")}>{shown}</div>
      <div className="micro-label text-graphite">{label}</div>
    </div>
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
      className="h-8 min-w-11 shrink-0 rounded-[2px] border border-rule px-2 font-mono text-[11px] text-graphite hover:text-ink"
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

  if (state === "unavailable") return <p className="text-xs text-graphite">Audio isn&apos;t available right now; the transcript is below.</p>;
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        aria-label={state === "playing" ? "Pause briefing" : "Play briefing"}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-paper"
      >
        {state === "playing" ? (
          <svg viewBox="0 0 10 10" className="h-3 w-3" fill="currentColor"><path d="M2 1h2v8H2zM6 1h2v8H6z" /></svg>
        ) : (
          <svg viewBox="0 0 10 10" className="ml-0.5 h-3 w-3" fill="currentColor"><path d="M2 1l7 4-7 4z" /></svg>
        )}
      </button>
      <div className="flex-1">
        <div className="h-0.5 bg-rule">
          <div className="h-0.5 bg-ink transition-[width] duration-200" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-1 text-[11px] text-graphite">
          {state === "recording" ? "Recording your briefing…" : "Your briefing · about a minute"}
        </p>
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
    <section className="mt-8 border-t border-rule pt-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="micro-label text-graphite">Talk to your briefing</h2>
          <p className="mt-1 text-xs text-graphite">It briefs you out loud. Interrupt any time; ask it to look something up.</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button className="h-8 px-3 text-xs" onClick={() => ask("Start my briefing.")}>Start</Button>
        <Button variant="quiet" className={cn("h-8 px-3 text-xs", listening && "border-signal text-signal")} onClick={() => (s.current.recog ? s.current.recog.stop() : listen())}>
          {listening ? "Tap to send" : "Ask by voice"}
        </Button>
        {busy && <Button variant="quiet" className="h-8 px-3 text-xs" onClick={stop}>Stop</Button>}
        <span className="ml-auto">
          <SpeedButton speed={speed} onChange={changeSpeed} label="Speaking speed" />
        </span>
      </div>
      {log.length > 0 && (
        <div className="mt-4 flex max-h-96 flex-col gap-2 overflow-y-auto">
          {log.map((m, i) => (
            <p key={i} className={cn("max-w-[90%] rounded-[2px] px-3 py-2 text-[13px] leading-5", m.role === "user" ? "self-end bg-ink text-paper" : "self-start border border-rule bg-surface text-ink", m.interim && "opacity-60")}>
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
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Or type: check if Acme filed a new Form D" className="h-8 min-w-0 flex-1 rounded-[2px] border border-rule bg-surface px-2 text-xs" />
        <Button type="submit" variant="quiet" className="h-8 px-3 text-xs">Send</Button>
      </form>
    </section>
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

  return (
    <>
      <button type="button" onClick={onBack} className="micro-label mb-4 text-graphite hover:text-ink">← Inbox</button>
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-xl leading-6 font-medium tracking-tight text-ink">{period === "day" ? "Today" : "This week"}</h1>
        <div className="flex gap-3 text-xs">
          {(["day", "week"] as const).map((p) => (
            <button key={p} type="button" onClick={() => setPeriod(p)} className={period === p ? "text-ink underline underline-offset-4" : "text-graphite"}>
              {p === "day" ? "Today" : "Week"}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="mt-4 text-[13px] text-graphite">{error}</p>}
      {!current && !error && <p className="mt-4 text-[13px] text-graphite">Building your briefing…</p>}
      {current && (
        <>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Total label="Items" value={current.totals.items} />
            <Total label="Companies" value={current.totals.companies} />
            <Total label="Discrepancies" value={current.totals.discrepancies} signal />
            <Total label="Contradictions" value={current.totals.contradictions} signal />
          </div>
          {current.companies.length > 0 && <div className="mt-5"><BriefPlayer key={current.script} script={current.script} /></div>}
          <p className="mt-4 text-[13px] leading-5 text-ink">{current.summary}</p>
          <div className="mt-6 space-y-5">
            {current.companies.map((c) => (
              <section key={c.id} className="border-t border-rule pt-4">
                <button type="button" onClick={() => onOpen(c.id)} className="text-left text-sm font-medium text-ink hover:underline">
                  {c.name}{c.fictional ? " (fictional)" : ""}
                </button>
                <div className="mt-2 flex flex-wrap gap-1">{c.new_items.map((i) => <ItemTag key={i.id} kind={i.kind} />)}</div>
                {c.discrepancies.length > 0 && (
                  <ul className="mt-3 space-y-1 text-[13px] leading-5">
                    {c.discrepancies.slice(0, 3).map((d) => (
                      <li key={d.signal} className="flex justify-between gap-3">
                        <span className="text-ink">{d.signal}</span>
                        <span className="shrink-0 text-signal">{d.short}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {c.questions[0] && <p className="mt-3 border-l border-rule pl-3 text-[13px] leading-5 text-graphite">Ask: {c.questions[0].question}</p>}
              </section>
            ))}
          </div>
          <TalkPanel />
        </>
      )}
    </>
  );
}
