import { snapshotBatch } from "./state.js";

const API_URL = "https://96f2-2600-387-f-4b10-00-1.ngrok-free.app";

export async function ingest() {
  const snapshots = snapshotBatch();
  if (snapshots.length === 0) {
    return;
  }

  const body = JSON.stringify({ snapshots });
  console.log({ body }); // TODO: Remove this!
  const response = await fetch(
    `${API_URL}/ingest-snapshots`,
    { method: "POST", body },
  );
  const result = await response.json();
  console.log({ result });
  return result;
}
