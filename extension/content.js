chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.channel === "timestamp") {
    const timestamp =
      document.querySelector(".ytp-time-current")?.textContent ?? null;
    sendResponse(timestamp);
  }
});
