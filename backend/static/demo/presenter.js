// Presenter notes for the demo desk: shows the current step of script.js and drives the desk over a BroadcastChannel.
// The desk owns the position; this window asks it to move ({go}) and redraws when it reports where it is ({at}).
"use strict";

const STEPS = window.DEMO_STEPS;
const chan = new BroadcastChannel("venturesauce-demo");
const $ = (id) => document.getElementById(id);
let at = 0, started = 0;
let coreOnly = false;
try { coreOnly = localStorage.getItem("demo-core") === "1"; } catch {}
$("core").checked = coreOnly;

const visible = () => STEPS.map((s, i) => i).filter((i) => !coreOnly || STEPS[i].core);
function move(dir) {
  const list = visible();
  const target = dir > 0 ? list.find((i) => i > at) : list.reverse().find((i) => i < at);
  if (target != null) go(target);
}
function go(i) {
  if (!started) started = Date.now();
  chan.postMessage({ go: i });
}

function draw() {
  const s = STEPS[at];
  const list = visible();
  $("pos").textContent = `Step ${list.indexOf(at) + 1 || "–"} of ${list.length}`;
  $("title").textContent = s.title;
  $("do").textContent = s.do;
  $("say").textContent = s.say;
  const nxt = list.find((i) => i > at);
  $("next").textContent = nxt != null ? `Next: ${STEPS[nxt].title}` : "Last step.";
  $("steps").innerHTML = list.map((i) => `<li class="${i === at ? "on" : ""}${STEPS[i].core ? " star" : ""}"><button data-i="${i}">${STEPS[i].title}</button></li>`).join("");
}
$("steps").onclick = (e) => { const b = e.target.closest("button"); if (b) go(Number(b.dataset.i)); };
$("prev").onclick = () => move(-1);
$("nextBtn").onclick = () => move(1);
$("reset").onclick = () => { started = Date.now(); go(0); };
$("core").onchange = () => {
  coreOnly = $("core").checked;
  try { localStorage.setItem("demo-core", coreOnly ? "1" : "0"); } catch {}
  draw();
};
document.addEventListener("keydown", (e) => {
  if (["PageDown", "ArrowRight", "]", " "].includes(e.key)) { e.preventDefault(); move(1); }
  if (["PageUp", "ArrowLeft", "["].includes(e.key)) { e.preventDefault(); move(-1); }
});

let heard = false;
chan.onmessage = (e) => {
  if (e.data?.at == null) return;
  heard = true;
  $("lost").hidden = true;
  at = e.data.at;
  draw();
};
chan.postMessage({ hello: true });
setTimeout(() => { if (!heard) $("lost").hidden = false; }, 800);

setInterval(() => {
  const sec = started ? Math.floor((Date.now() - started) / 1000) : 0;
  $("clock").textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}, 500);
draw();
