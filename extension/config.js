// Where the VentureSauce panel (frontend/) is served. The side panel loads
// APP_URL + "/panel" in an iframe. Reload the extension after changing this file.
// Shared team build (Cloudflare quick tunnel from Kevin's laptop; the URL changes when the tunnel restarts).
export const APP_URL = "https://spears-greeting-oklahoma-industrial.trycloudflare.com";
// LOCAL: export const APP_URL = "http://localhost:3000";

// true: the panel follows the active tab and reloads when its site changes.
// false: the panel loads once and stays put. Use this for a drag-and-drop demo,
// because a reload wipes a drop or upload that is still in progress.
export const FOLLOW_TABS = true;

// How long to wait for the panel before showing the "can't reach" view.
export const LOAD_TIMEOUT_MS = 8000;
