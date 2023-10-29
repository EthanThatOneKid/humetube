import { parseVideoID } from "./lib/youtube/index.js";
import { createInterval, getState, updateState } from "./lib/humetube/index.js";

const recordingEnabled = true;

// https://stackoverflow.com/a/11598753
chrome.runtime.onInstalled.addListener(async () => {
  for (const contentScript of chrome.runtime.getManifest().content_scripts) {
    for (const tab of await chrome.tabs.query({ url: contentScript.matches })) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: contentScript.js,
      });
    }
  }
});

chrome.tabs.onActivated.addListener(syncWithContentScriptasync);
chrome.tabs.onCreated.addListener(syncWithContentScriptasync);
chrome.tabs.onUpdated.addListener(syncWithContentScriptasync);
chrome.webNavigation.onCompleted.addListener(syncWithContentScriptasync);

async function syncWithContentScriptasync(info) {
  // When the user navigates to a non-YouTube page, clear the interval.
  const tabID = info.tabId;
  const tab = await chrome.tabs.get(tabID);
  const videoID = parseVideoID(tab.url);
  if (!videoID) {
    return;
  }

  // Try to render the emotions timeline.
  fetch(`https://humetube.deno.dev/emotions/${videoID}`)
    .then(async (response) => {
      if (!response.ok) {
        return;
      }

      // Parse the JSON data.
      const data = await response.json();
      if (data.emotions.length === 0) {
        return;
      }

      sendDataToContentScript(tabID, data);
    });

  if (recordingEnabled) {
    const state = getState();
    if (!videoID) {
      clearInterval(state.intervalID);
      state.activeTabID = null;
      state.intervalID = null;
      updateState(state);
      // TODO: Ingest stashed data via ingest().
      return;
    }

    // When the user navigates to a YouTube page, update the tab ID and video ID.
    state.videoID = videoID;
    state.activeTabID = info.tabId;

    // If the interval is not already running, start it.
    if (!state.intervalID) {
      state.intervalID = createInterval();
    }

    // Update the state.
    updateState(state);
  }
}

function sendDataToContentScript(tabID, data) {
  chrome.tabs.sendMessage(tabID, {
    action: "renderEmotionsTimeline",
    data,
  });
}
