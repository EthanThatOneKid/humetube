/**
 * parseVideoID parses a YouTube video ID from a URL string.
 */
export function parseVideoID(urlString) {
  const url = new URL(urlString);
  if (
    (url.hostname === "www.youtube.com" || url.hostname === "youtube.com") &&
    url.pathname === "/watch"
  ) {
    return url.searchParams.get("v");
  }

  return null;
}
