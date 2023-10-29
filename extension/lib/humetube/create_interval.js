import { getState, stashSnapshot, updateState } from "./state.js";
import { ingest } from "./ingest.js";

/**
 * createInterval creates an interval that intermittently gets the current
 * YouTube timestamp string from the active tab.
 */
export function createInterval() {
  const timesPerSecond = 0.1; // 1.2;
  const interval = 1_000 / timesPerSecond;
  const batchEvery = 1;
  let intervalCount = 0;
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

    if (intervalCount % batchEvery === 0) {
      ingest();
    }

    intervalCount++;
  }, interval);
}

function handleContentMessage(response) {
  // Update the current timestamp if it has changed.
  if (!response || typeof response.contentTimestamp !== "number") {
    return;
  }

  const timestamp = Math.floor(response.contentTimestamp);
  const state = getState();
  if (state.currentTimestamp !== timestamp) {
    state.currentTimestamp = timestamp;
    state.dataURI = response.dataURI;
    updateState(state);
    console.log({ state }); // TODO: Remove this!
    stashSnapshot();
  }
}
