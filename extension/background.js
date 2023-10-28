import { parseVideoID } from "./lib/youtube/index.js";
import { createInterval, getState, updateState } from "./lib/humetube/index.js";

chrome.tabs.onActivated.addListener(async (info) => {
  // When the user navigates to a non-YouTube page, clear the interval.
  const tabID = info.tabId;
  const tab = await chrome.tabs.get(tabID);
  const videoID = parseVideoID(tab.url);
  const state = getState();
  if (!videoID) {
    clearInterval(state.intervalID);
    state.activeTabID = null;
    state.intervalID = null;
    updateState(state);
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
});
