// Demo desk: look-alikes of the tools an investor works in (mail, a deal-flow CRM, files, notes, a read-later list), filled only
// with real data: SEC Form D raises from Data's pipeline (static/demo/data/dealflow.json, exported from OSO by
// backend/export_dealflow.py) and companies' own funding announcements (backend/samples/). Nothing is invented.
"use strict";

const S = "/samples/";
const DATA = "/static/demo/data/dealflow.json";
const ME = { name: "You", addr: "you@your-fund.com" };

const CLIPS = [
  { id: "daytona", title: "Daytona raises $24M Series A", pub: "VC News Daily", from: "vcnewsdaily.com", file: "10_daytona_public_claims.txt",
    url: "https://www.vcnewsdaily.com/Daytona/venture-capital-funding/yycfztlnkn", saved: "Oct 8", tags: ["Dev infra", "Pipeline"], color: "#0b5cad" },
  { id: "clerk", title: "Clerk raises $50M Series C", pub: "Clerk blog", from: "clerk.com", file: "11_clerk_public_claims.txt",
    url: "https://clerk.com/blog/series-c", saved: "Oct 7", tags: ["Auth", "Comps"], color: "#6c47ff" },
  { id: "legora", title: "Legora raises $550 million Series D to fuel US growth", pub: "Legora newsroom", from: "legora.com", file: "12_legora_public_claims.txt",
    url: "https://legora.com/newsroom/legora-raises-550-million-series-d-to-fuel-us-growth", saved: "Oct 6", tags: ["Legal AI", "Comps"], color: "#1f2a24" },
  { id: "lovable", title: "We just raised $400M in Series C funding to help people run their businesses", pub: "Lovable blog", from: "lovable.dev", file: "13_lovable_public_claims.txt",
    url: "https://lovable.dev/blog/series-c", saved: "Oct 5", tags: ["AI app builders", "Comps"], color: "#ff4f8b" },
  { id: "harvey", title: "Harvey Raises $550M at a $15.5B Valuation to Help Legal Teams Own Their Intelligence", pub: "Harvey blog", from: "harvey.ai", file: "14_harvey_public_claims.txt",
    url: "https://www.harvey.ai/blog/harvey-raises-dollar550m-at-a-dollar155b-valuation-to-help-legal-teams-own-their-intelligence", saved: "Oct 4", tags: ["Legal AI", "Comps"], color: "#141414" },
];

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
  const h = {};
  for (const line of raw.slice(0, cut).split(/\r?\n/)) {
    const m = line.match(/^([\w-]+):\s*(.*)$/);
    if (m) h[m[1].toLowerCase()] = m[2];
  }
  return { headers: h, body: raw.slice(cut).trim() };
}
const COLORS = ["#1a73e8", "#e8710a", "#188038", "#a142f4", "#d93025", "#007b83", "#c5221f", "#5f6368"];
const hue = (s) => COLORS[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];
const avatar = (name, cls = "") => `<span class="av ${cls}" style="background:${hue(name)}">${esc(name[0])}</span>`;

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove("show"), 2200);
}
async function copy(text, what = "Copied to clipboard") {
  try { await navigator.clipboard.writeText(text); toast(what); } catch { toast("Couldn't copy here; select the text instead."); }
}
function download(file, name) {
  const a = document.createElement("a");
  a.href = S + file;
  a.download = name || file;
  a.click();
}
/** A small popover menu under `anchor`: items are [label, fn]. */
function menu(anchor, items) {
  document.querySelector(".menu")?.remove();
  const m = document.createElement("div");
  m.className = "menu";
  m.innerHTML = items.map(([label], i) => `<button data-i="${i}">${esc(label)}</button>`).join("");
  const r = anchor.getBoundingClientRect();
  m.style.top = `${r.bottom + window.scrollY + 4}px`;
  m.style.left = `${Math.max(8, r.right - 220)}px`;
  document.body.append(m);
  m.onclick = (e) => { const b = e.target.closest("button"); if (b) { items[b.dataset.i][1](); m.remove(); } };
  setTimeout(() => document.addEventListener("click", () => m.remove(), { once: true }), 0);
}

// Material-ish line icons, inline so nothing loads from a CDN.
const P = {
  menu: "M3 6h18M3 12h18M3 18h18", search: "M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15zM16 16l5 5",
  help: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
  grid: "M5 5h.01M12 5h.01M19 5h.01M5 12h.01M12 12h.01M19 12h.01M5 19h.01M12 19h.01M19 19h.01",
  pen: "M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4", inbox: "M3 13h5l2 3h4l2-3h5M5 5h14l2 8v6H3v-6z",
  star: "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z", clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  send: "M4 12l16-8-6 16-2-7z", file: "M7 3h7l5 5v13H7zM14 3v5h5", down: "M6 9l6 6 6-6", back: "M20 12H5M11 6l-6 6 6 6",
  more: "M12 5h.01M12 12h.01M12 19h.01", reply: "M10 8V4L3 11l7 7v-4c5 0 8 1.5 11 5-1-5-4-10-11-11z",
  fwd: "M14 8V4l7 7-7 7v-4c-5 0-8 1.5-11 5 1-5 4-10 11-11z", tag: "M3 12V4h8l10 10-8 8z", left: "M15 5l-7 7 7 7", right: "M9 5l7 7-7 7",
  dl: "M12 4v12M6 11l6 6 6-6M5 20h14", refresh: "M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7", archive: "M3 4h18v4H3zM5 8v12h14V8M10 12h4",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13", mail: "M3 6h18v12H3zM3 6l9 7 9-7", people: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c0-4 3-6 7-6s7 2 7 6M16 3a4 4 0 0 1 0 8M22 21c0-3-2-5-4-6",
  print: "M6 9V3h12v6M6 18H4v-7h16v7h-2M7 14h10v7H7z", share: "M4 12v8h16v-8M12 3v13M7 8l5-5 5 5",
};
const ic = (name, extra = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}><path d="${P[name]}"/></svg>`;

const money = (n) => (typeof n !== "number" ? "-" : n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(n >= 1e8 ? 0 : 1)}M` : n >= 1e3 ? `$${Math.round(n / 1e3)}K` : `$${n}`);
const day = (iso) => (iso ? new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-");
const logo = (nm) => `<span class="lg" style="background:${hue(nm)}">${esc(nm[0])}</span>`;
let FLOW = null;
async function flow() {
  if (!FLOW) FLOW = await fetch(DATA).then((r) => r.json());
  return FLOW;
}
// A row's website is only shown when a high-confidence LinkedIn or Crunchbase profile lists it (export_dealflow.py).
const site = (r) => (r.site ? `https://${r.site}` : null);
// What a headline carries when dragged into the panel: the headline plus the company's own site, so the check finds
// its filings, LinkedIn and Crunchbase.
const newsText = (r) => `${r.headline}\n\n${r.name} · ${site(r) || ""}\n(Funding headline found by Bright Data's SERP API.)`;
const dragAttrs = (r) => (r.headline ? `draggable="true" data-text="${esc(newsText(r))}"` : site(r) ? `draggable="true" data-url="${site(r)}"` : "");

/* ───────────── Mail: SEC raise alerts from the pipeline ───────────── */
const ALERTS = 40;
async function alerts() {
  const { rows } = await flow();
  // Companies with a confirmed website and a funding headline first: those make a full check when dropped in.
  const raises = rows.filter((r) => r.filed && r.sold > 0);
  const rich = raises.filter((r) => r.site && r.headline);
  return [...rich, ...raises.filter((r) => !rich.includes(r))].slice(0, ALERTS)
    .map((r, i) => ({ ...r, id: r.cik, unread: i < 6 }));
}
function alertText(r) {
  const lines = [
    `${r.name} filed a Form D with the SEC on ${day(r.filed)}.`,
    "",
    `Latest offering: ${money(r.sold)} sold${r.target ? ` of ${money(r.target)}` : ""} (${r.security || "securities"})${r.open ? ", still open" : ""}.`,
    r.first_sale ? `First sale: ${day(r.first_sale)}.` : null,
    `All Form D offerings: ${money(r.total)} sold across ${r.offerings} offering${r.offerings === 1 ? "" : "s"}, ${r.investors ?? "?"} investors.`,
    r.people ? `People on the filing: ${r.people.replace(/; /g, ", ")}.` : null,
    `${[r.sector, [r.city, r.state].filter(Boolean).join(", ")].filter(Boolean).join(" · ")}${r.founded ? ` · incorporated ${r.founded}` : ""}`,
    "",
    r.li ? `LinkedIn (via Bright Data): ${r.li.employees} people.` : "LinkedIn: no confirmed profile.",
    r.cb ? `Crunchbase (via Bright Data): ${money(r.cb.total)} total funding.` : "Crunchbase: no confirmed profile.",
    r.quiet ? "No funding press found yet: the SEC filing is the only public trace of this raise." : null,
  ];
  return lines.filter((l) => l !== null).join("\n");
}

function mailShell(main, unread) {
  return `<div class="gm">
    <header class="gm-top">
      <button class="ib" aria-label="Main menu">${ic("menu")}</button>
      <div class="gm-brand"><svg viewBox="0 0 32 24"><rect x="2" y="3" width="28" height="18" rx="3" fill="#1a73e8"/><path d="M3 5l13 9 13-9" stroke="#fff" stroke-width="2.4" fill="none" stroke-linejoin="round"/></svg>Mail</div>
      <label class="gm-search"><span class="ib">${ic("search")}</span><input placeholder="Search mail" aria-label="Search mail"><span class="ib">${ic("menu")}</span></label>
      <div class="grow"></div>
      <button class="ib" aria-label="Support">${ic("help")}</button><button class="ib" aria-label="Settings">${ic("gear")}</button><button class="ib" aria-label="Apps">${ic("grid", 'stroke-width="3.2"')}</button>
      <span style="padding:0 6px">${avatar(ME.name)}</span>
    </header>
    <div class="gm-body">
      <nav class="gm-nav">
        <button class="gm-compose">${ic("pen")}Compose</button>
        <a class="on" href="#mail">${ic("inbox")}Inbox<span class="n">${unread}</span></a>
        <a href="#mail">${ic("star")}Starred</a><a href="#mail">${ic("send")}Sent</a>
        <h4>Labels</h4>
        <a href="#mail"><i class="dot" style="background:#16a765"></i>SEC alerts</a>
      </nav>
      <section class="gm-main">${main}</section>
    </div></div>`;
}
const SENDER = { from: "VentureSauce alerts", addr: "alerts@venturesauce" };
const subject = (r) => `${r.name} raised ${money(r.sold)}${r.target && r.target !== r.sold ? ` of ${money(r.target)}` : ""} (Form D)`;

// Real emails in the inbox (backend/samples/*.eml), above the SEC alerts. Dragging one drops its text into the panel.
const EMAILS = ["Legora.eml"];
let MAILS = null;
// Every .eml in samples/ (from the /samples/ index), falling back to EMAILS if the index can't be read.
async function emailFiles() {
  try {
    const html = await fetch(S).then((r) => (r.ok ? r.text() : ""));
    const found = [...html.matchAll(/href="\/samples\/([^"]+\.eml)"/g)].map((m) => decodeURIComponent(m[1]));
    return found.length ? [...new Set(found)] : EMAILS;
  } catch {
    return EMAILS;
  }
}
async function emails() {
  if (!MAILS) MAILS = (await Promise.all((await emailFiles()).map(async (file) => {
    const raw = await load(file);
    if (!raw) return null;
    const { headers: h, body } = parseEml(raw);
    const from = h.from || "";
    const date = h.date ? new Date(h.date) : null;
    return { id: file.replace(/\.eml$/, "").toLowerCase(), mail: true, unread: true, subj: h.subject || file, body,
             from, to: h.to || "", rawDate: h.date || "",
             who: from.replace(/\s*<.*>$/, "") || from, addr: (from.match(/<(.+)>/) || [])[1] || "",
             date: date && !isNaN(date) ? date.toISOString().slice(0, 10) : null };
  }))).filter(Boolean).sort((a, b) => (b.rawDate ? Date.parse(b.rawDate) : 0) - (a.rawDate ? Date.parse(a.rawDate) : 0));
  return MAILS;
}
// The dragged text keeps the mail headers: the panel files text as an email only when it starts with From:/Subject:.
const mailText = (m) => `From: ${m.from}\nTo: ${m.to}\nDate: ${m.rawDate}\nSubject: ${m.subj}\n\n${m.body}`;
const mailDrag = (m) => `draggable="true" data-text="${esc(mailText(m))}"`;
function emailRow(m) {
  return `<a class="gm-row ${m.unread ? "unread" : ""}" href="#mail/${m.id}" ${mailDrag(m)}>
      <span class="chk"></span><span class="star">${ic("star")}</span>
      <span class="who">${esc(m.who)}</span>
      <span class="what"><b>${esc(m.subj)}</b> - ${esc(m.body.replace(/\s+/g, " ").slice(0, 150))}</span>
      <span class="when">${esc(day(m.date).replace(/, \d{4}$/, ""))}</span>
      <span class="hacts">${ic("archive")}${ic("trash")}${ic("mail")}${ic("clock")}</span></a>`;
}
function emailRead(m, list, unread) {
  return mailShell(`
    <div class="gm-tool"><a class="ib" href="#mail" aria-label="Back to Inbox">${ic("back")}</a>
      <button class="ib" aria-label="Archive">${ic("archive")}</button><button class="ib" aria-label="Delete">${ic("trash")}</button>
      <span class="count">${list.indexOf(m) + 1} of ${list.length}</span></div>
    <div class="gm-read">
      <div class="gm-subj"><h2>${esc(m.subj)}</h2></div>
      <div class="gm-msg">
        ${avatar(m.who || "?", "lg")}
        <div><div class="gm-from"><b>${esc(m.who)}</b> <span>&lt;${esc(m.addr)}&gt;</span></div><div class="gm-to">to me ▾</div></div>
        <div class="gm-date">${esc(day(m.date))}</div>
        <div class="gm-text" ${mailDrag(m)}>${esc(m.body)}</div>
        <p class="df-hint">Drag this email into VentureSauce to check its claims against the SEC filings, LinkedIn and Crunchbase.</p>
      </div>
    </div>`, unread);
}

async function mailView(openId) {
  const mails = await emails();
  const list = [...mails, ...(await alerts())];
  const unread = list.filter((m) => m.unread).length;
  const open = list.find((m) => m.id === openId);
  if (open && open.mail) {
    open.unread = false;
    return emailRead(open, list, list.filter((m) => m.unread).length);
  }
  if (!open) {
    const rows = list.map((r) => r.mail ? emailRow(r) : `<a class="gm-row ${r.unread ? "unread" : ""}" href="#mail/${r.id}" ${dragAttrs(r)}>
      <span class="chk"></span><span class="star">${ic("star")}</span>
      <span class="who">${SENDER.from}</span>
      <span class="what"><span class="lab">SEC alerts</span><b>${esc(subject(r))}</b> - ${esc(alertText(r).replace(/\s+/g, " ").slice(0, 150))}</span>
      <span class="when">${esc(day(r.filed).replace(/, \d{4}$/, ""))}</span>
      <span class="hacts">${ic("archive")}${ic("trash")}${ic("mail")}${ic("clock")}</span></a>`).join("");
    return mailShell(`
      <div class="gm-tool"><button class="ib" aria-label="Refresh">${ic("refresh")}</button><span class="count">1–${list.length} of ${list.length}</span></div>
      <div class="gm-tabs"><div class="on">${ic("inbox")}Primary</div><div>${ic("tag")}Promotions</div><div>${ic("people")}Social</div></div>
      <div class="gm-list">${rows}</div>`, unread);
  }
  open.unread = false;
  const links = [
    `<a class="ds-btn" href="${open.form_d}" target="_blank" rel="noreferrer">Form D on SEC ↗</a>`,
    site(open) ? `<a class="ds-btn" href="${site(open)}" target="_blank" rel="noreferrer" draggable="true" data-url="${site(open)}">${esc(open.site)} ↗</a>` : "",
    open.li ? `<a class="ds-btn" href="${open.li.url}" target="_blank" rel="noreferrer">LinkedIn ↗</a>` : "",
    open.cb ? `<a class="ds-btn" href="${open.cb.url}" target="_blank" rel="noreferrer">Crunchbase ↗</a>` : "",
  ].join("");
  return mailShell(`
    <div class="gm-tool"><a class="ib" href="#mail" aria-label="Back to Inbox">${ic("back")}</a>
      <button class="ib" aria-label="Archive">${ic("archive")}</button><button class="ib" aria-label="Delete">${ic("trash")}</button>
      <button class="ib" data-more aria-label="More">${ic("more", 'stroke-width="3"')}</button>
      <span class="count">${list.indexOf(open) + 1} of ${list.length}</span></div>
    <div class="gm-read">
      <div class="gm-subj"><h2>${esc(subject(open))}</h2><span class="lab">SEC alerts ×</span></div>
      <div class="gm-msg">
        ${avatar("V", "lg")}
        <div><div class="gm-from"><b>${SENDER.from}</b> <span>&lt;${SENDER.addr}&gt;</span></div><div class="gm-to">to me ▾</div></div>
        <div class="gm-date">${esc(day(open.filed))}<button class="ib" data-more aria-label="More">${ic("more", 'stroke-width="3"')}</button></div>
        <div class="gm-text">${esc(alertText(open))}</div>
        ${open.headline ? `<div class="df-news" ${dragAttrs(open)}><small>In the news · found by Bright Data's SERP API</small><b>${esc(open.headline)}</b><span>Drag into VentureSauce to check it against the SEC filings, LinkedIn and Crunchbase</span></div>` : ""}
        <div class="df-links">${links}</div>
        ${!open.headline && site(open) ? `<p class="df-hint">Drag the website into VentureSauce to check what ${esc(open.name)} says about itself.</p>` : ""}
      </div>
    </div>`, unread);
}
async function mailWire(openId) {
  const open = (await alerts()).find((m) => m.id === openId);
  document.querySelectorAll("[data-more]").forEach((b) => (b.onclick = (e) => {
    e.stopPropagation();
    if (!open) return;
    menu(b, [["Copy alert text", () => copy(`${subject(open)}\n\n${alertText(open)}\n\n${open.form_d}`, "Alert copied")],
             ["Open Form D on SEC", () => window.open(open.form_d, "_blank")]]);
  }));
}

/* ───────────── Deal flow (CRM look) from the pipeline ───────────── */
const FILTERS = { all: "All startups", news: "In the news", site: "Confirmed website", quiet: "Under the radar", judges: "Judges' companies" };
const SHOWN = 150;
/** A company's record, opened beside the table (as CRMs do) instead of leaving the list. */
async function dealRecord(r, back) {
  const { notes } = await notes_();
  const note = notes.find((n) => n.domain === r.site);
  const people = (r.people || "").split("; ").filter(Boolean);
  const row = (k, v) => `<div class="df-kv"><span>${k}</span><div>${v}</div></div>`;
  const ext = (url, text) => `<a href="${url}" target="_blank" rel="noreferrer">${esc(text)} ↗</a>`;
  return `<aside class="df-rec" aria-label="${esc(r.name)}">
    <header><div class="org">${logo(r.name)}<div><b>${esc(r.name)}</b><small>${esc([r.sector, r.city, r.state].filter(Boolean).join(" · "))}</small></div></div>
      <a class="ib" href="${back}" aria-label="Close">✕</a></header>
    ${r.headline ? `<div class="df-news" ${dragAttrs(r)}><small>In the news · found by Bright Data's SERP API</small><b>${esc(r.headline)}</b><span>Drag into VentureSauce to check it</span></div>` : ""}
    <h4>Funding on file (SEC Form D)</h4>
    ${row("Latest round", `<b>${money(r.sold)}</b>${r.target && r.target !== r.sold ? ` of ${money(r.target)}` : ""}${r.open ? ' <span class="round">open</span>' : ""}`)}
    ${row("Filed", `${esc(day(r.filed))}${r.first_sale ? ` · first sale ${esc(day(r.first_sale))}` : ""}`)}
    ${row("Security", esc(r.security || "-"))}
    ${row("All Form Ds", `${money(r.total)} across ${r.offerings} offering${r.offerings === 1 ? "" : "s"} · ${r.investors ?? "?"} investors`)}
    ${row("Incorporated", esc(r.founded || "-"))}
    ${people.length ? `<h4>People on the filing</h4><p>${people.map(esc).join(", ")}</p>` : ""}
    <h4>Profiles (via Bright Data)</h4>
    ${row("Website", r.site ? `<span draggable="true" data-url="${site(r)}">${ext(site(r), r.site)}</span>` : '<span class="nil">not confirmed</span>')}
    ${row("LinkedIn", r.li ? ext(r.li.url, `${r.li.employees} people`) : '<span class="nil">no confirmed profile</span>')}
    ${row("Crunchbase", r.cb ? ext(r.cb.url, r.cb.total ? `${money(r.cb.total)} total funding` : "profile") : '<span class="nil">no confirmed profile</span>')}
    ${r.quiet ? `<p class="df-note">No funding press found yet: the SEC filing is the only public trace of this raise.</p>` : ""}
    <div class="df-links">${ext(r.form_d, "Form D on SEC")}${ext(r.edgar, "All filings")}${note ? `<a href="#notes/${slug(note.name)}">Research note</a>` : ""}</div>
  </aside>`;
}

async function dealsView(filter = "all", q = "", open = "") {
  const { rows, fetched_at } = await flow();
  const base = `#deals/${filter}/${q || ""}`;
  q = decodeURIComponent(q || "").toLowerCase();
  const pick = { all: () => true, news: (r) => r.headline && r.site, site: (r) => r.site, quiet: (r) => r.quiet, judges: (r) => r.judges }[filter] || (() => true);
  const hits = rows.filter((r) => pick(r) && (!q || r.name.toLowerCase().includes(q)));
  const rec = open ? rows.find((r) => r.cik === open) : null;
  const body = hits.slice(0, SHOWN).map((r) => `<tr ${dragAttrs(r)} data-href="${base}/${r.cik}" class="${rec && rec.cik === r.cik ? "on" : ""}">
      <td><div class="org">${logo(r.name)}<div><b>${esc(r.name)}</b><small>${esc(r.headline || [r.sector, r.city].filter(Boolean).join(" · "))}</small></div></div></td>
      <td>${esc(day(r.filed))}</td>
      <td><b>${money(r.sold)}</b>${r.target && r.target !== r.sold ? `<small class="df-of"> of ${money(r.target)}</small>` : ""}${r.open ? ' <span class="round">open</span>' : ""}</td>
      <td>${money(r.total)}</td>
      <td>${r.li ? `<a href="${r.li.url}" target="_blank" rel="noreferrer">${r.li.employees}</a>` : '<span class="nil">-</span>'}</td>
      <td>${r.cb ? `<a href="${r.cb.url}" target="_blank" rel="noreferrer">${money(r.cb.total)}</a>` : '<span class="nil">-</span>'}</td>
      <td>${r.site ? `<a href="${site(r)}" target="_blank" rel="noreferrer">${esc(r.site)}</a>` : '<span class="nil">-</span>'}</td>
      <td>${r.quiet ? '<span class="round">no press yet</span>' : ""}${r.judges ? ` <span class="round">${esc(r.judges.relation)}</span>` : ""}</td>
      <td><a href="${r.form_d}" target="_blank" rel="noreferrer">Form D ↗</a></td></tr>`).join("");
  const tabs = Object.entries(FILTERS).map(([k, label]) => `<a href="#deals/${k}" class="${k === filter ? "on" : ""}">${label}</a>`).join("");
  return `<div class="crm ${rec ? "with-rec" : ""}">
    <aside class="crm-side"><div class="brand"><i></i>Relate</div>
      <div class="crm-search">Search people, orgs…<kbd>⌘K</kbd></div>
      <h6>Lists</h6><a class="on">Deal flow</a>
      <h6>Source</h6><p class="df-src">SEC Form D filings, enriched with LinkedIn and Crunchbase via Bright Data. Updated ${esc(day((fetched_at || "").slice(0, 10)))}.</p>
      <div class="crm-me">${avatar(ME.name)}<div><b>${ME.name}</b><small>${ME.addr}</small></div></div></aside>
    <section class="crm-main">
      <div class="crm-head"><h1>Deal flow</h1><span class="crm-sub">${hits.length.toLocaleString()} startups${hits.length > SHOWN ? ` · showing newest ${SHOWN}` : ""}</span><span class="grow"></span>
        <input class="df-q" placeholder="Search companies" value="${esc(q)}" aria-label="Search companies"></div>
      <div class="crm-views">${tabs}</div>
      <div class="crm-tablewrap"><table class="crm-table"><thead><tr><th>Company</th><th>Latest Form D</th><th>Latest round</th><th>All Form Ds</th><th>LinkedIn</th><th>Crunchbase</th><th>Website</th><th></th><th>Filing</th></tr></thead>
        <tbody>${body || `<tr><td colspan="9" class="nil">No startups match.</td></tr>`}</tbody></table></div>
    </section>${rec ? await dealRecord(rec, base) : ""}</div>`;
}
function dealsWire(filter = "all", q = "") {
  document.querySelectorAll(".crm-table tr[data-href]").forEach((r) => (r.onclick = (e) => { if (!e.target.closest("a")) location.hash = r.dataset.href; }));
  const box = $(".df-q");
  box.onkeydown = (e) => { if (e.key === "Enter") location.hash = `#deals/${filter}/${encodeURIComponent(box.value.trim())}`; };
}


/* ───────────── Files (Drive-like): real documents ───────────── */
// Companies' own announcement pages, printed to PDF from their websites (samples/page_*_announcement.pdf).
const DOCS = [
  { id: "legora", title: "Legora raises $550 million Series D to fuel US growth", from: "legora.com", when: "Mar 10, 2026", file: "page_legora_announcement.pdf", pages: 6, size: "3.1 MB" },
  { id: "lovable", title: "We just raised $400M in Series C funding", from: "lovable.dev", when: "Aug 12, 2026", file: "page_lovable_announcement.pdf", pages: 8, size: "1.8 MB" },
  { id: "harvey", title: "Harvey Raises $550M at a $15.5B Valuation", from: "harvey.ai", when: "Sep 9, 2026", file: "page_harvey_announcement.pdf", pages: 4, size: "276 KB" },
  { id: "clerk", title: "Clerk raises $50m Series C", from: "clerk.com", when: "Oct 15, 2025", file: "page_clerk_announcement.pdf", pages: 4, size: "1.3 MB" },
  { id: "daytona", title: "Daytona raises $24M Series A", from: "vcnewsdaily.com", when: "Feb 6, 2026", file: "page_daytona_announcement.pdf", pages: 2, size: "184 KB" },
];
const FILE_COLORS = { pdf: "#ea4335", txt: "#4285f4", sec: "#5f6368" };
// Every page of each PDF, rendered to an image (backend/static/demo/img/<id>-<page>.webp) for the Drive-style viewer.
const IMG = "/static/demo/img/";
const fileIcon = (kind) => `<svg class="fi" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" fill="${FILE_COLORS[kind]}"/><text x="12" y="16" text-anchor="middle" font-size="7" font-weight="700" fill="#fff" font-family="Arial">${{ pdf: "PDF", txt: "≡", sec: "SEC" }[kind]}</text></svg>`;

function filesShell(main, overlay = "") {
  return `<div class="fd">
    <header class="fd-top"><div class="fd-brand">${ic("file")}<span>Files</span></div>
      <label class="fd-search">${ic("search")}<input placeholder="Search in Files"><span>${ic("menu")}</span></label>
      <span class="grow"></span><button class="ib">${ic("help")}</button><button class="ib">${ic("gear")}</button><span style="padding:0 6px">${avatar(ME.name)}</span></header>
    <div class="fd-body">
      <nav class="fd-nav"><button class="fd-new"><b>+</b>New</button>
        <a>${ic("inbox")}Home</a><a class="on" href="#files">${ic("file")}Diligence</a><a>${ic("clock")}Recent</a><a>${ic("star")}Starred</a><a>${ic("trash")}Trash</a></nav>
      <main class="fd-main">${main}</main>
    </div>${overlay}</div>`;
}

async function filesList() {
  const { notes } = await notes_();
  const cards = DOCS.map((d) => `<a class="fd-card" href="#files/${d.id}" draggable="true" data-file="${d.file}">
      <div class="th"><img src="${IMG}${d.id}-1.webp" alt="" class="pt"></div>
      <div class="cap">${fileIcon("pdf")}<span>${esc(d.title)}</span></div><small>Saved from ${esc(d.from)} · ${d.when}</small></a>`).join("");
  const rows = [
    ...DOCS.map((d) => `<tr data-href="#files/${d.id}" draggable="true" data-file="${d.file}"><td><span class="nm">${fileIcon("pdf")}${esc(d.title)}.pdf</span></td><td>${esc(d.from)}</td><td>${d.when}</td><td>${d.size}</td><td class="acts">${ic("dl")}${ic("share")}</td></tr>`),
    ...CLIPS.map((c) => `<tr draggable="true" data-file="${c.file}"><td><span class="nm">${fileIcon("txt")}${esc(c.title)} (quotes).txt</span></td><td>${esc(c.from)}</td><td>Saved ${c.saved}</td><td>1 KB</td><td class="acts">${ic("dl")}</td></tr>`),
    ...notes.filter((n) => n.filings[0]).map((n) => `<tr data-ext="${n.filings[0].url}"><td><span class="nm">${fileIcon("sec")}${esc(n.entity || n.name)}: Form D, ${esc(n.filings[0].date)}</span></td><td>sec.gov</td><td>${esc(n.filings[0].date)}</td><td>-</td><td class="acts">${ic("share")}</td></tr>`),
  ].join("");
  return `<div class="fd-head"><h1>Diligence</h1><span class="grow"></span></div>
    <div class="fd-chips"><span>Type ⌄</span><span>Company ⌄</span><span>Modified ⌄</span></div>
    <h3 class="fd-sub">Funding announcements, saved from the companies' own sites</h3><div class="fd-cards">${cards}</div>
    <table class="fd-table"><thead><tr><th>Name</th><th>Source</th><th>Date</th><th>File size</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
}

async function filesView(id) {
  const d = DOCS.find((x) => x.id === id);
  if (!d) return filesShell(await filesList());
  const overlay = `<div class="fd-ov">
      <header class="fd-ovtop"><a class="ib" href="#files" aria-label="Close">${ic("back")}</a>${fileIcon("pdf")}<b draggable="true" data-file="${d.file}">${esc(d.title)}.pdf</b>
        <span class="grow"></span><span class="fd-open">Saved from ${esc(d.from)}</span><span class="grow"></span>
        <a class="ib" href="${S + d.file}" download aria-label="Download">${ic("dl")}</a></header>
      <div class="fd-pages">${Array.from({ length: d.pages }, (_, i) =>
        `<img src="${IMG}${d.id}-${i + 1}.webp" alt="${esc(d.title)}, page ${i + 1}" class="pt" loading="lazy">`).join("")}</div>
      <div class="fd-pill">Page <b id="fd-pg">1</b> / ${d.pages}</div>
    </div>`;
  return filesShell(await filesList(), overlay);
}
function filesWire(id) {
  document.querySelectorAll("tr[data-href]").forEach((r) => (r.onclick = () => (location.hash = r.dataset.href)));
  document.querySelectorAll("tr[data-ext]").forEach((r) => (r.onclick = () => window.open(r.dataset.ext, "_blank")));
  keys.on = null;
  const box = $(".fd-pages");
  if (!DOCS.find((x) => x.id === id) || !box) return;
  const imgs = [...box.querySelectorAll("img")];
  const go = (n) => imgs[n - 1]?.scrollIntoView({ block: "start", behavior: "smooth" });
  const cur = () => Number($("#fd-pg").textContent);
  box.addEventListener("scroll", () => {
    const top = box.getBoundingClientRect().top + 80;
    $("#fd-pg").textContent = imgs.filter((im) => im.getBoundingClientRect().top <= top).length || 1;
  });
  keys.on = (e) => {
    if (["ArrowRight", "ArrowDown", "PageDown"].includes(e.key)) { e.preventDefault(); go(Math.min(imgs.length, cur() + 1)); }
    if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); go(Math.max(1, cur() - 1)); }
    if (e.key === "Escape") location.hash = "#files";
  };
  $(".fd-ov").addEventListener("click", (e) => { if (e.target.classList.contains("fd-pages")) location.hash = "#files"; });
}
const keys = { on: null };
document.addEventListener("keydown", (e) => keys.on?.(e));

/* ───────────── Notes (Notion-like): company research from public records ───────────── */
let NOTES_ = null;
async function notes_() {
  if (!NOTES_) NOTES_ = await fetch("/static/demo/data/notes.json").then((r) => r.json());
  return NOTES_;
}
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const link = (url, text) => `<a href="${url}" target="_blank" rel="noreferrer">${esc(text)}</a>`;

function notesSide(list, active) {
  return `<aside class="nt-side">
      <div class="nt-ws"><i>R</i>Research<span class="chev">⌄</span></div>
      <a class="it"><span class="em">🔍</span>Search</a><a class="it"><span class="em">🏠</span>Home</a>
      <h6>Teamspaces</h6>
      <a class="it ${active ? "" : "on"}" href="#notes"><span class="em">🗂️</span>Company research</a>
      ${list.map((n) => `<a class="it sub ${slug(n.name) === active ? "on" : ""}" href="#notes/${slug(n.name)}"><span class="em">🏢</span>${esc(n.name)}</a>`).join("")}
    </aside>`;
}

function noteText(n) {
  const f = n.filings.map((x) => `- ${x.date}: ${money(x.sold)} sold${x.offering ? ` of ${money(x.offering)}` : ""}${x.amendment ? " (amendment)" : ""} ${x.url}`).join("\n");
  return [`${n.name} (${n.domain})`, n.headline ? `In the news: ${n.headline}` : "", "SEC Form D filings:", f,
    n.people.length ? `People on the filings: ${n.people.map((p) => p.name).join(", ")}` : "",
    n.linkedin ? `LinkedIn: ${n.linkedin.employees} people ${n.linkedin.url}` : "",
    n.crunchbase?.total_funding_usd ? `Crunchbase: ${money(n.crunchbase.total_funding_usd)} total funding ${n.crunchbase.url}` : "",
    ...n.press.map((p) => `Press: ${p.title} ${p.url}`)].filter(Boolean).join("\n");
}

async function notesView(id) {
  const { notes, fetched_at } = await notes_();
  const n = notes.find((x) => slug(x.name) === id);
  if (!n) {
    const rows = notes.map((x) => `<tr data-href="#notes/${slug(x.name)}"><td class="nm"><span>🏢</span><b>${esc(x.name)}</b><span class="open">OPEN</span></td>
      <td>${esc(x.sector || "-")}</td><td>${x.filings[0] ? money(x.filings[0].sold) : "-"}</td><td>${x.linkedin ? x.linkedin.employees : "-"}</td><td>${esc(x.domain)}</td></tr>`).join("");
    return `<div class="nt">${notesSide(notes, null)}
      <section class="nt-main"><div class="nt-top"><span>🗂️ Company research</span><span class="grow"></span><span class="crumb" style="font-size:13px">Updated ${esc(day((fetched_at || "").slice(0, 10)))}</span></div>
      <div class="nt-page"><div class="nt-db">
        <div class="nt-icon" style="margin-top:28px;font-size:56px">🗂️</div><h1>Company research</h1>
        <p class="nt-desc">What the public record says about each company: SEC Form D filings, LinkedIn and Crunchbase via Bright Data, and press. Every figure links to its source.</p>
        <table class="nt-table"><thead><tr><th>Aa Company</th><th>≡ Sector</th><th>$ Latest Form D</th><th>👥 LinkedIn</th><th>🔗 Website</th></tr></thead><tbody>${rows}</tbody></table>
        <div class="nt-count">COUNT <b>${notes.length}</b></div>
      </div></div></section></div>`;
  }
  const filings = n.filings.map((x) => `<li>${link(x.url, x.date)}: <b>${money(x.sold)}</b> sold${x.offering ? ` of ${money(x.offering)}` : ""}${x.amendment ? " (amendment)" : ""}</li>`).join("");
  const people = n.people.map((p) => `<li>${esc(p.name)}${p.director || p.officer ? ` <span class="nt-tag" style="background:#e3e2e0">${[p.officer && "officer", p.director && "director"].filter(Boolean).join(", ")}</span>` : ""}</li>`).join("");
  const press = n.press.map((p) => `<li>${link(p.url, p.title)}${p.date ? ` <span style="color:#9b9a97">${esc(p.date)}</span>` : ""}</li>`).join("");
  return `<div class="nt">${notesSide(notes, id)}
    <section class="nt-main">
      <div class="nt-top"><span class="crumb">🗂️ Company research</span><span class="crumb">/</span><span>🏢 ${esc(n.name)}</span><span class="grow"></span>
        <button class="tb" data-more aria-label="More">•••</button></div>
      <div class="nt-page"><div class="nt-cover"></div><div class="nt-doc">
        <div class="nt-icon">🏢</div><h1>${esc(n.name)}</h1>
        <dl class="nt-props">
          <dt>🔗 Website</dt><dd>${link(`https://${n.domain}`, n.domain)}</dd>
          <dt>🏛 SEC filer</dt><dd>${n.edgar ? link(n.edgar, `${n.entity} (CIK ${n.cik})`) : '<span style="color:#c7c6c4">No Form D found</span>'}</dd>
          <dt>≡ Sector</dt><dd>${esc(n.sector || "-")}</dd>
          <dt>📍 Based in</dt><dd>${esc(n.city || "-")}${n.founded ? ` · incorporated ${n.founded}` : ""}</dd>
        </dl>
        <div class="nt-body">
          ${n.headline ? `<p><mark>In the news: ${esc(n.headline)}</mark></p>` : ""}
          <h3>Funding on file (SEC Form D)</h3>${filings ? `<ul>${filings}</ul>` : "<p>No Form D filings found.</p>"}
          ${people ? `<h3>People on the filings</h3><ul>${people}</ul>` : ""}
          <h3>Team and funding profiles (via Bright Data)</h3>
          <ul><li>LinkedIn: ${n.linkedin ? `${link(n.linkedin.url, `${n.linkedin.employees} people`)}${n.linkedin.company_size ? ` (${esc(n.linkedin.company_size)})` : ""}` : "no confirmed profile"}</li>
            <li>Crunchbase: ${n.crunchbase ? link(n.crunchbase.url, n.crunchbase.total_funding_usd ? `${money(n.crunchbase.total_funding_usd)} total funding` : "profile") : "no confirmed profile"}</li></ul>
          ${press ? `<h3>In the press (via Bright Data)</h3><ul>${press}</ul>` : ""}
        </div>
        <div class="nt-back">Sources: SEC EDGAR, Bright Data (LinkedIn, Crunchbase, Google News), Data's pipeline on OSO</div>
      </div></div>
    </section></div>`;
}
async function notesWire(id) {
  document.querySelectorAll("tr[data-href]").forEach((r) => (r.onclick = () => (location.hash = r.dataset.href)));
  const n = (await notes_()).notes.find((x) => slug(x.name) === id);
  const more = $("[data-more]");
  if (n && more) more.onclick = (e) => { e.stopPropagation(); menu(more, [["Copy page text", () => copy(noteText(n), "Page text copied")]]); };
}

/* ───────────── Saved (read-later) ───────────── */
/** A clip's reported statements. The clip files open with a note on provenance and end with the source URL (shown
 * as a link instead), so only the statements are on screen. */
async function clipText(c) {
  const text = c.text || (await load(c.file));
  return text.split(/\n\s*\n/).filter((para) => !/public claims/i.test(para)).join("\n\n")
    .split("\n").filter((l) => !/^Source:/.test(l)).map((l) => l.replace(/^\s*-\s+/, "")).join("\n\n").trim();
}

async function savedView(id) {
  const open = CLIPS.find((c) => c.id === id) || CLIPS[0];
  const article = await clipText(open);
  const texts = await Promise.all(CLIPS.map(clipText));
  const list = CLIPS.map((c, i) => `<a class="rd-item ${c.id === open.id ? "on" : ""}" href="#saved/${c.id}">
      <span class="fav" style="background:${c.color}">${c.pub[0]}</span>
      <div><b>${esc(c.title)}</b><p>${esc(texts[i].slice(0, 96))}…</p><span>${esc(c.from)} · 1 min · Saved ${c.saved}</span></div></a>`).join("");
  // The reader shows each reported statement as a paragraph; the first one is highlighted, as if the reader marked it.
  const paras = article.split(/\n\n+/).map((t, i) => `<p>${i === 0 ? `<mark>${esc(t)}</mark>` : esc(t)}</p>`).join("");
  return `<div class="rd"><aside class="rd-list"><header><i></i>Saved<span class="grow"></span><small>${CLIPS.length} items</small></header>
      <div class="rd-tabs"><span class="on">All</span><span>Favorites</span><span>Highlights</span><span>Archive</span></div>${list}</aside>
    <section class="rd-art">
      <div class="rd-bar"><a href="${open.url}" target="_blank" rel="noreferrer">${esc(open.from)} ↗</a><span class="grow"></span>
        <button data-copy title="Copy text">Copy text</button>${open.file ? `<button data-dl title="Download">Download</button>` : ""}<button title="Favorite">☆</button><button title="Archive">${ic("archive")}</button></div>
      <article>
        <div class="src" draggable="true" data-file="${open.file}"><span class="fav" style="background:${open.color}">${open.pub[0]}</span>${esc(open.pub)} · 1 min read</div>
        <h1>${esc(open.title)}</h1>
        <div class="tags">${open.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
        <div class="txt">${paras}</div>
        <a class="orig" href="${open.url}" target="_blank" rel="noreferrer">Read the original at ${esc(open.from)} ↗</a>
      </article></section></div>`;
}
function savedWire(id) {
  const open = CLIPS.find((c) => c.id === id) || CLIPS[0];
  $("[data-copy]").onclick = async () => copy(await clipText(open), "Text copied");
  const d = $("[data-dl]");
  if (d) d.onclick = () => download(open.file, `${open.title}.txt`);
}

/* ───────────── Shell: apps, dock, routing ───────────── */
const tile = (bg, glyph) => `<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="11" fill="${bg}"/>${glyph}</svg>`;
const APPS = {
  mail: { name: "Mail", view: mailView, wire: mailWire, title: () => "Inbox - SEC alerts",
    icon: tile("#1a73e8", '<rect x="10" y="14" width="28" height="20" rx="3" fill="#fff"/><path d="M11 16l13 9 13-9" stroke="#1a73e8" stroke-width="2.4" fill="none" stroke-linejoin="round"/>') },
  deals: { name: "Deal flow", view: dealsView, wire: dealsWire, title: () => "Deal flow · Relate",
    icon: tile("#1b1f3b", '<circle cx="18" cy="20" r="5" fill="#7c5cff"/><circle cx="31" cy="18" r="4" fill="#3cc4ff"/><circle cx="27" cy="31" r="6" fill="#fff"/><path d="M18 20l13-2-4 13z" stroke="#fff" stroke-width="1.5" fill="none" opacity=".6"/>') },
  files: { name: "Files", view: filesView, wire: filesWire, title: (id) => `${DOCS.find((d) => d.id === id)?.title || "Diligence"} - Files`,
    icon: tile("#fff", '<rect x=".5" y=".5" width="47" height="47" rx="10.5" fill="none" stroke="#ddd"/><path d="M10 16a3 3 0 0 1 3-3h7l3 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3z" fill="#f4b400"/><path d="M10 20h28v11a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3z" fill="#fbc934"/>') },
  notes: { name: "Notes", view: notesView, wire: notesWire, title: () => "Company research",
    icon: tile("#fff", '<rect x=".5" y=".5" width="47" height="47" rx="10.5" fill="none" stroke="#ddd"/><path d="M14 12h16l6 6v18H14z" fill="#fff" stroke="#111" stroke-width="2.4" stroke-linejoin="round"/><path d="M19 21h12M19 26h12M19 31h8" stroke="#111" stroke-width="2.2" stroke-linecap="round"/>') },
  saved: { name: "Saved", view: savedView, wire: savedWire,
    title: (id) => `${(CLIPS.find((c) => c.id === id) || CLIPS[0]).title} · Saved`,
    icon: tile("#ef4056", '<path d="M15 12h18v24l-9-6-9 6z" fill="#fff"/>') },
};
const OLD = { press: "saved", crm: "deals", decks: "files" }; // old links

// Dragging a funding headline carries its text (with the company's site); a row or link without one carries the
// website; a saved clip carries its file.
// The VentureSauce panel opens the company if it's in the inbox, or reads the page and files it.
document.addEventListener("dragstart", (e) => {
  const el = e.target.closest?.("[data-url],[data-file],[data-text]");
  if (!el) return;
  if (el.dataset.text) return e.dataTransfer.setData("text/plain", el.dataset.text);
  const url = el.dataset.url || new URL(S + el.dataset.file, location.href).href;
  e.dataTransfer.setData("text/uri-list", url);
  e.dataTransfer.setData("text/plain", url);
});

function dock(active) {
  $("#dock").innerHTML = Object.entries(APPS).map(([k, a]) =>
    `<a href="#${k}" class="${k === active ? "on" : ""}" aria-label="${a.name}">${a.icon}<span>${a.name}</span></a>`).join("");
}

async function route() {
  let [app, ...rest] = (location.hash.slice(1) || "mail").split("/");
  app = OLD[app] || app;
  if (!APPS[app]) app = "mail";
  const a = APPS[app];
  keys.on = null;
  $("#app").innerHTML = await a.view(...rest);
  await a.wire?.(...rest);
  document.title = a.title(...rest);
  $("#favicon").href = "data:image/svg+xml," + encodeURIComponent(a.icon.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" '));
  dock(app);
}

window.addEventListener("hashchange", route);
route();
