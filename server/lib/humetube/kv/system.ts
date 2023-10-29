import type { API } from "humetube/lib/hume/mod.ts";
import type {
  AnalyzeRequest,
  AnalyzeResult,
  GetAnalysisRequest,
  GetAnalysisResult,
  IngestPredictionsRequest,
  IngestPredictionsResult,
  IngestSnapshotsRequest,
  IngestSnapshotsResult,
  SystemInterface,
} from "humetube/lib/humetube/mod.ts";

export class KvSystem implements SystemInterface {
  constructor(
    private readonly api: API,
    private readonly kv: Deno.Kv,
  ) {}

  public async ingestSnapshots(
    request: IngestSnapshotsRequest,
  ): Promise<IngestSnapshotsResult> {
    // Create Hume job from ingested snapshots.
    const blobs: Blob[] = [];
    for (const s of request.snapshots) {
      const blob = await fetch(s.dataURI).then((response) => response.blob());
      blobs.push(blob);
    }

    // Create the Hume job.
    console.log({ blobs });
    const result = await this.api.createJob(blobs);

    // Store snapshots by ingestion ID.
    const commit = await this.kv.set(
      [KvPrefix.SNAPSHOTS, result.jobID],
      {
        snapshots: request.snapshots.map((s) => ({
          videoID: s.videoID,
          timestamp: s.timestamp,
        })),
      },
    );
    if (!commit.ok) {
      throw new Error("Failed to store snapshots.");
    }

    return {
      ingestionID: result.jobID,
    };
  }

  public async ingestPredictions(
    request: IngestPredictionsRequest,
  ): Promise<IngestPredictionsResult> {
    // Get the snapshots by ingestion ID which is in the request.
    const ingestionID = request.job_id;
    const snapshotsResult = await this.kv.get(makeSnapshotKey(ingestionID));
    console.log(
      { ingestionID, snapshotsResult },
      JSON.stringify(request, null, 2),
    );

    // for (const prediction of request.results) {
    //   const ingestionID = prediction.results.predictions;
    // }
    throw new Error("Method not implemented.");
  }

  public async analyze(request: AnalyzeRequest): Promise<AnalyzeResult> {
    throw new Error("Method not implemented.");
  }

  public async getAnalysis(
    request: GetAnalysisRequest,
  ): Promise<GetAnalysisResult> {
    throw new Error("Method not implemented.");
  }
}

/**
 * KvPrefix contains the possible storage prefixes.
 */
export enum KvPrefix {
  SNAPSHOTS = "snapshots",
  PREDICTIONS = "predictions",
  ANALYSES = "analyses",
}

function makeSnapshotKey(ingestionID: string): Deno.KvKey {
  return [KvPrefix.SNAPSHOTS, ingestionID];
}

function makePredictionKey(videoID: string): Deno.KvKey {
  return [KvPrefix.PREDICTIONS, videoID];
}

function makeAnalysisKey(videoID: string): Deno.KvKey {
  return [KvPrefix.ANALYSES, videoID];
}
