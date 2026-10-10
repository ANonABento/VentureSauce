// Tester page for the VentureSauce backend. Plain JS, no CDN, so the rendering can be reused in the MV3 panel.
const API = "";  // same origin
const STEPS = [
  ["parsing", "Parsing claims"],
  ["checking_sec", "Checking SEC Form D"],
  ["checking_linkedin", "Checking LinkedIn"],
  ["checking_press", "Checking press"],
  ["comparing_sources", "Comparing your sources"],
  ["ready", "Ready"],
];
const SOURCE = { form_d: "SEC Form D", linkedin: "LinkedIn via Bright Data", press: "Press via Bright Data", your_sources: "Your sources" };
const ORDER = { gap: 0, match: 1, unverifiable: 2 };
const $ = (id) => document.getElementById(id);
let jobId = null;

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function fmt(value, unit) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "number" && unit === "usd") {
    if (value >= 1e9) return `$${+(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${+(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  }
  return typeof value === "number" ? value.toLocaleString() : value;
}

async function health() {
  try {
    const h = await (await fetch(`${API}/health`)).json();
    $("mode").textContent = h.fake ? "fake mode (fixture replay)" : "live pipeline";
  } catch { $("mode").textContent = "backend offline"; }
}

async function start(form) {
  $("result").hidden = true;
  $("progress").hidden = false;
  $("error").hidden = $("replay").hidden = true;
  $("fbDone").hidden = true;
  renderSteps("parsing");
  try {
    const r = await fetch(`${API}/analyze`, { method: "POST", body: form });
    if (!r.ok) throw new Error((await r.json()).detail || r.statusText);
    jobId = (await r.json()).job_id;
    poll();
  } catch (e) { fail(e.message); }
}

async function poll() {
  try {
    const job = await (await fetch(`${API}/jobs/${jobId}`)).json();
    render(job);
    if (job.status === "error") return fail(job.error || "Something went wrong.");
    if (job.status !== "ready") setTimeout(poll, 700);
  } catch (e) { fail(e.message); }
}

function fail(msg) {
  $("error").textContent = msg;
  $("error").hidden = false;
  $("replay").hidden = !jobId;
}

function renderSteps(status) {
  const at = STEPS.findIndex(([s]) => s === status);
  $("steps").innerHTML = STEPS.map(([s, label], i) => {
    const cls = status === "ready" || i < at ? "done" : i === at ? "active" : "";
    return `<li class="${cls}">${label}</li>`;
  }).join("");
}

function render(job) {
  if (job.status !== "error") renderSteps(job.status);
  $("raw").textContent = JSON.stringify(job, null, 2);
  if (!job.company && !job.checks.length) return;
  $("result").hidden = false;
  const c = job.company || {};
  $("company").textContent = (c.name || "…") + (c.fictional ? " (fictional)" : "");
  $("entity").textContent = c.form_d_entity ? `Matched SEC filer: ${c.form_d_entity}${c.cik ? ` (CIK ${c.cik})` : ""}` : (c.domain || "");
  const n = (v) => job.checks.filter((x) => x.verdict === v).length;
  $("counts").textContent = `${n("gap")} differ · ${n("match")} match · ${n("unverifiable")} couldn't verify`;
  const checks = [...job.checks].sort((a, b) => ORDER[a.verdict] - ORDER[b.verdict]);
  $("checks").innerHTML = checks.map(row).join("");
  renderQuestions(job.questions);
  $("items").textContent = (job.items || []).length > 1
    ? `In your inbox: ${job.items.map((i) => i.kind_name).join(" → ")}` : "";
}

function row(c) {
  const page = c.page ? `<small>p.${esc(c.page)}</small>` : "";
  const safeUrl = /^https?:\/\//i.test(c.source_url || "");  // never render javascript: links
  const src = safeUrl
    ? `<a href="${esc(c.source_url)}" target="_blank" rel="noopener">${esc(SOURCE[c.source] || c.source)}</a>`
    : `<span>${esc(SOURCE[c.source] || c.source)}</span>`;
  const date = c.source_date ? `<span>${c.source === "form_d" ? "filed" : c.source === "linkedin" ? "fetched" : "published"} ${esc(c.source_date)}</span>` : "";
  return `<article class="check ${esc(c.verdict)}">
    <div class="check-head">
      ${c.claim_text?.startsWith("(") ? `<p class="quote muted">Found only in ${esc(SOURCE[c.source] || c.source)}, ${esc(c.claim_text.slice(1, -1))}</p>`
        : `<p class="quote">“${esc(c.claim_text)}”${page}</p>`}
      <span class="pill ${esc(c.verdict)}">${esc(c.label)}</span>
    </div>
    <div class="values">
      <div><label>Deck says</label><b>${esc(fmt(c.claimed_value, c.unit))}</b></div>
      <div><label>Source says</label><b>${esc(fmt(c.observed_value, c.unit))}</b></div>
    </div>
    <p class="note">${esc(c.note)}</p>
    <div class="meta">${src}${date}<span>confidence: ${esc(c.confidence)}</span></div>
  </article>`;
}

// Inputs
const drop = $("drop");
["dragenter", "dragover"].forEach((e) => drop.addEventListener(e, (ev) => { ev.preventDefault(); drop.classList.add("over"); }));
["dragleave", "drop"].forEach((e) => drop.addEventListener(e, (ev) => { ev.preventDefault(); drop.classList.remove("over"); }));
drop.addEventListener("drop", (ev) => { const f = ev.dataTransfer.files[0]; if (f) sendFile(f); });
$("file").addEventListener("change", (ev) => { const f = ev.target.files[0]; if (f) sendFile(f); ev.target.value = ""; });
$("runText").addEventListener("click", () => {
  const t = $("text").value.trim();
  if (!t) return;
  const form = new FormData(); form.append("text", t); start(form);
});
$("sample").addEventListener("click", async () => {
  const blob = await (await fetch(`${API}/sample/acme.pdf`)).blob();
  sendFile(new File([blob], "acme_ai_deck_FICTIONAL.pdf", { type: "application/pdf" }));
});
$("replay").addEventListener("click", async () => {
  render(await (await fetch(`${API}/jobs/${jobId}?replay=1`)).json());
  $("error").hidden = $("replay").hidden = true;
});
$("feedback").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  await fetch(`${API}/feedback`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job_id: jobId, role: $("fbRole").value, text: $("fbText").value }),
  });
  $("fbText").value = "";
  $("fbDone").hidden = false;
});

// Digest + spoken briefing
let digestScript = "";
async function loadDigest(period) {
  $("digest").hidden = false;
  $("digestTitle").textContent = "Building your briefing…";
  $("digestTotals").textContent = $("digestSummary").textContent = $("audioStatus").textContent = "";
  $("digestCompanies").innerHTML = "";
  $("briefAudio").hidden = true;
  try {
    const d = await (await fetch(`${API}/digest?period=${period}`)).json();
    digestScript = d.script;
    const t = d.totals;
    $("digestTitle").textContent = period === "week" ? "This week" : "Today";
    $("digestTotals").textContent = `${t.items} items · ${t.companies} companies · ${t.discrepancies} discrepancies · ${t.contradictions} contradictions`;
    $("digestSummary").textContent = d.summary;
    $("digestScript").textContent = d.script;
    $("digestCompanies").innerHTML = d.companies.map((c) => `<div class="co">
      <h3>${esc(c.name)}${c.fictional ? " (fictional)" : ""}</h3>
      <p class="muted">New: ${c.new_items.map((i) => esc(i.kind_name)).join(", ")} · ${esc(c.headline)}</p>
      ${c.discrepancies.length ? `<ul>${c.discrepancies.map((x) => `<li><b>${esc(x.signal)}</b>: ${esc(x.short || x.summary)}</li>`).join("")}</ul>` : ""}
      ${c.questions[0] ? `<p class="ask">Ask: ${esc(c.questions[0].question)}</p>` : ""}
    </div>`).join("");
  } catch (e) { $("digestTitle").textContent = "Couldn't build the briefing."; }
}
$("digestDay").addEventListener("click", () => loadDigest("day"));
$("digestWeek").addEventListener("click", () => loadDigest("week"));
$("playBrief").addEventListener("click", async () => {
  $("playBrief").disabled = true;
  $("audioStatus").textContent = "Recording your briefing (about 20 seconds)…";
  try {
    const r = await fetch(`${API}/digest/audio`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ script: digestScript }),
    });
    const body = await r.json();
    if (!r.ok) throw new Error(body.detail || r.statusText);
    $("briefAudio").src = body.audio_url;
    $("briefAudio").hidden = false;
    $("audioStatus").textContent = "";
    $("briefAudio").play().catch(() => {});
  } catch (e) { $("audioStatus").textContent = `Audio unavailable: ${e.message}`; }
  $("playBrief").disabled = false;
});

// Founder questions for the current company
function renderQuestions(qs) {
  $("questions").hidden = !qs || !qs.length;
  $("questionList").innerHTML = (qs || []).map((q) => `<li>${esc(q.question)}<small>${esc(q.why)}</small></li>`).join("");
}

function sendFile(f) {
  const form = new FormData(); form.append("file", f); start(form);
}

health();
// ?sample=1 runs the fictional Acme deck immediately (demo links, smoke tests).
if (new URLSearchParams(location.search).has("sample")) $("sample").click();

// ---------------------------------------------------------------------------
// Talk to your briefing: streamed answers, spoken sentence by sentence, interruptible by voice or text.
const talk = {
  messages: [],     // {role, content} history sent to /chat/stream
  abort: null,      // AbortController for the current text stream
  queue: [],        // [{text, audio}] sentences waiting to play, in order
  playing: null,    // the sentence currently playing
  spoken: [],       // sentences of the current answer already played (kept on interrupt)
  bubble: null,     // DOM node of the current assistant answer
  full: "",         // full text of the current answer so far
  recog: null,
  gen: 0,           // bumps on every interrupt
  committed: null,  // index in messages of the current answer once fully streamed
};

function addBubble(role, text, cls = "") {
  const el = document.createElement("div");
  el.className = `msg ${role} ${cls}`.trim();
  el.textContent = text;
  $("talkLog").append(el);
  $("talkLog").scrollTop = $("talkLog").scrollHeight;
  return el;
}

function paintAnswer() {
  if (!talk.bubble) return;
  const said = talk.spoken.join(" ");
  const rest = talk.full.slice(said.length);
  talk.bubble.innerHTML = `<span class="spoken">${esc(said)}</span><span class="unspoken">${esc(rest)}</span>`;
  $("talkLog").scrollTop = $("talkLog").scrollHeight;
}

// Sentence → <audio> streaming from GET /tts. Starts downloading immediately so the next one is ready.
function enqueueSentence(text) {
  const audio = new Audio(`${API}/tts?text=${encodeURIComponent(text)}&speed=${$("talkSpeed").value}`);
  audio.preload = "auto";
  talk.queue.push({ text, audio });
  if (!talk.playing) playNext();
}

function playNext() {
  const next = talk.queue.shift();
  talk.playing = next || null;
  if (!next) return;
  const gen = talk.gen;  // ignore events from audio that belonged to an answer we've since interrupted
  const finished = () => { if (gen !== talk.gen) return; talk.spoken.push(next.text); paintAnswer(); playNext(); };
  next.audio.onended = finished;
  next.audio.onerror = finished;  // keep the text flowing if TTS fails
  next.audio.play().catch(finished);
}

function stopTalking() {
  talk.abort?.abort();
  talk.abort = null;
  talk.gen++;
  for (const q of [talk.playing, ...talk.queue]) if (q) { q.audio.onended = q.audio.onerror = null; q.audio.pause(); q.audio.removeAttribute("src"); q.audio.load(); }
  talk.queue = [];
  talk.playing = null;
  // Remember what was actually said, so the model knows where it was cut off.
  if (talk.bubble && talk.full) {
    const said = talk.spoken.join(" ");
    const interrupted = said.length < talk.full.trim().length;
    const msg = { role: "assistant", content: said || talk.full };
    talk.interrupted = interrupted;  // told to the model on the next user turn, not inside its own words
    // Already in the history if the text had finished streaming: trim it there instead of adding it twice.
    if (talk.committed != null) talk.messages[talk.committed] = msg; else talk.messages.push(msg);
    talk.bubble.textContent = said || talk.full;
  }
  talk.bubble = null; talk.full = ""; talk.spoken = []; talk.committed = null;
  $("talkStop").hidden = true;
}

async function ask(text) {
  stopTalking();
  const note = talk.interrupted ? "[I cut you off mid-answer.] " : "";
  talk.interrupted = false;
  talk.messages.push({ role: "user", content: note + text });
  addBubble("user", text);
  talk.bubble = addBubble("assistant", "…");
  talk.full = ""; talk.spoken = [];
  $("talkStop").hidden = false;
  const ctrl = new AbortController();
  talk.abort = ctrl;
  let pending = "";  // text not yet cut into a sentence
  try {
    const r = await fetch(`${API}/chat/stream`, {
      method: "POST", headers: { "Content-Type": "application/json" }, signal: ctrl.signal,
      body: JSON.stringify({ messages: talk.messages }),
    });
    if (!r.ok) throw new Error((await r.json()).detail || r.statusText);
    const reader = r.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf("\n\n")) >= 0) {
        const line = buf.slice(0, i).replace(/^data: /, "");
        buf = buf.slice(i + 2);
        const evt = JSON.parse(line);
        if (!evt.text) continue;
        talk.full += evt.text;
        pending += evt.text;
        // Cut finished sentences (at least ~25 chars so we don't voice "Dr." on its own).
        let m;
        while ((m = pending.match(/^([\s\S]{25,}?[.!?])(\s+)/))) {
          enqueueSentence(m[1].trim());
          pending = pending.slice(m[0].length);
        }
        paintAnswer();
      }
    }
    if (pending.trim()) enqueueSentence(pending.trim());
    // Answer complete: it joins the history once fully generated (interrupts trim it in stopTalking).
    if (talk.abort === ctrl) {
      talk.messages.push({ role: "assistant", content: talk.full });
      talk.committed = talk.messages.length - 1;
      const bubble = talk.bubble;
      // Keep painting until the audio catches up; then drop our handle so stopTalking won't re-add it.
      const done = setInterval(() => { if (!talk.playing && !talk.queue.length) { clearInterval(done); if (talk.bubble === bubble) { paintAnswer(); talk.bubble = null; talk.full = ""; talk.spoken = []; talk.committed = null; $("talkStop").hidden = true; } } }, 300);
    }
  } catch (e) {
    if (e.name !== "AbortError") talk.bubble.textContent = `Couldn't answer: ${e.message}`;
  }
}

// Voice input: the browser's built-in speech recognition (Chrome, Edge). Elsewhere: record WAV and transcribe with
// Fish Audio on the server (POST /asr; WAV because Fish can't decode MediaRecorder's WebM).
async function recordWav() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const ctx = new AudioContext();
  const src = ctx.createMediaStreamSource(stream);
  const proc = ctx.createScriptProcessor(4096, 1, 1);
  const chunks = [];
  proc.onaudioprocess = (e) => chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
  src.connect(proc); proc.connect(ctx.destination);
  return async () => {
    proc.disconnect(); src.disconnect(); stream.getTracks().forEach((t) => t.stop());
    const ratio = ctx.sampleRate / 16000; await ctx.close();
    const all = new Float32Array(chunks.reduce((n, c) => n + c.length, 0));
    let o = 0; for (const c of chunks) { all.set(c, o); o += c.length; }
    const n = Math.floor(all.length / ratio), view = new DataView(new ArrayBuffer(44 + n * 2));
    const w = (at, str) => [...str].forEach((ch, i) => view.setUint8(at + i, ch.charCodeAt(0)));
    w(0, "RIFF"); view.setUint32(4, 36 + n * 2, true); w(8, "WAVE"); w(12, "fmt "); view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, 16000, true); view.setUint32(28, 32000, true);
    view.setUint16(32, 2, true); view.setUint16(34, 16, true); w(36, "data"); view.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, all[Math.floor(i * ratio)])) * 0x7fff, true);
    return new Blob([view.buffer], { type: "audio/wav" });
  };
}

async function listenWithServer() {
  let stop;
  try { stop = await recordWav(); } catch { $("talkText").placeholder = "Microphone blocked. Allow it, or type your question."; return; }
  const interim = addBubble("user", "Listening… tap again to send", "interim");
  $("talkMic").classList.add("listening");
  talk.recog = { stop: async () => {
    talk.recog = null;
    $("talkMic").classList.remove("listening");
    interim.textContent = "Transcribing…";
    try {
      const form = new FormData(); form.append("audio", await stop(), "question.wav");
      const res = await fetch(`${API}/asr`, { method: "POST", body: form });
      const { text } = await res.json();
      interim.remove();
      if (res.ok && text) ask(text);
    } catch { interim.textContent = "Didn't catch that. Try again or type it."; }
  } };
}

function listen() {
  stopTalking();
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return listenWithServer();
  const r = new SR();
  r.lang = "en-US"; r.interimResults = true; r.maxAlternatives = 1;
  const interim = addBubble("user", "Listening…", "interim");
  $("talkMic").classList.add("listening");
  let finalText = "";
  r.onresult = (e) => {
    const t = [...e.results].map((x) => x[0].transcript).join(" ");
    interim.textContent = t;
    if (e.results[e.results.length - 1].isFinal) finalText = t;
  };
  r.onend = () => {
    $("talkMic").classList.remove("listening");
    interim.remove();
    talk.recog = null;
    if (finalText.trim()) ask(finalText.trim());
  };
  r.onerror = () => { interim.textContent = "Didn't catch that. Try again or type it."; };
  talk.recog = r;
  r.start();
}

$("talkStart").addEventListener("click", () => ask("Start my briefing."));
$("talkMic").addEventListener("click", () => (talk.recog ? talk.recog.stop() : listen()));
$("talkStop").addEventListener("click", stopTalking);
$("talkForm").addEventListener("submit", (ev) => {
  ev.preventDefault();
  const t = $("talkText").value.trim();
  if (t) { $("talkText").value = ""; ask(t); }
});
