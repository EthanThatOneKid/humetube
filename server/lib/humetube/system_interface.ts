import type { EmotionName, GetJobResult } from "humetube/lib/hume/api.ts";

// TODO: Implement system interface in Postgres, deploy on CockroachDB serverless.
// Reference: <https://orm.drizzle.team/docs/overview>.

/**
 * SystemInterface is the HumeTube pipeline system interface.
 */
export interface SystemInterface {
  /**
   * ingestSnapshots captures a batch of emotional data from the user.
   */
  ingestSnapshots(r: IngestSnapshotsRequest): Promise<IngestSnapshotsResult>;

  /**
   * ingestPredictions captures a batch of emotional predictions from Hume.
   */
  ingestPredictions(
    r: IngestPredictionsRequest,
  ): Promise<IngestPredictionsResult>;

  /**
   * analyze analyzes emotional data.
   */
  analyze(r: AnalyzeRequest): Promise<AnalyzeResult>;

  /**
   * getAnalysis gets the latest emotional analysis by video ID.
   */
  getAnalysis(r: GetAnalysisRequest): Promise<GetAnalysisResult>;
}

export interface IngestSnapshotsRequest {
  /**
   * snapshots capture the emotions of the user during a YouTube video segment.
   *
   * No more than 10 320x240 photos is recommended to keep the round-trip time on the low side.
   */
  snapshots: {
    dataURI: string;
    currentTimestamp: number;
    videoID: string;
    // TODO: Consider adding regional language.
  }[];
}

export interface IngestSnapshotsResult {
  /**
   * ingestionID is the ID of the ingestion job. This ID is a Hume job ID.
   */
  ingestionID: string;
}

export type IngestPredictionsRequest = GetJobResult;

export interface IngestPredictionsResult {
  /**
   * videoIDs are the video IDs of the ingested predictions.
   */
  videoIDs: string[];
}

export interface AnalyzeRequest {
  videoID: string;
}

export interface AnalyzeResult {
  success: boolean;
}

export interface GetAnalysisRequest {
  videoID: string;
}

export interface GetAnalysisResult {
  /**
   * lastUpdatedAt is the UTC timestamp of the last time the analysis was updated.
   */
  lastUpdatedAt: number;

  /**
   * snapshotsAnalyzed is the number of snapshots analyzed.
   */
  snapshotsAnalyzed: number;

  /**
   * emotions are a list of collected human emotions.
   */
  emotions: {
    /**
     * timestamp is the moment the YouTube video which evokes a human emotion.
     */
    timestamp: number;

    /**
     * amplitude is the average intensity of the emotion.
     *
     *  This value is a float between 0 and 1.
     */
    amplitude: number;

    /**
     * name is the name of the evoked emotion.
     *
     * Reference: <https://dev.hume.ai/docs/emotions>.
     */
    name: EmotionName;

    /**
     * emoji is the emoji string associated with the emotion name.
     */
    emoji: string;
  }[];
}
