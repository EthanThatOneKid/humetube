const width = 320; // We will scale the photo width to this.
let height; // This will be computed based on the input stream.
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

  // Set up timestamp recording.
  document.querySelector(".video-stream").addEventListener(
    "timeupdate",
    (event) => {
      contentTimestamp = event.currentTarget.currentTime;
    },
  );

  // Establish connection with background script.
  chrome.runtime.onMessage.addListener(handleBackgroundMessage);
}

function handleBackgroundMessage(request, sender, sendResponse) {
  switch (request.action) {
    case "getPageData": {
      const isAdPresent =
        document.querySelector(".ytp-ad-preview-container") !== null;
      if (isAdPresent) {
        return;
      }

      const pageData = getPageData();
      sendResponse(pageData);
      break;
    }

    case "renderEmotionsTimeline": {
      renderEmotionsTimeline(request.data);
      break;
    }
  }
}

function getPageData() {
  let dataURI = null;
  const canvas = document.querySelector(".humetube-camera-canvas");
  const video = document.querySelector(".humetube-camera-video");
  height ??= video.videoHeight / (video.videoWidth / width);
  if (width && height && canvas && video) {
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(video, 0, 0, width, height);

    dataURI = canvas.toDataURL("image/jpeg");
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
      console.log({ video, stream });
    })
    .catch((err) => {
      console.error(`An error occurred: ${err}`);
    });

  video.addEventListener(
    "canplay",
    () => {
      if (streaming) {
        return;
      }

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
    },
    false,
  );

  return [video, canvas];
}

function renderEmotionsTimeline(data) {
  if (document.querySelector(".humetube-emotions-timeline")) {
    return;
  }

  // Render the emotions timeline.
  const container = document.createElement("details");
  container.open = true;
  container.classList.add("humetube-emotions-timeline");
  container.style.fontFamily = "Roboto, sans-serif";
  container.style.maxHeight = "400px";
  container.style.width = "400px";
  container.style.border = "1px solid #f1f1f1";
  container.style.borderRadius = "20px";
  container.style.backgroundColor = "#212121";
  container.style.color = "#fff";
  container.style.overflowX = "hidden";
  container.style.position = "relative";
  container.style.backgroundImage = "linear-gradient(#212121, #000000)";

  const summary = document.createElement("summary");
  const title = document.createElement("h2");
  title.textContent = "HumeTube Emotion Classifier";
  title.style.position = "sticky";
  title.style.top = "0";
  title.style.borderRadius = "20px";
  title.style.backgroundColor = "#212121";
  title.style.margin = "0";
  title.style.padding = "15px";
  title.style.fontSize = "20px";
  summary.appendChild(title);

  const box = document.createElement("div");
  box.style.borderRadius = "20px";
  box.style.height = "100%";
  box.style.width = "100%";
  box.style.padding = "6px 0px";

  const table = document.createElement("table");
  table.classList.add("humetube-emotions-table");
  table.style.overflowY = "scroll";
  table.style.width = "100%";
  table.style.padding = "0 15px 0 15px";
  table.style.fontSize = "12px";
  table.style.borderRadius = "8px";

  const footer = document.createElement("h3");
  footer.textContent = "Region (en)";
  footer.style.position = "sticky";
  footer.style.bottom = "0";
  footer.style.borderRadius = "20px";
  footer.style.backgroundColor = "#212121";
  footer.style.padding = "15px";
  footer.style.margin = "0";
  footer.style.fontWeight = "normal";
  footer.style.fontSize = "15px";

  for (const emotion of data.emotions) {
    const row = table.insertRow();
    const cell1 = row.insertCell();
    const cell2 = row.insertCell();
    const cell3 = row.insertCell();
    const cell4 = row.insertCell();

    const anchor = document.createElement("a");
    const url = new URL(window.location.href);
    url.searchParams.set("t", emotion.timestamp);
    anchor.href = url.href;
    anchor.textContent = formatTime(emotion.timestamp);
    cell1.appendChild(anchor);
    cell2.textContent = emotion.name;

    // Create a colored bar to represent emotion intensity
    const intensityBar = document.createElement("div");
    intensityBar.style.width = `${emotion.amplitude * 100}%`;
    intensityBar.style.height = "10px";
    intensityBar.style.backgroundColor = "#263850";
    intensityBar.style.borderRadius = "4px";
    cell3.appendChild(intensityBar);
    cell3.style.width = "100%";

    cell4.style.fontSize = `${emotion.amplitude * 22 + 2}px`;
    cell4.style.textAlign = "center";
    cell4.textContent = emotion.emoji;

    anchor.style.textDecoration = "none";
    anchor.style.color = "#3ea6ff";
    anchor.style.backgroundColor = "#263850";
    anchor.style.borderRadius = "4px";
    anchor.style.padding = "1px 5px";
    anchor.addEventListener("mouseover", () => {
      anchor.style.textDecoration = "underline";
    });
    anchor.addEventListener("mouseout", () => {
      anchor.style.textDecoration = "none";
    });
    cell1.style.paddingTop = "10px";
    cell2.style.paddingTop = "10px";
    cell3.style.paddingTop = "10px";
    cell4.style.paddingTop = "10px";
  }

  container.appendChild(summary);
  box.appendChild(table);
  container.appendChild(box);
  container.appendChild(footer);
  document.querySelector("#secondary-inner").insertAdjacentElement(
    "afterbegin",
    container,
  );
}

function formatTime(seconds) {
  const timeSegments = [];

  // Calculate hours, minutes, and remaining seconds
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;

  // Push segments to the array if they are greater than 0
  if (hours > 0) {
    timeSegments.push(hours);
  }
  if (minutes > 0) {
    timeSegments.push(minutes);
  }
  timeSegments.push(seconds);

  // Convert segments to strings and pad with zeros if necessary
  const formattedSegments = timeSegments.map((segment) => {
    return segment < 10 ? `0${segment}` : `${segment}`;
  });

  return (formattedSegments.length === 1 ? "0:" : "") +
    formattedSegments.join(":");
}
