let backgroundState = {
  intervalID: null,
  activeTabID: null,
  currentTimestamp: null,
  videoID: null,
  dataURI: null,
};

const snapshots = [];

export function getState() {
  return backgroundState;
}

export function updateState(newBackgroundState) {
  backgroundState = typeof state === "function"
    ? newBackgroundState(backgroundState)
    : newBackgroundState;
}

export function stashSnapshot() {
  snapshots.push({ ...backgroundState });
}

/**
 * snapshotBatch returns all the snapshots taken since the last time this
 * function was called and empties the snapshot queue.
 */
export function snapshotBatch() {
  return snapshots.splice(0, snapshots.length);
}
