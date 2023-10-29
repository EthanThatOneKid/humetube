import { ulid } from "humetube/deps.ts";
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
    // Check the snapshots.
    if (request.snapshots.some((s) => !s.videoID || !s.currentTimestamp)) {
      throw new Error(`Invalid snapshots: ${JSON.stringify(request)}`);
    }

    // Create Hume job from ingested snapshots.
    const blobs: Blob[] = [];
    for (const s of request.snapshots) {
      const blob = await fetch(s.dataURI).then((response) => response.blob());
      blobs.push(blob);
    }

    // Create the Hume job.
    const result = await this.api.createJob(blobs);

    // Store snapshots by ingestion ID.
    const commit = await this.kv.set(
      [KvPrefix.SNAPSHOTS, result.jobID],
      {
        snapshots: request.snapshots.map((s) => ({
          videoID: s.videoID,
          timestamp: s.currentTimestamp,
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
    const snapshotsResult = await this.kv.get<{ snapshots: Snapshot[] }>(
      makeSnapshotKey(ingestionID),
    );
    if (!snapshotsResult.value) {
      throw new Error("Failed to get snapshots by ingestion ID.");
    }

    if (request.predictions.length !== snapshotsResult.value.snapshots.length) {
      throw new Error(
        "Number of predictions does not match number of snapshots.",
      );
    }

    // Store predictions by video ID.
    const result: Prediction[] = [];
    for (let i = 0; i < request.predictions.length; i++) {
      const snapshot = snapshotsResult.value.snapshots[i];
      const snapshotPredictions = request.predictions[i];
      for (const predictionResult of snapshotPredictions.results.predictions) {
        for (
          const groupedPrediction of predictionResult.models.face
            .grouped_predictions
        ) {
          for (const prediction of groupedPrediction.predictions) {
            const topEmotion = prediction.emotions
              .reduce((a, b) => a.score > b.score ? a : b);

            result.push({
              videoID: snapshot.videoID,
              timestamp: snapshot.timestamp,
              emotion: topEmotion.name,
              confidence: topEmotion.score,
            });
          }
        }
      }

      // Store predictions by video ID.
      const commit = await this.kv.set(
        makePredictionKey(snapshot.videoID, snapshot.timestamp),
        result,
      );
      if (!commit.ok) {
        throw new Error("Failed to store predictions.");
      }
    }

    return { success: true };
  }

  public async analyze(request: AnalyzeRequest): Promise<AnalyzeResult> {
    const it = await this.kv.list({
      prefix: [KvPrefix.PREDICTIONS, request.videoID],
    });
    for await (const prediction of it) {
      console.log({ prediction });
    }

    return { success: true };
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

interface Snapshot {
  videoID: string;
  timestamp: number;
}

function makeSnapshotKey(ingestionID: string): Deno.KvKey {
  return [KvPrefix.SNAPSHOTS, ingestionID];
}

interface Prediction {
  videoID: string;
  timestamp: number;
  emotion: string;
  confidence: number;
}

function makePredictionKey(videoID: string, timestamp: number): Deno.KvKey {
  return [KvPrefix.PREDICTIONS, videoID, ulid(timestamp)];
}

interface Analysis {
  videoID: string;
  timestamp: number;
  emotion: string;
}

function makeAnalysisKey(videoID: string): Deno.KvKey {
  return [KvPrefix.ANALYSES, videoID];
}
