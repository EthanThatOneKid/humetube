const width = 320; // We will scale the photo width to this
let height = 0; // This will be computed based on the input stream
let contentTimestamp = null;

setup();

// Establish connection with background script.
chrome.runtime.onMessage.addListener(handleBackgroundMessage);

function setup() {
  // Set up expression recording.
  const mediaCaptureElements = createMediaCaptureElements();
  mediaCaptureElements?.forEach((el) => document.body.appendChild(el));

  // Set up timestamp recording.
  const video = document.querySelector(".video-stream");
  video.addEventListener("timeupdate", () => {
    contentTimestamp = video.currentTime;
  });
}

function handleBackgroundMessage(request, sender, sendResponse) {
  if (request.action !== "getPageData") {
    return;
  }

  console.log("Message received from background script."); // TODO: Remove this.

  const adIsPresent =
    document.querySelector(".ytp-ad-preview-container") !== null;
  if (adIsPresent) {
    console.log("early return"); // TODO: Remove this.
    return;
  }

  const pageData = getPageData();
  console.log({ pageData }); // TODO: Remove this.
  sendResponse(pageData);
}

function getPageData() {
  let recordedEmotion = null;
  if (width && height) {
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);
    recordedEmotion = canvas.toDataURL("image/png");
  }

  return { contentTimestamp, recordedEmotion };
}

async function createMediaCaptureElements() {
  if (document.querySelector(".humetube-camera-video")) {
    return;
  }

  const video = document.createElement("video");
  video.classList.add("humetube-camera-video");
  video.style.display = "none";

  if (document.querySelector(".humetube-camera-canvas")) {
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.classList.add("humetube-camera-canvas");
  canvas.style.display = "none";

  await navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then((stream) => {
      video.srcObject = stream;
      video.play();
    })
    .catch((err) => {
      console.error(`An error occurred: ${err}`);
    });

  video.addEventListener(
    "canplay",
    () => {
      if (!streaming) {
        height = video.videoHeight / (video.videoWidth / width);

        // Firefox currently has a bug where the height can't be read from
        // the video, so we will make assumptions if this happens.

        if (isNaN(height)) {
          height = width / (4 / 3);
        }

        video.setAttribute("width", width);
        video.setAttribute("height", height);
        canvas.setAttribute("width", width);
        canvas.setAttribute("height", height);
      }
    },
    false,
  );

  return [video, canvas];
}