import { load } from "humetube/deps.ts";
import { API } from "humetube/lib/hume/mod.ts";
import type { SystemInterface } from "humetube/lib/humetube/mod.ts";
import { KvSystem } from "humetube/lib/humetube/kv/mod.ts";

const MINUTE = 60_000;

await load({ export: true });

const kv = await Deno.openKv();

if (import.meta.main) {
  main();
}

function main() {
  kv.listenQueue(handleQueueEvent);

  Deno.serve(
    {
      onListen({ port }) {
        console.log(`Listening on http://127.0.0.1:${port}`);
      },
    },
    handleRequest,
  );
}

async function handleQueueEvent(event: unknown) {
  const { channel, videoID } = event as { channel: string; videoID: string };
  if (channel === "analyze-predictions") {
    const system = makeSystem();
    const recentAnalysis = await system.getAnalysis({ videoID })
      .catch(() => null);
    if (!recentAnalysis||recentAnalysis.lastUpdatedAt > Date.now() - 10 * MINUTE) {
      return;
    }

    system.analyze({ videoID });
    return;
  }
}

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  if (
    request.method === "POST" &&
    (url.pathname === "/ingest-snapshots" ||
      url.pathname === "/ingest-snapshots/")
  ) {
    return await handleIngestSnapshots(request);
  }

  if (
    request.method === "POST" &&
    (url.pathname === "/ingest-predictions" ||
      url.pathname === "/ingest-predictions/")
  ) {
    return await handleIngestPredictions(request);
  }

  const videoID = new URLPattern({ pathname: "/emotions/:videoID" })
    .exec(url)
    ?.pathname.groups?.videoID ?? "";
  if (request.method === "GET" && videoID) {
    return await handleGetAnalysis(videoID);
  }

  return new Response("Not found", { status: 404 });
}

async function handleIngestSnapshots(request: Request): Promise<Response> {
  const snapshots = await request.json();
  const system = makeSystem();
  const result = await system.ingestSnapshots(snapshots);
  return new Response(JSON.stringify(result), { status: 200 });
}

async function handleIngestPredictions(request: Request): Promise<Response> {
  const predictions = await request.json();
  const system = makeSystem();
  const result = await system.ingestPredictions(predictions);
  for (const videoID of result.videoIDs) {
    // Enqueue analysis of this video in 10 minutes.
    kv.enqueue(
      { channel: "analyze-predictions", videoID },
      { delay: 10 * MINUTE },
    );
  }

  return new Response(JSON.stringify(result), { status: 200 });
}

async function handleGetAnalysis(videoID: string): Promise<Response> {
  const system = makeSystem();
  const result = await system.getAnalysis({ videoID });
  return new Response(JSON.stringify(result), { status: 200 });
}

function makeSystem(
  jobCompleteCallbackURL?: string,
  api?: API,
): SystemInterface {
  const apiURL = Deno.env.get("HUMETUBE_API_URL");
  if (!apiURL) {
    throw new Error("HUMETUBE_API_URL not set.");
  }

  if (!jobCompleteCallbackURL) {
    jobCompleteCallbackURL = `${apiURL}/ingest-predictions`;
  }

  if (!api) {
    const apiKey = Deno.env.get("HUME_API_KEY");
    if (!apiKey) {
      throw new Error("HUME_API_KEY not set.");
    }

    api = new API(
      apiKey,
      jobCompleteCallbackURL,
    );
  }

  return new KvSystem(api, kv);
}
