// Demo desk: look-alikes of the tools an investor works in all day (mail, a deck viewer, notes, a CRM, a founder
// portal, a read-later list), so the extension can be demoed next to something that feels real. Every downloadable
// item is a real file from backend/samples/, and email/note bodies are read from those same files, so what's on
// screen is what gets dropped in. Acme and Northwind are fictional; the saved Daytona/Clerk pieces quote public claims.
"use strict";

const S = "/samples/";
const ME = { name: "Taylor Kim", addr: "taylor@fund.example", fund: "Kettle Peak Ventures" };
const DECK_PDF = { file: "00_acme_deck_FICTIONAL.pdf", name: "Acme AI deck.pdf" };
// Documents in the deck viewer. Slide images are rendered from backend/samples/src/ (see samples/README.md).
const DECKS = {
  acme: { title: "Acme AI deck", by: "Jane Founder", addr: "jane@acme-ai.example", when: "Oct 9", pages: 13, file: DECK_PDF.file, name: DECK_PDF.name,
    img: (n) => `/static/demo/img/acme-deck-${n}.webp`, msg: "Ahead of Thursday - let me know if anything's unclear.", viewed: "11 of 13 pages · 6 min" },
  board: { title: "Acme Q3 board update", by: "Jane Founder", addr: "jane@acme-ai.example", when: "Oct 8", pages: 7, file: "06_acme_board_update.pptx", name: "Acme Q3 board update.pptx",
    img: (n) => `/static/demo/img/acme-board-${n}.webp`, msg: "Q3 board slides, with speaker notes.", viewed: "7 of 7 pages · 4 min" },
  northwind: { title: "Northwind Robotics seed deck", by: "Priya Shah", addr: "priya@northwind-robotics.example", when: "Oct 7", pages: 8, file: "07_northwind_deck_FICTIONAL.pdf", name: "Northwind Robotics deck.pdf",
    img: (n) => `/static/demo/img/northwind-deck-${n}.webp`, msg: "Our seed deck, as promised.", viewed: "Not opened yet" },
  captable: { title: "Acme AI cap table (scan)", by: "Jane Founder", addr: "jane@acme-ai.example", when: "Oct 9", pages: 1, file: "08_acme_cap_table_scan_FICTIONAL.pdf", name: "Acme AI cap table.pdf",
    img: () => "/static/demo/img/acme-cap-table.webp", msg: "Scanned from the board binder.", viewed: "1 of 1 page · 1 min", portrait: true },
};

const MAIL = [
  { id: "invite", from: "Calendar", addr: "calendar-notification@fund.example", when: "8:02 AM", date: "Oct 10, 2026, 8:02 AM",
    subject: "Invitation: Acme AI partner meeting @ Thu Oct 15, 2026 10am - 11am (PDT)", label: "Deals",
    body: "Acme AI partner meeting\nThursday Oct 15, 2026 ⋅ 10am – 11am (Pacific Time)\n\nJoining: video call link in the invite\n\nGuests\nJane Founder - organizer\nMorgan Lee\nTaylor Kim\n\nReply for taylor@fund.example: Yes / No / Maybe" },
  { id: "acme-deck", from: "Jane Founder", addr: "jane@acme-ai.example", when: "Oct 9", date: "Oct 9, 2026, 4:12 PM", unread: true, starred: true,
    subject: "Deck for Thursday", label: "Deals",
    body: "Hi Taylor,\n\nAttaching our latest deck ahead of Thursday's partner meeting. The board update from last week is in the other thread.\n\nJane",
    attachments: [{ file: DECK_PDF.file, name: DECK_PDF.name, kind: "PDF", thumb: "/static/demo/img/acme-deck-1.webp", deck: "acme" }] },
  { id: "cap-table", from: "Jane Founder", addr: "jane@acme-ai.example", when: "Oct 9", date: "Oct 9, 2026, 5:47 PM", unread: true,
    subject: "Re: cap table", label: "Deals", who: "Jane, me", n: 2,
    body: "Hi Taylor,\n\nHere's the cap table summary from the board binder (sorry, only have it as a scan right now). Happy to send the full model once the data room is up.\n\nJane",
    attachments: [{ file: "08_acme_cap_table_scan_FICTIONAL.pdf", name: "Acme AI cap table.pdf", kind: "PDF", thumb: "/static/demo/img/acme-cap-table.webp", deck: "captable" }] },
  { id: "shared", from: "Decks", addr: "no-reply@decks.fund.example", when: "Oct 9", date: "Oct 9, 2026, 4:10 PM", unread: true,
    subject: "Jane Founder shared \"Acme AI deck\" with you",
    body: `Jane Founder (jane@acme-ai.example) shared a document with you.\n\nAcme AI deck\n${DECKS.acme.pages} pages\n\n"Ahead of Thursday - let me know if anything's unclear."`,
    cta: { label: "View document", href: "#decks/acme" } },
  { id: "daytona", from: "Morgan Lee", addr: "morgan@fund.example", when: "Oct 9", date: "Oct 9, 2026, 6:20 PM", unread: true,
    subject: "Daytona", label: "Deals", clip: "daytona",
    intro: "Taylor - came across this. Can you run it through and see what the filings say before Monday?\n\nMorgan" },
  { id: "acme-board", from: "Jane Founder", addr: "jane@acme-ai.example", when: "Oct 8", date: "Oct 8, 2026, 11:30 AM",
    subject: "Q3 board update", label: "Portfolio",
    body: "Hi all,\n\nQ3 board slides attached, with speaker notes. Happy to walk through any of it.\n\nJane",
    attachments: [{ file: "06_acme_board_update.pptx", name: "Acme Q3 board update.pptx", kind: "PPTX", thumb: "/static/demo/img/acme-board-1.webp", deck: "board" }] },
  { id: "northwind", from: "Priya Shah", addr: "priya@northwind-robotics.example", when: "Oct 7", unread: true, label: "Deals",
    subject: "Intro - Northwind Robotics (pre-seed)", file: "04_northwind_intro_email.eml",
    attachments: [{ file: "07_northwind_deck_FICTIONAL.pdf", name: "Northwind Robotics deck.pdf", kind: "PDF", thumb: "/static/demo/img/northwind-deck-1.webp", deck: "northwind" }] },
  { id: "partners", from: "Morgan Lee", addr: "morgan@fund.example", when: "Oct 6", date: "Oct 6, 2026, 7:45 PM",
    subject: "Monday partner meeting: agenda",
    body: "Agenda for Monday:\n\n1. Pipeline review\n2. Acme AI: decide on a follow-up call\n3. Portfolio updates\n\nMorgan" },
  { id: "newsletter", from: "The Weekly Term Sheet", addr: "hello@termsheet.example", when: "Oct 5", date: "Oct 5, 2026, 6:00 AM",
    subject: "Seed rounds are getting bigger, and slower",
    body: "Good morning.\n\nThis week: why seed rounds keep stretching out, a short guide to reading a cap table in five minutes, and three questions to ask before any follow-on.\n\nRead in browser · Unsubscribe" },
  { id: "lp", from: "Fund Ops", addr: "ops@fund.example", when: "Oct 5", date: "Oct 5, 2026, 9:00 AM",
    subject: "Reminder: quarterly LP letter draft due Friday",
    body: "A reminder that the quarterly LP letter draft is due Friday. Template is in the shared drive.\n\nFund Ops" },
  { id: "acme-update", from: "Jane Founder", addr: "jane@acme-ai.example", when: "Oct 2", label: "Portfolio",
    subject: "Acme AI - September update", file: "01_acme_founder_email.eml" },
  { id: "portal", from: "Acme AI Investor Portal", addr: "updates@acme-ai.example", when: "Oct 1", date: "Oct 1, 2026, 10:00 AM",
    subject: "New metrics posted for September 2026",
    body: "Acme AI posted new metrics to their investor dashboard.\n\nPeriod: September 2026\nUpdated: ARR, growth, headcount, customers",
    cta: { label: "Open dashboard", href: "#portal" } },
  // Older mail: texture so the inbox looks lived-in. Fictional people and companies; nothing here is dropped in the demo.
  ...[
    ["kestrel-sep", "Lena Ortiz", "lena@kestrelhealth.example", "Sep 30", "Kestrel Health - September investor update", "Portfolio",
      "Hi all,\n\nSeptember was about our first hospital network going live. Highlights, lowlights and one ask below.\n\nHighlights\n- Network rollout finished on schedule\n- Two senior engineering hires accepted\n\nLowlights\n- Procurement at the second network slipped a quarter\n\nAsk: intros to heads of nursing informatics.\n\nLena"],
    ["esign", "E-Signature", "no-reply@sign.fund.example", "Sep 30", "Completed: Side letter - Fund II (all parties signed)", "",
      "All parties have completed \"Side letter - Fund II\".\n\nThe completed document is attached to the envelope in your account."],
    ["ic-memo", "Morgan Lee", "morgan@fund.example", "Sep 29", "Re: IC memo template", "",
      "Updated the template with a section for open diligence questions and a 'what would make us wrong' box. Use it for anything going to Monday.\n\nM", "Morgan, me", 4],
    ["syndicate", "Harbor Lane Syndicate", "deals@harborlane.example", "Sep 29", "New deal: industrial automation, seed (allocations close Friday)", "",
      "A new deal is open to syndicate members. Memo, terms and the founder Q&A recording are in the deal room.\n\nAllocations close Friday at 5pm PT."],
    ["recruit", "Dana Whitfield", "dana@talentworks.example", "Sep 28", "Head of Finance candidates for your portfolio", "",
      "Hi Taylor,\n\nThree strong Head of Finance candidates came free this month, all with Series A to B experience. Happy to share profiles with any portfolio company that's hiring.\n\nDana"],
    ["lp-call", "Fund Ops", "ops@fund.example", "Sep 27", "LP call recording and slides", "LPs",
      "Thanks to everyone who joined the quarterly LP call. The recording and slides are in the data room under Fund II / LP updates.\n\nFund Ops"],
    ["copperline", "Ben Adeyemi", "ben@copperline.example", "Sep 26", "Copperline: we closed our bridge", "Portfolio",
      "Taylor,\n\nQuick note that the bridge is closed and wired. Thank you for leaning in when it mattered. Full update with the October numbers next week.\n\nBen"],
    ["intro-ravi", "Ravi Menon", "ravi@menonangels.example", "Sep 25", "Intro: Taylor <> Sofia (Fieldnote)", "Deals",
      "Taylor, meet Sofia, who's building Fieldnote: voice notes for field technicians that turn into work orders. Sofia, Taylor invests at seed in vertical software.\n\nI'll let you two take it from here.\n\nRavi", "Ravi, Sofia, me", 3],
    ["cal-accept", "Ben Adeyemi", "ben@copperline.example", "Sep 25", "Accepted: Copperline Q3 check-in @ Wed Oct 14", "",
      "Ben Adeyemi has accepted this invitation.\n\nCopperline Q3 check-in\nWednesday Oct 14, 2026 ⋅ 11am – 11:45am (Pacific Time)"],
    ["newsletter2", "The Weekly Term Sheet", "hello@termsheet.example", "Sep 24", "What founders ask for in a lead investor", "",
      "Good morning.\n\nThis week: a survey of what founders say they want from a lead, how to run a reference call that actually tells you something, and a note on pro-rata.\n\nRead in browser · Unsubscribe"],
    ["portco-board", "Lena Ortiz", "lena@kestrelhealth.example", "Sep 23", "Board meeting: Thu Oct 22, materials by Oct 15", "Portfolio",
      "Hi board,\n\nLocking in Thursday Oct 22 for the Q3 board meeting. Materials will be out a week ahead. Let me know if you'd like anything added to the agenda.\n\nLena"],
    ["legal", "Avery Brooks", "avery@brookslaw.example", "Sep 22", "Re: Copperline bridge - closing set", "Portfolio",
      "Attached is the closing set for your records. Nothing further needed from you.\n\nAvery Brooks\nBrooks Law", "Avery, me", 5],
    ["conf", "Logistics Tech Summit", "events@logisticssummit.example", "Sep 21", "Your pass for Logistics Tech Summit", "",
      "Your investor pass is confirmed. Show the QR code in the app at check-in. The investor lounge is on level 2."],
    ["fieldnote", "Sofia Marchetti", "sofia@fieldnote.example", "Sep 20", "Fieldnote - quick overview", "Deals",
      "Hi Taylor,\n\nThanks for the time on Thursday. As promised, a short overview is in the doc linked below. We'd love to keep you posted as we get closer to raising.\n\nSofia"],
    ["morgan-pipeline", "Morgan Lee", "morgan@fund.example", "Sep 19", "Pipeline sheet is now in the CRM", "",
      "Moved the pipeline out of the spreadsheet and into the CRM. Owners and stages are set; please update next steps there from now on.\n\nM"],
    ["expense", "Fund Ops", "ops@fund.example", "Sep 18", "Expense reports due Sep 25", "",
      "Friendly reminder that September expense reports are due on the 25th."],
    ["tidewell", "Marcus Hale", "marcus@tidewell.example", "Sep 17", "Re: Tidewell follow-up", "Deals",
      "Totally understand, and thanks for the thoughtful note. Would love to stay in touch as we hit the milestones you mentioned.\n\nMarcus", "Marcus, me", 2],
    ["alumni", "Founders Dinner", "rsvp@foundersdinner.example", "Sep 16", "You're invited: founders and investors dinner, Oct 20", "",
      "Join us for a small dinner of founders and seed investors on Tuesday Oct 20. RSVP by Oct 12."],
    ["orbitwise", "Kai Nakamura", "kai@orbitwise.example", "Sep 15", "Orbitwise data room access", "Deals",
      "Hi Taylor,\n\nYou now have access to the data room. Let me know who else on your team should be added.\n\nKai"],
    ["security", "Account Security", "no-reply@mail.fund.example", "Sep 14", "New sign-in on Mac", "",
      "We noticed a new sign-in to your account on a Mac. If this was you, you don't need to do anything."],
  ].map(([id, from, addr, when, subject, label, body, who, n]) => ({ id, from, addr, when, subject, label, body, who, n, date: `${when}, 2026` })),
];
const NOTES = [
  { id: "acme-call", title: "Acme AI: call with Jane", icon: "📞", when: "October 6, 2026", file: "02_acme_call_notes.txt",
    company: "Acme AI", tags: [["Call", "#dbeddb"], ["Diligence", "#fadec9"]] },
  { id: "hallway", title: "Conference hallway", icon: "☕", when: "October 9, 2026", file: "03_unnamed_quick_note.txt",
    company: "", tags: [["Quick note", "#e3e2e0"]] },
];
const CLIPS = [
  { id: "daytona", title: "Daytona raises $24M Series A", pub: "VC News Daily", from: "vcnewsdaily.com", file: "10_daytona_public_claims.txt",
    url: "https://www.vcnewsdaily.com/Daytona/venture-capital-funding/yycfztlnkn", saved: "Oct 8", tags: ["Dev infra", "Pipeline"], color: "#0b5cad" },
  { id: "clerk", title: "Clerk raises $50M Series C", pub: "Clerk blog", from: "clerk.com", file: "11_clerk_public_claims.txt",
    url: "https://clerk.com/blog/series-c", saved: "Oct 7", tags: ["Auth", "Comps"], color: "#6c47ff" },
  { id: "acme-press", title: "Acme AI raises $10M seed led by Example Ventures", pub: "Example News", from: "example.com", saved: "Sep 30",
    text: "Acme AI announced a $10 million seed round led by Example Ventures.", url: "https://example.com/acme/press", tags: ["Acme AI"], color: "#e0663a" },
];
// [name, what they do, stage, owner, source, last touch, next step, relationship strength 0-4, round, link]
const DEALS = [
  ["Acme AI", "AI planning for warehouses", "Diligence", ME.name, "Inbound: founder", "Oct 9", "Partner meeting Thu Oct 15", 4, "Series A", "#notes/acme-call"],
  ["Northwind Robotics", "Picking arms for small warehouses", "First meeting", ME.name, "Intro: Priya (founder)", "Oct 7", "Intro call Tue", 2, "Pre-seed", "#mail/northwind"],
  ["Daytona", "Infrastructure for AI-generated code", "Sourced", "Morgan Lee", "Press: Series A coverage", "Oct 9", "Check filings", 1, "", "#mail/daytona"],
  ["Larkspur Labs", "Dev tools for robotics teams", "Sourced", "Morgan Lee", "Conference", "Oct 9", "Send intro email", 1, ""],
  ["Cinder Analytics", "Warehouse data platform", "Sourced", ME.name, "Outbound", "Oct 3", "Follow up in two weeks", 1, ""],
  ["Orbitwise", "Fleet routing", "Diligence", "Morgan Lee", "Intro: co-investor", "Sep 28", "Data room review", 3, "Seed"],
  ["Pebblepath", "Last-mile scheduling", "Partner meeting", "Morgan Lee", "Intro: portfolio founder", "Sep 30", "IC memo draft", 3, "Seed"],
  ["Fieldnote", "Voice notes to work orders", "First meeting", ME.name, "Intro: Ravi (angel)", "Sep 25", "Wait for raise", 2, ""],
  ["Tidewell", "Cold-chain sensors", "Passed", "Morgan Lee", "Inbound", "Sep 21", "Check back next year", 2, "Seed"],
];
const STAGE_COLORS = { Sourced: ["#eef0f6", "#4a4f6a"], "First meeting": ["#e3f6fd", "#0f6a8a"], Diligence: ["#efeaff", "#5b3fd1"], "Partner meeting": ["#fff3dc", "#9a5b00"], Passed: ["#f1f1f4", "#7c7f93"] };

const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
// The sample files carry "(FICTIONAL company, test data)" markers for the pipeline; on screen they'd break the illusion.
const clean = (s) => s.replace(/\s*\((?:FICTIONAL)[^)]*\)/g, "");
const cache = {};
async function load(file) {
  if (!(file in cache)) cache[file] = await fetch(S + file).then((r) => (r.ok ? r.text() : ""));
  return clean(cache[file]);
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

/* ───────────── Mail ───────────── */
async function mailBody(m) {
  if (m.clip) {
    const c = CLIPS.find((x) => x.id === m.clip);
    return { text: `${m.intro}\n\n> ${c.title} (${c.from})\n> ${(await clipText(c)).replace(/\n+/g, "\n> ")}\n\n${c.url}`, date: m.date };
  }
  if (!m.file) return { text: m.body, date: m.date };
  const { headers, body } = parseEml(await load(m.file));
  const d = new Date(headers.date);
  const date = isNaN(d) ? m.when : d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  return { text: body, date };
}

function mailShell(main) {
  const unread = MAIL.filter((m) => m.unread).length;
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
        <a href="#mail">${ic("star")}Starred</a><a href="#mail">${ic("clock")}Snoozed</a>
        <a href="#mail">${ic("send")}Sent</a><a href="#mail">${ic("file")}Drafts<span class="n" style="font-weight:400">2</span></a>
        <a href="#mail">${ic("down")}More</a>
        <h4>Labels</h4>
        <a href="#mail"><i class="dot" style="background:#16a765"></i>Deals</a>
        <a href="#mail"><i class="dot" style="background:#4986e7"></i>Portfolio</a>
        <a href="#mail"><i class="dot" style="background:#f691b2"></i>LPs</a>
      </nav>
      <section class="gm-main">${main}</section>
    </div></div>`;
}

async function mailView(openId) {
  const open = MAIL.find((m) => m.id === openId);
  if (!open) return mailList();
  open.unread = false;
  const { text, date } = await mailBody(open);
  const files = open.attachments || [];
  const cards = files.map((a) => `<div class="attcard" title="${esc(a.name)}">
      <a class="prev" href="${a.deck ? `#decks/${a.deck}` : S + a.file}" ${a.deck ? "" : `download="${esc(a.name)}"`}>
        ${a.thumb ? `<img src="${a.thumb}" alt="">` : `<div class="ph k-ppt">P</div>`}</a>
      <div class="bar"><i class="k-${a.kind === "PDF" ? "pdf" : "ppt"}">${a.kind === "PDF" ? "PDF" : "P"}</i><span>${esc(a.name)}</span></div>
      <a class="dlb" href="${S + a.file}" download="${esc(a.name)}" title="Download">${ic("dl")}</a></div>`).join("");
  const n = files.length;
  return mailShell(`
    <div class="gm-tool"><a class="ib" href="#mail" aria-label="Back to Inbox">${ic("back")}</a>
      <button class="ib" aria-label="Archive">${ic("archive")}</button><button class="ib" aria-label="Delete">${ic("trash")}</button>
      <button class="ib" aria-label="Mark as unread">${ic("mail")}</button><button class="ib" aria-label="Snooze">${ic("clock")}</button>
      <button class="ib" aria-label="Labels">${ic("tag")}</button><button class="ib" data-more aria-label="More">${ic("more", 'stroke-width="3"')}</button>
      <span class="count">${MAIL.indexOf(open) + 1} of ${MAIL.length}</span></div>
    <div class="gm-read">
      <div class="gm-subj"><h2>${esc(open.subject)}</h2><span class="lab">Inbox ×</span>${open.label ? `<span class="lab">${open.label} ×</span>` : ""}
        <span style="flex:1"></span><button class="ib" aria-label="Print">${ic("print")}</button></div>
      ${open.n > 1 ? `<div class="gm-earlier"><span>${open.n - 1}</span>earlier message${open.n > 2 ? "s" : ""}</div>` : ""}
      <div class="gm-msg">
        ${avatar(open.from, "lg")}
        <div><div class="gm-from"><b>${esc(open.from)}</b> <span>&lt;${esc(open.addr)}&gt;</span></div><div class="gm-to">to me ▾</div></div>
        <div class="gm-date">${esc(date || open.when)}<button class="ib" aria-label="Star">${ic("star")}</button><button class="ib" aria-label="Reply">${ic("reply")}</button><button class="ib" data-more aria-label="More">${ic("more", 'stroke-width="3"')}</button></div>
        <div class="gm-text">${esc(text)}${open.cta ? `\n\n<a href="${open.cta.href}" style="display:inline-block;background:#1a73e8;color:#fff;text-decoration:none;padding:9px 18px;border-radius:4px;font-family:var(--sans)">${esc(open.cta.label)}</a>` : ""}</div>
        ${n ? `<div class="gm-att"><h5>${n === 1 ? "One attachment" : `${n} attachments`} <span>• Scanned for viruses</span></h5><div class="cards">${cards}</div></div>` : ""}
      </div>
      <div class="gm-reply"><button>${ic("reply")}Reply</button><button>${ic("fwd")}Forward</button></div>
    </div>`);
}

async function mailList() {
  const rows = await Promise.all(MAIL.map(async (m) => {
    const { text } = await mailBody(m);
    const snip = text.replace(/\s+/g, " ").slice(0, 140);
    const chips = (m.attachments || []).map((a) => `<span class="chipfile"><i class="k-${a.kind === "PDF" ? "pdf" : "ppt"}">${a.kind === "PDF" ? "PDF" : "P"}</i><span>${esc(a.name)}</span></span>`).join("");
    return `<a class="gm-row ${m.unread ? "unread" : ""}" href="#mail/${m.id}">
      <span class="chk"></span><span class="star ${m.starred ? "on" : ""}">${ic("star", m.starred ? 'fill="currentColor"' : "")}</span>
      <span class="who">${esc(m.who || m.from)}${m.n ? ` <span class="tn">${m.n}</span>` : ""}</span>
      <span class="what">${m.label ? `<span class="lab">${m.label}</span>` : ""}<b>${esc(m.subject)}</b> - ${esc(snip)}</span>
      <span class="when">${esc(m.when)}</span>
      <span class="hacts">${ic("archive")}${ic("trash")}${ic("mail")}${ic("clock")}</span>
      ${chips ? `<span class="chips">${chips}</span>` : ""}</a>`;
  }));
  return mailShell(`
    <div class="gm-tool"><button class="ib" aria-label="Select"><span class="chk" style="width:18px;height:18px;border:2px solid #9aa0a6;border-radius:2px"></span></button>
      <button class="ib" aria-label="Refresh">${ic("refresh")}</button><button class="ib" aria-label="More">${ic("more", 'stroke-width="3"')}</button>
      <span class="count">1–50 of 2,184</span></div>
    <div class="gm-tabs"><div class="on">${ic("inbox")}Primary</div><div>${ic("tag")}Promotions</div><div>${ic("people")}Social</div><div>${ic("help")}Updates <span class="pill">4 new</span></div></div>
    <div class="gm-list">${rows.join("")}</div>`);
}

function mailWire(openId) {
  const open = MAIL.find((m) => m.id === openId);
  document.querySelectorAll("[data-more]").forEach((b) => (b.onclick = async (e) => {
    e.stopPropagation();
    if (!open) return;
    const { text } = await mailBody(open);
    const items = [["Copy message text", () => copy(`From: ${open.from} <${open.addr}>\nSubject: ${open.subject}\n\n${text}`, "Message copied")]];
    if (open.file) items.push(["Download message", () => download(open.file, `${open.subject}.eml`)]);
    for (const a of open.attachments || []) items.push([`Download ${a.name}`, () => download(a.file, a.name)]);
    menu(b, items);
  }));
}

/* ───────────── Files (Drive-like) ───────────── */
// Other items in "Shared with me": texture only, not openable. [kind, name, owner, shared, size]
const FILE_ROWS = [
  ["folder", "Acme AI - data room", "Jane Founder", "Oct 9", "-"],
  ["sheet", "Kestrel Health - September financials", "Lena Ortiz", "Sep 30", "184 KB"],
  ["doc", "Fund II - Q3 LP letter (draft)", "Morgan Lee", "Sep 29", "96 KB"],
  ["doc", "IC memo template", "Morgan Lee", "Sep 29", "41 KB"],
  ["pdf", "Copperline - bridge closing set", "Avery Brooks", "Sep 22", "2.1 MB"],
  ["slides", "Orbitwise - management presentation", "Kai Nakamura", "Sep 15", "8.4 MB"],
];
const FILE_COLORS = { pdf: "#ea4335", slides: "#f4b400", doc: "#4285f4", sheet: "#0f9d58", folder: "#5f6368" };
const fileIcon = (kind) => kind === "folder"
  ? `<svg class="fi" viewBox="0 0 24 24"><path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="#5f6368"/></svg>`
  : `<svg class="fi" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" fill="${FILE_COLORS[kind]}"/><text x="12" y="16" text-anchor="middle" font-size="8" font-weight="700" fill="#fff" font-family="Arial">${{ pdf: "PDF", slides: "P", doc: "≡", sheet: "▦" }[kind]}</text></svg>`;
const deckKind = (d) => (d.file.endsWith(".pptx") ? "slides" : "pdf");
const SIZES = { acme: "376 KB", board: "54 KB", northwind: "140 KB", captable: "179 KB" };

function filesShell(main, overlay = "") {
  return `<div class="fd">
    <header class="fd-top"><div class="fd-brand">${ic("file")}<span>Files</span></div>
      <label class="fd-search">${ic("search")}<input placeholder="Search in Files"><span>${ic("menu")}</span></label>
      <span class="grow"></span><button class="ib">${ic("help")}</button><button class="ib">${ic("gear")}</button><button class="ib">${ic("grid", 'stroke-width="3.2"')}</button><span style="padding:0 6px">${avatar(ME.name)}</span></header>
    <div class="fd-body">
      <nav class="fd-nav"><button class="fd-new"><b>+</b>New</button>
        <a>${ic("inbox")}Home</a><a>${ic("file")}My Files</a><a>${ic("grid", 'stroke-width="3.2"')}Computers</a>
        <a class="on" href="#decks">${ic("people")}Shared with me</a><a>${ic("clock")}Recent</a><a>${ic("star")}Starred</a>
        <a>${ic("mail")}Spam</a><a>${ic("trash")}Trash</a><a>${ic("archive")}Storage</a>
        <div class="fd-quota"><i><b style="width:38%"></b></i>5.7 GB of 15 GB used</div></nav>
      <main class="fd-main">${main}</main>
    </div>${overlay}</div>`;
}

function filesList() {
  const decks = Object.entries(DECKS).map(([k, d]) => [deckKind(d), d.title, d.by, d.when, SIZES[k], `#decks/${k}`]);
  const rows = [...decks, ...FILE_ROWS].map(([kind, name, owner, when, size, href]) => `
    <tr ${href ? `data-href="${href}"` : ""}><td><span class="nm">${fileIcon(kind)}${esc(name)}</span></td>
      <td><span class="ow">${avatar(owner)}${esc(owner)}</span></td><td>${when}</td><td>${size}</td>
      <td class="acts">${ic("dl")}${ic("share")}${ic("more", 'stroke-width="3"')}</td></tr>`).join("");
  const cards = Object.entries(DECKS).map(([k, d]) => `<a class="fd-card" href="#decks/${k}">
      <div class="th"><img src="${d.img(1)}" alt="" class="${d.portrait ? "pt" : ""}"></div>
      <div class="cap">${fileIcon(deckKind(d))}<span>${esc(d.title)}</span></div>
      <small>${esc(d.by)} shared · ${d.when}</small></a>`).join("");
  return `<div class="fd-head"><h1>Shared with me</h1><span class="grow"></span><span class="fd-vt"><b>☰</b><span>▦</span></span></div>
    <div class="fd-chips"><span>Type ⌄</span><span>People ⌄</span><span>Modified ⌄</span><span>Source ⌄</span></div>
    <h3 class="fd-sub">Suggested files</h3><div class="fd-cards">${cards}</div>
    <table class="fd-table"><thead><tr><th>Name</th><th>Shared by</th><th>Share date ↓</th><th>File size</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
}

function decksView(id, page) {
  const d = DECKS[id];
  if (!d) return filesShell(filesList());
  const pages = Array.from({ length: d.pages }, (_, i) =>
    `<img src="${d.img(i + 1)}" alt="${esc(d.title)}, page ${i + 1}" data-page="${i + 1}" class="${d.portrait ? "pt" : ""}" loading="lazy">`).join("");
  const overlay = `<div class="fd-ov">
      <header class="fd-ovtop"><a class="ib" href="#decks" aria-label="Close">${ic("back")}</a>${fileIcon(deckKind(d))}<b>${esc(d.title)}</b>
        <span class="grow"></span><span class="fd-open">Open with ⌄</span><span class="grow"></span>
        <button class="ib" aria-label="Comment">${ic("pen")}</button><button class="ib" aria-label="Print">${ic("print")}</button>
        <a class="ib" href="${S + d.file}" download="${esc(d.name)}" aria-label="Download">${ic("dl")}</a>
        <button class="ib" aria-label="Share">${ic("share")}</button><button class="ib" aria-label="More">${ic("more", 'stroke-width="3"')}</button></header>
      <div class="fd-pages">${pages}</div>
      <div class="fd-pill">Page <b id="fd-pg">${Math.min(d.pages, Math.max(1, Number(page) || 1))}</b> / ${d.pages}<i></i>−<span>${ic("search")}</span>+</div>
    </div>`;
  return filesShell(filesList(), overlay);
}
function decksWire(id, page) {
  document.querySelectorAll("tr[data-href]").forEach((r) => (r.onclick = () => (location.hash = r.dataset.href)));
  const d = DECKS[id];
  const box = $(".fd-pages");
  if (!d || !box) return;
  const imgs = [...box.querySelectorAll("img")];
  const go = (n) => imgs[n - 1]?.scrollIntoView({ block: "start" });
  if (Number(page) > 1) requestAnimationFrame(() => go(Number(page)));
  box.addEventListener("scroll", () => {
    const top = box.getBoundingClientRect().top + 80;
    const cur = imgs.filter((im) => im.getBoundingClientRect().top <= top).length || 1;
    $("#fd-pg").textContent = cur;
  });
  keys.on = (e) => {
    const cur = Number($("#fd-pg").textContent);
    if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); go(Math.min(d.pages, cur + 1)); }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); go(Math.max(1, cur - 1)); }
    if (e.key === "Escape") location.hash = "#decks";
  };
  $(".fd-ov").addEventListener("click", (e) => { if (e.target.classList.contains("fd-pages")) location.hash = "#decks"; });
}

/* ───────────── Notes ───────────── */
// Other rows in the "Deal notes" database: texture only, not openable.
const NOTE_ROWS = [
  ["📝", "Kestrel Health: board prep", "Kestrel Health", "Portfolio", "September 23, 2026", "Taylor Kim"],
  ["🧾", "Copperline: bridge rationale", "Copperline", "Portfolio", "September 22, 2026", "Morgan Lee"],
  ["📞", "Fieldnote: first call", "Fieldnote", "Call", "September 18, 2026", "Taylor Kim"],
  ["🚫", "Tidewell: pass note", "Tidewell", "Pass", "September 17, 2026", "Morgan Lee"],
  ["🔎", "Orbitwise: data room review", "Orbitwise", "Diligence", "September 16, 2026", "Morgan Lee"],
];
const TYPE_COLORS = { Call: "#dbeddb", Diligence: "#fadec9", "Quick note": "#e3e2e0", Portfolio: "#d3e5ef", Pass: "#ffe2dd" };

/** A note file → Notion-ish blocks. "Follow-up: a and b" becomes to-dos. */
function noteHtml(text) {
  const out = [];
  let list = null;
  const flush = () => { if (list) out.push(`<ul>${list.join("")}</ul>`); list = null; };
  for (const line of text.split("\n")) {
    const li = line.match(/^\s*[-•]\s+(.*)$/);
    const todo = li && li[1].match(/^Follow-up:\s*(.*)$/i);
    if (todo) {
      flush();
      const items = todo[1].replace(/^ask for /i, "").replace(/\.$/, "").split(/\s+and\s+/);
      out.push(`<h3>Follow-ups</h3>` + items.map((t) => `<label class="nt-todo"><input type="checkbox"><span>Ask for ${esc(t)}</span></label>`).join(""));
      continue;
    }
    if (li) { (list ||= []).push(`<li>${esc(li[1])}</li>`); continue; }
    flush();
    if (line.trim()) out.push(`<p>${esc(line)}</p>`);
  }
  flush();
  return out.join("");
}

function notesSide(active) {
  const side = NOTES.map((n) => `<a class="it sub ${n.id === active ? "on" : ""}" href="#notes/${n.id}"><span class="em">${n.icon}</span>${esc(n.title)}</a>`).join("");
  return `<aside class="nt-side">
      <div class="nt-ws"><i>K</i>${esc(ME.fund)}<span class="chev">⌄</span></div>
      <a class="it"><span class="em">🔍</span>Search</a><a class="it"><span class="em">🏠</span>Home</a><a class="it"><span class="em">📥</span>Inbox<span class="cnt">2</span></a>
      <h6>Teamspaces</h6>
      <a class="it"><span class="em">📈</span>Pipeline</a>
      <a class="it ${active ? "" : "on"}" href="#notes"><span class="em">🗒️</span>Deal notes</a>${side}
      <a class="it"><span class="em">🗂️</span>IC memos</a><a class="it"><span class="em">🗓️</span>Weekly partner sync</a><a class="it"><span class="em">📚</span>Portfolio</a><a class="it"><span class="em">🧭</span>Theses</a>
      <h6>Private</h6><a class="it"><span class="em">✅</span>To-dos</a><a class="it"><span class="em">✍️</span>Drafts</a>
      <div class="nt-sidefoot"><a class="it"><span class="em">⚙️</span>Settings</a><a class="it"><span class="em">🗑️</span>Trash</a></div>
    </aside>`;
}

async function notesView(id) {
  const open = NOTES.find((n) => n.id === id);
  if (!open) return notesHome();
  const text = await load(open.file);
  const tags = open.tags.map(([t, c]) => `<span class="nt-tag" style="background:${c}">${t}</span>`).join("");
  return `<div class="nt">${notesSide(open.id)}
    <section class="nt-main">
      <div class="nt-top"><span class="crumb">🗒️ Deal notes</span><span class="crumb">/</span><span>${open.icon} ${esc(open.title)}</span><span class="grow"></span>
        <span class="crumb" style="font-size:13px">Edited ${open.when.replace(", 2026", "")}</span>
        <button class="tb">Share</button><button class="tb" aria-label="Comments">💬</button><button class="tb" aria-label="Favorite">☆</button><button class="tb" data-more aria-label="More">•••</button></div>
      <div class="nt-page"><div class="nt-cover"></div><div class="nt-doc">
        <div class="nt-icon">${open.icon}</div><h1>${esc(open.title)}</h1>
        <dl class="nt-props">
          <dt>↗ Company</dt><dd>${open.company ? `<span class="nt-rel">🏢 ${esc(open.company)}</span>` : '<span style="color:#c7c6c4">Empty</span>'}</dd>
          <dt>◷ Date</dt><dd>${open.when}</dd>
          <dt>≡ Type</dt><dd>${tags}</dd>
          <dt>◎ Status</dt><dd>${open.company ? '<span class="nt-status"><i></i>In diligence</span>' : '<span class="nt-status todo"><i></i>To file</span>'}</dd>
          <dt>👤 Owner</dt><dd>${avatar(ME.name)}${ME.name}</dd>
        </dl>
        <div class="nt-comment">${avatar(ME.name)}<span>Add a comment…</span></div>
        <div class="nt-body">${noteHtml(text)}</div>
        <div class="nt-back">${open.company ? `↙ 2 backlinks · <u>Pipeline</u>, <u>Weekly partner sync</u>` : "↙ No backlinks"}</div>
      </div></div>
    </section></div>`;
}

function notesHome() {
  const real = NOTES.map((n) => [n.icon, n.title, n.company, n.tags[0][0], n.when, ME.name, `#notes/${n.id}`]);
  const rows = [...real, ...NOTE_ROWS].sort((a, b) => new Date(b[4]) - new Date(a[4])).map(([icon, title, co, type, when, owner, href]) => `
    <tr ${href ? `data-href="${href}"` : ""}><td class="nm"><span>${icon}</span><b>${esc(title)}</b>${href ? '<span class="open">OPEN</span>' : ""}</td>
      <td>${co ? `<span class="nt-rel">🏢 ${esc(co)}</span>` : ""}</td>
      <td><span class="nt-tag" style="background:${TYPE_COLORS[type] || "#e3e2e0"}">${type}</span></td>
      <td>${when.replace(", 2026", "")}</td><td class="ow">${avatar(owner)}${esc(owner)}</td></tr>`).join("");
  return `<div class="nt">${notesSide(null)}
    <section class="nt-main">
      <div class="nt-top"><span>🗒️ Deal notes</span><span class="grow"></span><span class="crumb" style="font-size:13px">Edited Oct 9</span><button class="tb">Share</button><button class="tb">☆</button><button class="tb">•••</button></div>
      <div class="nt-page"><div class="nt-db">
        <div class="nt-icon" style="margin-top:28px;font-size:56px">🗒️</div><h1>Deal notes</h1>
        <p class="nt-desc">Every call, meeting and hallway note, linked to its company. Use the Call template for anything with a founder.</p>
        <div class="nt-views"><span class="on">▦ All notes</span><span>⊞ By company</span><span>📞 Calls</span><span class="grow"></span><span>Filter</span><span>Sort</span><span>🔍</span><b class="nt-new">New ⌄</b></div>
        <table class="nt-table"><thead><tr><th>Aa Name</th><th>↗ Company</th><th>≡ Type</th><th>◷ Date</th><th>👤 Owner</th></tr></thead>
          <tbody>${rows}<tr class="add"><td colspan="5">+ New page</td></tr></tbody></table>
        <div class="nt-count">COUNT <b>${real.length + NOTE_ROWS.length}</b></div>
      </div></div>
    </section></div>`;
}

function notesWire(id) {
  document.querySelectorAll("tr[data-href]").forEach((r) => (r.onclick = () => (location.hash = r.dataset.href)));
  const open = NOTES.find((n) => n.id === id);
  const more = $("[data-more]");
  if (open && more) more.onclick = async (e) => {
    e.stopPropagation();
    const text = await load(open.file);
    menu(more, [["Copy page text", () => copy(text, "Page text copied")], ["Export as .txt", () => download(open.file, `${open.title}.txt`)]]);
  };
}

/* ───────────── CRM ───────────── */
const pill = (stage) => `<span class="crm-pill" style="background:${STAGE_COLORS[stage][0]};color:${STAGE_COLORS[stage][1]}">${stage}</span>`;
const logo = (nm) => `<span class="lg" style="background:${hue(nm)}">${nm[0]}</span>`;
const strength = (n) => `<span class="crm-str" title="Relationship strength">${[1, 2, 3, 4].map((i) => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span>`;

function crmView(view) {
  const board = view === "board";
  let body;
  if (board) {
    const stages = Object.keys(STAGE_COLORS);
    body = `<div class="crm-board">${stages.map((st) => {
      const deals = DEALS.filter((d) => d[2] === st);
      return `<div class="crm-col"><h3><i style="background:${STAGE_COLORS[st][1]}"></i>${st}<span>${deals.length}</span></h3>
      ${deals.map(([nm, ds, , owner, , last, , , round, href]) => `<a class="crm-card" ${href ? `href="${href}"` : ""}>
        <div class="nm">${logo(nm)}${esc(nm)}</div><div class="desc">${esc(ds)}</div>
        <div class="ft"><span>${round ? `<span class="round">${round}</span> ` : ""}Last touch ${last}</span>${avatar(owner)}</div></a>`).join("")}</div>`;
    }).join("")}</div>`;
  } else {
    body = `<div class="crm-tablewrap"><table class="crm-table"><thead><tr><th><span class="cb"></span></th><th>Organization</th><th>Stage</th><th>Owner</th><th>Source</th><th>Last email</th><th>Next step</th><th>Round</th><th>Strength</th></tr></thead><tbody>
      ${DEALS.map(([nm, ds, st, owner, src, last, next, str, round, href]) => `<tr ${href ? `data-href="${href}"` : ""}>
        <td><span class="cb"></span></td><td><div class="org">${logo(nm)}<div><b>${esc(nm)}</b><small>${esc(ds)}</small></div></div></td>
        <td>${pill(st)}</td><td><span class="own">${avatar(owner)}${esc(owner)}</span></td><td>${esc(src)}</td><td>${last}</td><td>${esc(next)}</td>
        <td>${round ? `<span class="round">${round}</span>` : '<span class="nil">-</span>'}</td><td>${strength(str)}</td></tr>`).join("")}
      </tbody></table></div>`;
  }
  return `<div class="crm">
    <aside class="crm-side"><div class="brand"><i></i>Relate</div>
      <div class="crm-search">Search people, orgs…<kbd>⌘K</kbd></div>
      <a>Home</a><a>Inbox<span class="cnt">3</span></a><a>Notes</a><a>Reminders<span class="cnt">2</span></a>
      <h6>Lists</h6><a class="on">Deal pipeline</a><a>Portfolio</a><a>Co-investors</a><a>LPs</a><a>Talent</a>
      <h6>Insights</h6><a>Relationship strength</a><a>Introductions</a><a>Network map</a>
      <div class="crm-me">${avatar(ME.name)}<div><b>${ME.name}</b><small>${ME.fund}</small></div></div></aside>
    <section class="crm-main">
      <div class="crm-head"><h1>Deal pipeline</h1><span class="crm-sub">${DEALS.length} organizations · updated 4 min ago</span><span class="grow"></span>
        <button class="ds-btn">Share</button><button class="ds-btn">Export</button><button class="ds-btn pri">+ Add organization</button></div>
      <div class="crm-views"><a href="#crm" class="${board ? "" : "on"}">▤ Table</a><a href="#crm/board" class="${board ? "on" : ""}">▥ Board</a><span>◫ Map</span><span>+ New view</span></div>
      <div class="crm-filters"><span class="chip">Stage: All ⌄</span><span class="chip">Owner: Anyone ⌄</span><span class="chip">Round ⌄</span><span class="chip ghost">+ Filter</span><span class="grow"></span><span class="sort">Sorted by Last email ↓</span></div>
      ${body}</section></div>`;
}
function crmWire() {
  document.querySelectorAll(".crm-table tr[data-href]").forEach((r) => (r.onclick = () => (location.hash = r.dataset.href)));
}

/* ───────────── Founder portal ───────────── */
function portalView() {
  const bars = [38, 45, 52, 58, 66, 74, 82, 88, 93, 100];
  const months = ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  const W = 640, H = 200, bw = 40, gap = (W - bars.length * bw) / (bars.length - 1);
  const chart = bars.map((h, i) => {
    const x = i * (bw + gap), y = H - (h / 100) * (H - 10);
    return `<rect x="${x}" y="${y}" width="${bw}" height="${H - y}" rx="4" fill="${i === bars.length - 1 ? "#4f46e5" : "#c7c9f9"}"/>
      <text x="${x + bw / 2}" y="${H + 18}" text-anchor="middle" font-size="11" fill="#6b7280">${months[i]}</text>`;
  }).join("");
  const doc = (kind, color, name, meta, href, dl) => `<a class="pt-doc" ${href ? `href="${href}"` : ""} ${dl ? `download="${dl}"` : ""}><i style="background:${color}">${kind}</i><div><b>${name}</b><small>${meta}</small></div><span>${ic("dl")}</span></a>`;
  return `<div class="pt">
    <aside class="pt-nav"><div class="pt-co"><span class="lg">A</span><div><b>Acme AI</b><small>Investor portal</small></div></div>
      <a class="on">${ic("inbox")}Overview</a><a>${ic("mail")}Updates<span class="cnt">1</span></a><a>${ic("refresh")}Metrics</a><a>${ic("file")}Documents</a><a>${ic("people")}Cap table</a>
      <div class="pt-navfoot">Shared with<br><b>${ME.fund}</b><br><span>Viewer access</span></div></aside>
    <main class="pt-main">
    <header class="pt-top"><span style="color:#5b6170">Overview</span><span class="grow"></span><span class="pt-live"><i></i>Synced from billing and HRIS</span>${avatar(ME.name)}</header>
    <div class="pt-wrap">
      <section id="dashboard">
      <div class="pt-h"><div><h1>Acme AI · Investor dashboard</h1><div class="sub">As of Sep 30, 2026 · Shared with ${ME.fund}</div></div>
        <a class="ds-btn" href="${S}05_acme_dashboard_screenshot.png" download="Acme AI dashboard.png">${ic("dl")}Export PNG</a></div>
      <div class="pt-kpis">
        <div class="pt-kpi"><span>ARR</span><b>$2.6M</b><em>▲ 8% MoM</em></div>
        <div class="pt-kpi"><span>MoM growth</span><b>8%</b></div>
        <div class="pt-kpi"><span>Employees</span><b>21</b></div>
        <div class="pt-kpi"><span>Logos</span><b style="font-size:22px;margin-top:12px">Globex, Hooli</b></div></div>
      <div class="pt-grid">
        <div class="pt-card"><h3>ARR, last 10 months</h3><svg viewBox="0 0 ${W} ${H + 24}" role="img" aria-label="ARR growing each month to $2.6M in September">${chart}</svg></div>
        <div class="pt-card"><h3>Customers</h3><ul class="pt-cust">
          <li><span class="av" style="background:#0f766e;width:28px;height:28px;font-size:12px">G</span>Globex<span class="st">Live</span></li>
          <li><span class="av" style="background:#b45309;width:28px;height:28px;font-size:12px">H</span>Hooli<span class="st">Live</span></li></ul></div></div>
      </section>
      <div class="pt-grid" style="margin-top:0">
        <div class="pt-card pt-post">
          <div class="pt-ph">${avatar("Jane Founder", "lg")}<div><b>Jane Founder</b><small>CEO · posted Oct 1 · September update</small></div><span class="pt-tag">Monthly update</span></div>
          <h3 style="margin:14px 0 8px">September: second warehouse live at Globex</h3>
          <p>Hi everyone, a short one this month. The big moment was Globex turning on Acme in their second building, which went live without a single escalation from the floor team. We also shipped plain-English explanations for every suggested change, which supervisors have asked for since day one.</p>
          <p>On the team side we welcomed two engineers, and we're starting to prepare for the Series A conversations in November.</p>
          <p><b>Where you can help:</b> intros to operations leaders at mid-market retailers, and to anyone who has scaled a customer success team in Europe.</p>
          <div class="pt-react"><span>👏 6</span><span>🚀 3</span><span>💬 2 comments</span></div>
        </div>
        <div class="pt-card"><h3>Documents</h3>
          ${doc("PPT", "#d24726", "Q3 board update", "Board · Oct 8", "#decks/board")}
          ${doc("PDF", "#ea4335", "Company deck", "Fundraising · Oct 9", "#decks/acme")}
          ${doc("XLS", "#188038", "September financials", "Finance · Oct 1")}
          ${doc("DIR", "#5f6368", "Data room", "Access on request")}
        </div></div>
    </div></main></div>`;
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
        <div class="src"><span class="fav" style="background:${open.color}">${open.pub[0]}</span>${esc(open.pub)} · 1 min read</div>
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
  mail: { name: "Mail", view: mailView, wire: mailWire,
    title: () => `Inbox (${MAIL.filter((m) => m.unread).length}) - ${ME.addr}`,
    icon: tile("#1a73e8", '<rect x="10" y="14" width="28" height="20" rx="3" fill="#fff"/><path d="M11 16l13 9 13-9" stroke="#1a73e8" stroke-width="2.4" fill="none" stroke-linejoin="round"/>') },
  decks: { name: "Files", view: decksView, wire: decksWire,
    title: (id) => `${DECKS[id]?.title || "Shared with me"} - Files`,
    icon: tile("#fff", '<rect x=".5" y=".5" width="47" height="47" rx="10.5" fill="none" stroke="#ddd"/><path d="M10 16a3 3 0 0 1 3-3h7l3 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3z" fill="#f4b400"/><path d="M10 20h28v11a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3z" fill="#fbc934"/>') },
  notes: { name: "Notes", view: notesView, wire: notesWire,
    title: (id) => NOTES.find((n) => n.id === id)?.title || "Deal notes",
    icon: tile("#fff", '<rect x=".5" y=".5" width="47" height="47" rx="10.5" fill="none" stroke="#ddd"/><path d="M14 12h16l6 6v18H14z" fill="#fff" stroke="#111" stroke-width="2.4" stroke-linejoin="round"/><path d="M19 21h12M19 26h12M19 31h8" stroke="#111" stroke-width="2.2" stroke-linecap="round"/>') },
  crm: { name: "CRM", view: crmView, wire: crmWire, title: () => "Deal pipeline · Relate",
    icon: tile("#1b1f3b", '<circle cx="18" cy="20" r="5" fill="#7c5cff"/><circle cx="31" cy="18" r="4" fill="#3cc4ff"/><circle cx="27" cy="31" r="6" fill="#fff"/><path d="M18 20l13-2-4 13z" stroke="#fff" stroke-width="1.5" fill="none" opacity=".6"/>') },
  portal: { name: "Acme AI portal", view: portalView, title: () => "Acme AI · Investor dashboard",
    icon: tile("#111827", '<path d="M12 34h24" stroke="#555" stroke-width="2"/><rect x="14" y="24" width="5" height="10" rx="1" fill="#818cf8"/><rect x="21.5" y="19" width="5" height="15" rx="1" fill="#a5b4fc"/><rect x="29" y="13" width="5" height="21" rx="1" fill="#4f46e5"/>') },
  saved: { name: "Saved", view: savedView, wire: savedWire,
    title: (id) => `${(CLIPS.find((c) => c.id === id) || CLIPS[0]).title} · Saved`,
    icon: tile("#ef4056", '<path d="M15 12h18v24l-9-6-9 6z" fill="#fff"/>') },
};
APPS.press = APPS.saved; // old links

const keys = { on: null };
document.addEventListener("keydown", (e) => keys.on?.(e));

function dock(active) {
  $("#dock").innerHTML = Object.entries(APPS).filter(([k]) => k !== "press").map(([k, a]) =>
    `<a href="#${k}" class="${k === active ? "on" : ""}" aria-label="${a.name}">${a.icon}<span>${a.name}</span></a>`).join("");
}

async function route() {
  let [app, ...rest] = (location.hash.slice(1) || "mail").split("/");
  if (!APPS[app]) app = "mail";
  if (app === "press") app = "saved";
  const a = APPS[app];
  keys.on = null;
  $("#app").innerHTML = await a.view(...rest);
  a.wire?.(...rest);
  document.title = a.title(...rest);
  $("#favicon").href = "data:image/svg+xml," + encodeURIComponent(a.icon.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" '));
  dock(app);
}

window.addEventListener("hashchange", route);
route();
