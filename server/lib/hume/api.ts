const DEFAULT_API_URL = "https://api.hume.ai/v0";

/**
 * API is the Hume API client.
 */
export class API {
  constructor(
    private readonly apiKey: string,
    private readonly jobCompleteCallbackURL: string,
    private readonly apiURL = DEFAULT_API_URL,
  ) {}

  public async createJob(
    blobs: Blob[],
  ): Promise<CreateJobResult> {
    // Create a FormData object.
    const formData = new FormData();

    // Add the JSON data.
    formData.append(
      "json",
      JSON.stringify({
        models: { face: {} },
        callback_url: this.jobCompleteCallbackURL,
      }),
    );

    // Append blobs to the FormData object.
    for (const blob of blobs) {
      formData.append("file", blob);
    }

    // Define the headers.
    const headers = new Headers({ "X-Hume-Api-Key": this.apiKey });

    // Make the fetch request.
    const url = makeCreateJobURL(this.apiURL);
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: formData,
    });
    if (response.ok) {
      const data = await response.json();
      return {
        jobID: data.job_id,
      };
    }

    throw new Error("Failed to create Hume job.");
  }

  public async getJob(jobID: string): Promise<GetJobResult> {
    // Define the headers
    const headers = new Headers({
      "X-Hume-Api-Key": this.apiKey,
      "accept": "application/json; charset=utf-8",
    });

    // Make the Fetch request
    const url = makeGetJobURL(jobID, this.apiURL);
    const response = await fetch(url, { headers });
    const results = await response.json();
    console.log({ results });
    throw new Error("Method not implemented.");
  }
}

/**
 * CreateJobResult is the result of a Hume job create request.
 */
export interface CreateJobResult {
  jobID: string;
}

/**
 * GetJobResult is the result of getting a Hume job.
 */
export interface GetJobResult {
  job_id: string;
  status: string;
  predictions: PredictionItem[];
}

/**
 * GetJobsResult is the result of listing Hume jobs.
 */
export interface GetJobsResult {
  jobs: GetJobResult[];
}

interface EmotionPrediction {
  name: string;
  score: number;
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Prediction {
  frame: number;
  time: number;
  prob: number;
  box: Box;
  emotions: EmotionPrediction[];
}

interface GroupedPrediction {
  id: string;
  predictions: Prediction[];
}

interface FaceModel {
  metadata: null;
  grouped_predictions: GroupedPrediction[];
}

interface Models {
  face: FaceModel;
}

interface PredictionItem {
  file: string;
  file_type: string;
  models: Models;
}

function makeCreateJobURL(apiURL = DEFAULT_API_URL) {
  return `${apiURL}/batch/jobs`;
}

function makeGetJobURL(jobID: string, apiURL = DEFAULT_API_URL) {
  return `${apiURL}/batch/jobs/${jobID}/predictions`;
}

/**
 * EmotionName is the valid Hume emotion name.
 *
 * Reference: <https://dev.hume.ai/docs/emotions>.
 */
export type EmotionName = keyof typeof EMOTIONS;

/**
 * EMOTIONS stores the emotion names and emojis of each Hume emotion.
 */
export const EMOTIONS = {
  "Admiration": "😊",
  "Adoration": "😍",
  "Aesthetic": "🎨",
  "Amusement": "😄",
  "Anger": "😡",
  "Annoyance": "😒",
  "Anxiety": "😰",
  "Awe": "😲",
  "Awkwardness": "😳",
  "Boredom": "😴",
  "Calmness": "😌",
  "Concentration": "🧐",
  "Confusion": "😕",
  "Contemplation": "🤔",
  "Contempt": "😏",
  "Contentment": "🙂",
  "Craving": "😋",
  "Desire": "😍",
  "Determination": "💪",
  "Disappointment": "😞",
  "Disapproval": "👎",
  "Disgust": "🤢",
  "Distress": "😫",
  "Doubt": "🤨",
  "Ecstasy": "😆",
  "Embarrassment": "😖",
  "Empathic Pain": "😢",
  "Enthusiasm": "🎉",
  "Entrancement": "😮",
  "Envy": "😠",
  "Excitement": "😃",
  "Fear": "😨",
  "Gratitude": "🙏",
  "Guilt": "😔",
  "Horror": "😱",
  "Interest": "😃",
  "Joy": "😄",
  "Love": "❤️",
  "Nostalgia": "😢",
  "Pain": "😣",
  "Pride": "😊",
  "Realization": "😮",
  "Relief": "😅",
  "Romance": "😘",
  "Sadness": "😥",
  "Sarcasm": "😏",
  "Satisfaction": "😌",
  "Shame": "😳",
  "Surprise (negative)": "😮",
  "Surprise (positive)": "😲",
  "Sympathy": "😢",
  "Tiredness": "😴",
  "Triumph": "🎉",
} as const;
