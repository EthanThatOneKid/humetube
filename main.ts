// Run:
// deno run -A main.ts

import "https://deno.land/std@0.204.0/dotenv/load.ts";

const apiKey = Deno.env.get("HUME_API_KEY")!;

getJob();

async function makeJob() {
  const apiUrl = "https://api.hume.ai/v0/batch/jobs";

  // Create a FormData object
  const formData = new FormData();

  // Add the JSON data
  formData.append(
    "json",
    JSON.stringify({ models: { face: {} } }),
  );

  const fileBytes = await Deno.readFile("david_hume.jpeg");
  const fileBlob = new Blob([fileBytes], { type: "image/jpeg" });
  formData.append("file", fileBlob, "david_hume.jpeg");

  // Define the headers
  const headers = new Headers({
    "X-Hume-Api-Key": apiKey,
  });

  // Make the Fetch request
  fetch(apiUrl, {
    method: "POST",
    headers: headers,
    body: formData,
  })
    .then(async (response) => {
      if (response.ok) {
        const data = await response.json();
        console.log(data); // Process the response data here
      } else {
        console.error(`Request failed with status: ${response.status}`);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

async function getJob() {
  const jobId = "97aa51be-bb80-4a9d-9718-0034bf61f1fd";
  const apiUrl = `https://api.hume.ai/v0/batch/jobs/${jobId}/predictions`;

  // Define the headers
  const headers = new Headers({
    "X-Hume-Api-Key": apiKey,
    "accept": "application/json; charset=utf-8",
  });

  // Make the Fetch request
  fetch(apiUrl, {
    method: "GET",
    headers: headers,
  })
    .then(async (response) => {
      if (response.ok) {
        // Read the response data as a Buffer
        const responseData = await response.json();
        diagnoseJob(responseData);
      } else {
        console.error(`Request failed with status: ${response.status}`);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function diagnoseJob(predictionData: any) {
  // Iterate through the prediction data
  for (const prediction of predictionData) {
    console.log("Source:");
    console.log(`Type: ${prediction.source.type}`);
    console.log(`Filename: ${prediction.source.filename}`);
    console.log(`Content Type: ${prediction.source.content_type}`);

    console.log("Results:");
    for (const result of prediction.results.predictions) {
      // If models is an object, you can iterate through its properties as well
      if (typeof result.models === "object") {
        console.log("Models:");
        for (const model in result.models) {
          for (const group of result.models[model]["grouped_predictions"]) {
            for (const prediction of group["predictions"]) {
              let recordHighestConfidence = 0;
              let recordHighestKey = 0;
              for (const emotion of prediction.emotions) {
                if (emotion.score > recordHighestConfidence) {
                  recordHighestConfidence = emotion.score;
                  recordHighestKey = emotion.name;
                }
              }
              console.log(
                `${model}: ${recordHighestKey} ${recordHighestConfidence}`,
              );
            }
          }
        }

        console.log("Errors:");
        for (const error of prediction.results.errors) {
          console.log(error);
        }
      }
    }
  }
}
