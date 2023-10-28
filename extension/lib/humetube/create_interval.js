import { getState, updateState } from "./state.js";

/**
 * createInterval creates an interval that intermittently gets the current
 * YouTube timestamp string from the active tab.
 */
export function createInterval() {
  const timesPerSecond = 1;
  const interval = 1_000 / timesPerSecond;
  return setInterval(() => {
    const state = getState();
    if (!state.activeTabID) {
      return;
    }

    chrome.tabs.sendMessage(
      state.activeTabID,
      { channel: "timestamp" },
      (response) => {
        // Update the current timestamp if it has changed.
        if (
          typeof response === "string" && state.currentTimestamp !== response
        ) {
          state.currentTimestamp = response;
          updateState(state);
          console.log({ state });
          // TODO: Take screenshot of their face and bring it via the response as well perhaps.
        }
      },
    );
  }, interval);
}
