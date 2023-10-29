import type { GetAnalysisResult } from "humetube/lib/humetube/mod.ts";
import { EMOTIONS } from "humetube/lib/hume/mod.ts";

const EMOTIONS_ARRAY = Object.keys(EMOTIONS);

if (import.meta.main) {
  const amount = Deno.args[0] ? parseInt(Deno.args[0]) : 1;
  const result = makeFakeGetAnalysisResult(amount);
  console.log(JSON.stringify(result));
}

function makeFakeGetAnalysisResult(amount: number): GetAnalysisResult {
  const emotions: GetAnalysisResult["emotions"] = [];
  let timestamp = 0;
  for (let i = 0; i < amount; i++) {
    timestamp += Math.ceil(Math.random() * 3);
    const emotion = makeFakeEmotion(timestamp);
    emotions.push(emotion);
  }

  return { emotions };
}

function makeFakeEmotion(
  timestamp: number,
): GetAnalysisResult["emotions"][number] {
  const randomEmotionIndex = Math.floor(Math.random() * EMOTIONS_ARRAY.length);
  const emotionName =
    EMOTIONS_ARRAY[randomEmotionIndex] as keyof typeof EMOTIONS;
  const emotionEmoji = EMOTIONS[emotionName];
  return {
    timestamp,
    amplitude: Math.random(),
    name: emotionName,
    emoji: emotionEmoji,
  };
}
