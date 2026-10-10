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

function sendFile(f) {
  const form = new FormData(); form.append("file", f); start(form);
}

health();
// ?sample=1 runs the fictional Acme deck immediately (demo links, smoke tests).
if (new URLSearchParams(location.search).has("sample")) $("sample").click();
