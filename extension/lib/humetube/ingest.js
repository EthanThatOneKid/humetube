import { snapshotBatch } from "./state.js";

const API_URL = "https://d9fb-199-115-241-199.ngrok-free.app";

export async function ingest() {
  const snapshots = snapshotBatch();
  if (snapshots.length === 0) {
    return;
  }

  const body = JSON.stringify({ snapshots });
  const response = await fetch(
    `${API_URL}/ingest-snapshots`,
    { method: "POST", body },
  );
  const result = await response.text();
  return result;
}
