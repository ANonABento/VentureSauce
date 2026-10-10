// Demo desk: stand-ins for an investor's daily tools. Every downloadable item is a real file from backend/samples/,
// and email/note bodies are read from those same files, so what's on screen is exactly what gets dropped in.
"use strict";

const S = "/samples/";
const MAIL = [
  { id: "acme-update", from: "Jane Founder", addr: "jane@acme-ai.example", when: "Oct 2", unread: true,
    subject: "Acme AI - September update", file: "01_acme_founder_email.eml" },
  { id: "acme-deck", from: "Jane Founder", addr: "jane@acme-ai.example", when: "Oct 9", unread: true,
    subject: "Deck for Thursday",
    body: "Hi,\n\nAttaching our latest deck ahead of Thursday's partner meeting. The board update from last week is in the other thread.\n\nJane",
    attachments: [{ file: "00_acme_deck_FICTIONAL.pdf", name: "Acme AI deck.pdf", kind: "PDF" }], deck: true },
  { id: "acme-board", from: "Jane Founder", addr: "jane@acme-ai.example", when: "Oct 8",
    subject: "Q3 board update", body: "Hi all,\n\nQ3 board slides attached, with speaker notes. Happy to walk through any of it.\n\nJane",
    attachments: [{ file: "06_acme_board_update.pptx", name: "Acme Q3 board update.pptx", kind: "PPTX" }] },
  { id: "northwind", from: "Priya Shah", addr: "priya@northwind-robotics.example", when: "Oct 7", unread: true,
    subject: "Intro - Northwind Robotics (pre-seed)", file: "04_northwind_intro_email.eml" },
  { id: "partners", from: "Morgan (Partner)", addr: "morgan@fund.example", when: "Oct 6",
    subject: "Monday partner meeting: agenda",
    body: "Agenda for Monday:\n\n1. Pipeline review\n2. Acme AI: decide on a follow-up call\n3. Portfolio updates\n\nMorgan" },
  { id: "lp", from: "Fund Ops", addr: "ops@fund.example", when: "Oct 5", subject: "Reminder: quarterly LP letter draft due Friday",
    body: "A reminder that the quarterly LP letter draft is due Friday. Template is in the shared drive.\n\nFund Ops" },
];
const NOTES = [
  { id: "acme-call", title: "Acme AI: call with Jane", when: "Oct 6", file: "02_acme_call_notes.txt" },
  { id: "hallway", title: "Conference hallway", when: "Oct 9", file: "03_unnamed_quick_note.txt" },
];
const CLIPS = [
  { id: "daytona", title: "Daytona: Series A", from: "vcnewsdaily.com", file: "10_daytona_public_claims.txt",
    url: "https://www.vcnewsdaily.com/Daytona/venture-capital-funding/yycfztlnkn", real: true },
  { id: "clerk", title: "Clerk: Series C", from: "clerk.com/blog", file: "11_clerk_public_claims.txt",
    url: "https://clerk.com/blog/series-c", real: true },
  { id: "acme-press", title: "Acme AI raises $10M seed led by Example Ventures", from: "example.com (fictional)",
    text: "Acme AI (FICTIONAL company, test data) announced a $10 million seed round led by Example Ventures.",
    url: "https://example.com/acme/press" },
];
const DECK_PAGES = 6;

const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const cache = {};

async function load(file) {
  if (!(file in cache)) cache[file] = await fetch(S + file).then((r) => (r.ok ? r.text() : ""));
  return cache[file];
}

/** .eml → {headers, body}: headers until the first blank line. */
function parseEml(raw) {
  const cut = raw.search(/\r?\n\r?\n/);
  const head = raw.slice(0, cut), body = raw.slice(cut).trim();
  const h = {};
  for (const line of head.split(/\r?\n/)) {
    const m = line.match(/^([\w-]+):\s*(.*)$/);
    if (m) h[m[1].toLowerCase()] = m[2];
  }
  return { headers: h, body };
}

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove("show"), 1600);
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast("Copied. Paste it into VentureSauce.");
  } catch {
    toast("Couldn't copy here; select the text instead.");
  }
}

function dl(file, label = "Download") {
  return `<a class="btn" href="${S + file}" download>${esc(label)}</a>`;
}

async function mailView(openId) {
  const open = MAIL.find((m) => m.id === openId) || MAIL[0];
  const list = MAIL.map((m) => `
    <a class="msg ${m.unread ? "unread" : ""} ${m.id === open.id ? "on" : ""}" href="#mail/${m.id}">
      <span class="from">${esc(m.from)}</span><span class="when">${esc(m.when)}</span>
      <span class="subj">${esc(m.subject)}</span><span class="snip" data-snip="${m.id}"></span>
    </a>`).join("");
  $("#view").innerHTML = `<h1>Inbox</h1><div class="mail"><div class="panel list">${list}</div><article class="panel reader" id="reader"></article></div>`;

  const body = async (m) => (m.file ? parseEml(await load(m.file)).body : m.body);
  for (const m of MAIL) body(m).then((b) => { const el = document.querySelector(`[data-snip="${m.id}"]`); if (el) el.textContent = b.replace(/\s+/g, " ").slice(0, 90); });

  const text = await body(open);
  const files = (open.attachments || []).map((a) => `
    <a class="file" href="${S + a.file}" download><span class="kind">${a.kind}</span><span>${esc(a.name)}</span></a>`).join("");
  $("#reader").innerHTML = `
    <h2>${esc(open.subject)}</h2>
    <div class="meta"><span><b>${esc(open.from)}</b> &lt;${esc(open.addr)}&gt;</span><span>${esc(open.when)}, 2026</span></div>
    <div class="body">${esc(text)}</div>
    ${files ? `<div class="attach">${files}</div>` : ""}
    <div class="actions">
      ${open.file ? dl(open.file, "Download email (.eml)") : ""}
      ${open.file ? `<button class="btn" data-copy>Copy email text</button>` : ""}
      ${open.deck ? `<a class="btn" href="#decks/acme">Open in Decks</a>` : ""}
    </div>`;
  const btn = $("[data-copy]");
  if (btn) btn.onclick = () => copy(`From: ${open.from} <${open.addr}>\nSubject: ${open.subject}\n\n${text}`);
}

function decksView(id) {
  if (id !== "acme") {
    $("#view").innerHTML = `<h1>Decks</h1><div class="cards">
      <a class="panel tile" href="#decks/acme"><img src="/static/demo/img/acme-deck-1.webp" alt="Acme AI deck, cover slide">
        <b>Acme AI</b><div class="muted small">Shared by Jane Founder · Oct 9 · 6 slides</div></a></div>`;
    return;
  }
  const pages = Array.from({ length: DECK_PAGES }, (_, i) =>
    `<img src="/static/demo/img/acme-deck-${i + 1}.webp" alt="Acme AI deck, slide ${i + 1}" loading="lazy" width="960" height="540">`).join("");
  $("#view").innerHTML = `
    <div class="deckhead"><div><h1 style="margin-bottom:2px">Acme AI deck</h1>
      <div class="muted small">Shared by Jane Founder · Oct 9 · ${DECK_PAGES} slides · screenshot any slide, or download the PDF</div></div>
      <div class="actions" style="margin:0">${dl("00_acme_deck_FICTIONAL.pdf", "Download PDF")}</div></div>
    <div class="slides">${pages}</div>`;
}

async function notesView(id) {
  const open = NOTES.find((n) => n.id === id) || NOTES[0];
  const text = await load(open.file);
  const list = NOTES.map((n) => `<a class="msg ${n.id === open.id ? "on" : ""}" href="#notes/${n.id}">
      <span class="from">${esc(n.title)}</span><span class="when">${esc(n.when)}</span></a>`).join("");
  $("#view").innerHTML = `<h1>Notes</h1><div class="mail"><div class="panel list">${list}</div>
    <article class="panel note"><h2>${esc(open.title)}</h2><div class="muted small">${esc(open.when)}, 2026</div>
      <div class="body" style="margin-top:14px">${esc(text)}</div>
      <div class="actions"><button class="btn primary" data-copy>Copy note</button>${dl(open.file, "Download .txt")}</div></article></div>`;
  $("[data-copy]").onclick = () => copy(text);
}

function portalView() {
  const bars = [38, 45, 52, 58, 66, 74, 82, 88, 93, 100].map((h) => `<i style="height:${h}%"></i>`).join("");
  $("#view").innerHTML = `
    <section class="panel portal" id="dashboard">
      <h2>Acme AI · Investor dashboard</h2>
      <div class="muted small">FICTIONAL test data · As of Sep 30, 2026</div>
      <div class="kpis">
        <div class="kpi"><span>ARR</span><b>$2.6M</b></div>
        <div class="kpi"><span>MoM growth</span><b>8%</b></div>
        <div class="kpi"><span>Employees</span><b>21</b></div>
        <div class="kpi"><span>Logos</span><b style="font-size:24px">Globex, Hooli</b></div>
      </div>
      <div class="spark" aria-hidden="true">${bars}</div>
    </section>
    <div class="actions"><span class="muted small" style="align-self:center">Screenshot the dashboard (⌘⇧4), or</span>
      ${dl("05_acme_dashboard_screenshot.png", "Download screenshot")}</div>`;
}

async function pressView() {
  const blocks = await Promise.all(CLIPS.map(async (c) => {
    const text = c.text || (await load(c.file));
    return `<article class="panel clip"><b>${esc(c.title)}</b><span class="tag">${c.real ? "real · public claim" : "fictional"}</span>
      <div class="muted small">Saved from <a href="${c.url}" target="_blank" rel="noreferrer">${esc(c.from)}</a></div>
      <blockquote>${esc(text)}</blockquote>
      <div class="actions"><button class="btn" data-copy="${c.id}">Copy</button>${c.file ? dl(c.file, "Download .txt") : ""}</div></article>`;
  }));
  $("#view").innerHTML = `<h1>Saved links</h1>${blocks.join("")}`;
  document.querySelectorAll("[data-copy]").forEach((b) => {
    const c = CLIPS.find((x) => x.id === b.dataset.copy);
    b.onclick = async () => copy(c.text || (await load(c.file)));
  });
}

async function route() {
  const [app, id] = (location.hash.slice(1) || "mail").split("/");
  document.querySelectorAll(".rail a").forEach((a) => a.classList.toggle("on", a.dataset.app === app));
  const views = { mail: mailView, decks: decksView, notes: notesView, portal: portalView, press: pressView };
  await (views[app] || mailView)(id);
  $("#view").scrollTop = 0;
}

window.addEventListener("hashchange", route);
route();
