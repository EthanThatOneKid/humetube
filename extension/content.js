const width = 320; // We will scale the photo width to this
let height = NaN; // This will be computed based on the input stream
let contentTimestamp = null;
let streaming = false;

setup();

async function setup() {
  // Set up expression recording.
  const mediaCaptureElements = await createMediaCaptureElements();
  if (mediaCaptureElements !== undefined) {
    for (const el of mediaCaptureElements) {
      document.body.appendChild(el);
    }
  }

  // Establish connection with background script.
  chrome.runtime.onMessage.addListener(handleBackgroundMessage);
}

function handleBackgroundMessage(request, sender, sendResponse) {
  if (request.action !== "getPageData") {
    return;
  }

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
  let dataURI = null;
  const canvas = document.querySelector(".humetube-camera-canvas");
  const video = document.querySelector(".humetube-camera-video");
  console.log({
    width,
    height,
    canvas,
    video,
  });
  if (width && height && canvas && video) {
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(video, 0, 0, width, height);

    dataURI = canvas.toDataURL("image/png");
    console.log("Updated dataURI"); // TODO: Remove this.
  }

  return { contentTimestamp, dataURI };
}

async function createMediaCaptureElements() {
  if (document.querySelector(".humetube-camera-video")) {
    return;
  }

  const video = document.createElement("video");
  video.classList.add("humetube-camera-video");
  video.style.display = "none";

  // Set up timestamp recording.
  video.addEventListener("timeupdate", () => {
    contentTimestamp = video.currentTime;
  });

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
      console.log({ video, stream }); // TODO: Remove this.
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
        streaming = true;
      }
    },
    false,
  );

  return [video, canvas];
}
