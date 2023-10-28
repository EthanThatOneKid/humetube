let backgroundState = {
  intervalID: null,
  activeTabID: null,
  currentTimestamp: null,
  // TODO: Add screenshot of their face in data URI format.
};

export function getState() {
  return backgroundState;
}

export function updateState(newBackgroundState) {
  backgroundState = typeof state === "function"
    ? newBackgroundState(backgroundState)
    : newBackgroundState;
}
