import { snapshotBatch } from "./state.js";

const API_URL = "https://1e9c-107-115-29-1.ngrok-free.app";

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
  const result = await response.text();
  console.log({ result });
  return result;
}
