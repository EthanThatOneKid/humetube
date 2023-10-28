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
  console.log({ response }); // TODO: Remove this. Use recordedEmotion.
  const currentTimestamp = response.currentTimestamp;

  // Update the current timestamp if it has changed.
  if (typeof currentTimestamp !== "number") {
    return;
  }

  const timestamp = Math.floor(currentTimestamp);
  if (state.currentTimestamp !== timestamp) {
    state.currentTimestamp = timestamp;
    // TODO: Take screenshot of their face and bring it via the response as well perhaps.
    updateState(state);
    console.log({ state, timestamp }); // TODO: Remove this.
  }
}
