/**
 * parseSeconds converts a YouTube timestamp string into seconds.
 */
export function parseSeconds(timestamp) {
  const segments = timestamp.split(":");
  let seconds = 0;
  let minutes = 0;
  let hours = 0;
  switch (segments.length) {
    case 1: {
      seconds = parseInt(segments[0]);
      break;
    }

    case 2: {
      seconds = parseInt(segments[1]);
      minutes = parseInt(segments[0]);
      break;
    }

    case 3: {
      seconds = parseInt(segments[2]);
      minutes = parseInt(segments[1]);
      hours = parseInt(segments[0]);
      break;
    }

    default: {
      throw new Error(`Invalid timestamp: ${timestamp}`);
    }
  }

  return seconds + (minutes * 60) + (hours * 60 * 60);
}
