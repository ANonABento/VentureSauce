import { APP_URL, FOLLOW_TABS, LOAD_TIMEOUT_MS } from "./config.js";

const BASE = APP_URL.replace(/\/+$/, "");
const frame = document.getElementById("panel");

document.getElementById("app-url").textContent = BASE;

let windowId; // the browser window this side panel belongs to
let loadedSite = null; // site key the frame was last pointed at
let attempt = 0; // lets a newer load supersede a slower, older one
let awaitingLoad = false;
let loadTimer;

/** "loading" | "error" | "ready" (see sidepanel.css). */
function show(view) {
  document.body.dataset.view = view;
}

/**
 * The tab's URL if it is an ordinary web page, otherwise null. Null covers
 * chrome://, chrome-extension://, edge://, about:, file://, view-source:,
 * devtools:, the Chrome Web Store, an empty or missing URL, and the panel's
 * own site: for all of these the panel opens on the inbox.
 */
function webPage(tabUrl) {
  let url;
  try {
    url = new URL(tabUrl);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (url.hostname === "chromewebstore.google.com") return null;
  if (url.hostname === "chrome.google.com" && url.pathname.startsWith("/webstore")) return null;
  if (url.origin === new URL(BASE).origin) return null;
  return url;
}

/** Pages on one site share a key; every non-web page shares the empty key. */
function siteKey(url) {
  return url ? url.hostname.replace(/^www\./, "") : "";
}

function panelSrc(url) {
  return url ? `${BASE}/panel?url=${encodeURIComponent(url.href)}` : `${BASE}/panel`;
}

// Any path on the frontend proves it is up. /panel itself is avoided: its
// response carries Link preload headers for the fonts, which Chrome would then
// fetch from this page and log as three CORS errors.
const PROBE_PATH = "/favicon.ico";

/**
 * A refused connection still fires "load" on the frame (Chrome's error page),
 * so check that the frontend answers before pointing the frame at it. The
 * response is opaque (no-cors); any answer, even a 404, means it is reachable.
 */
async function reachable(signal) {
  try {
    await fetch(BASE + PROBE_PATH, { mode: "no-cors", cache: "no-store", signal });
    return true;
  } catch {
    return false;
  }
}

async function load(src) {
  const mine = ++attempt;
  const probe = new AbortController();

  show("loading");
  awaitingLoad = false;
  clearTimeout(loadTimer);
  // One timer covers the probe and the frame load.
  loadTimer = setTimeout(() => {
    if (mine !== attempt) return;
    probe.abort();
    show("error");
  }, LOAD_TIMEOUT_MS);

  const ok = await reachable(probe.signal);
  if (mine !== attempt) return;
  if (!ok) {
    clearTimeout(loadTimer);
    show("error");
    return;
  }

  awaitingLoad = true;
  frame.src = src;
}

frame.addEventListener("load", () => {
  // Ignore the initial about:blank and navigations made inside the panel.
  if (!awaitingLoad) return;
  awaitingLoad = false;
  clearTimeout(loadTimer);
  show("ready");
});

/** Point the panel at a tab. Reloads only when the site changes, unless forced. */
function follow(tab, { force = false } = {}) {
  // A tab that is still opening has its address in pendingUrl.
  const url = webPage(tab?.url || tab?.pendingUrl);
  const site = siteKey(url);
  if (!force && site === loadedSite) return;
  loadedSite = site;
  load(panelSrc(url));
}

async function activeTab() {
  const [tab] = await chrome.tabs.query(
    windowId === undefined ? { active: true, currentWindow: true } : { active: true, windowId },
  );
  return tab;
}

async function reload() {
  try {
    follow(await activeTab(), { force: true });
  } catch (error) {
    console.warn("VentureSauce: could not read the active tab", error);
    follow(undefined, { force: true });
  }
}

function followTabs() {
  chrome.tabs.onActivated.addListener(async (info) => {
    if (info.windowId !== windowId) return;
    try {
      follow(await chrome.tabs.get(info.tabId));
    } catch {
      // The tab closed before it could be read.
    }
  });

  chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
    if (tab.windowId !== windowId || !tab.active) return;
    if (change.url || change.status === "complete") follow(tab);
  });
}

async function init() {
  document.getElementById("retry").addEventListener("click", reload);

  try {
    const tab = await activeTab();
    windowId = tab?.windowId ?? (await chrome.windows.getCurrent()).id;
    if (FOLLOW_TABS) followTabs();
    follow(tab, { force: true });
  } catch (error) {
    console.warn("VentureSauce: could not read the active tab", error);
    follow(undefined, { force: true });
  }
}

init();
