import { getState, updateState } from "./state.js";

/**
 * createInterval creates an interval that intermittently gets the current
 * YouTube timestamp string from the active tab.
 */
export function createInterval() {
  const timesPerSecond = 1.2;
  const interval = 1_000 / timesPerSecond;
  return setInterval(() => {
    const state = getState();
    if (!state.activeTabID) {
      return;
    }

    chrome.tabs.sendMessage(
      state.activeTabID,
      { action: "getPageData" },
    )
      .then(handleContentMessage)
      .catch(console.error);
  }, interval);
}

function handleContentMessage(response) {
  // Update the current timestamp if it has changed.
  if (typeof response.currentTimestamp !== "number") {
    return;
  }

  const timestamp = Math.floor(response.currentTimestamp);
  if (state.currentTimestamp !== timestamp) {
    state.currentTimestamp = timestamp;
    state.recordedEmotion = response.recordedEmotion;
    // Make request to ingestion API sending the recordedEmotion and data.
    updateState(state);
  }
}
