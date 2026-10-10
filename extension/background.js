// Clicking the toolbar icon opens the side panel. The service worker is
// restarted often, so this is set at top level as well as on install/startup.
function openPanelOnActionClick() {
  try {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => console.warn("VentureSauce: setPanelBehavior failed", error));
  } catch (error) {
    // chrome.sidePanel is missing before Chrome 114.
    console.warn("VentureSauce: side panel API unavailable", error);
  }
}

chrome.runtime.onInstalled.addListener(openPanelOnActionClick);
chrome.runtime.onStartup.addListener(openPanelOnActionClick);
openPanelOnActionClick();
