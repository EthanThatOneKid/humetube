# HumeTube

Browser extension crowd-sourcing [**@YouTube**](https://github.com/youtube)
video reactions with [**@HumeAI**](https://github.com/HumeAI).

Project created for [Cal Hacks 10.0](https://cal-hacks-10.devpost.com/)!

## Inspiration

Our inspiration for this project stemmed primarily from Hume AI. Upon seeing
Hume AI's capabilities of capturing human emotions, we came up with the idea to
analyze human expressions towards YouTube videos. Similarly to YouTube's "most
replayed" analytics, we wanted to have the ability to see the most common
emotion towards certain scenes in videos. For example, if someone was watching a
scary movie on YouTube, they could see when the average person had evoked an
emotion of fear during the video.

## What it does

Our product will offer users a comprehensive timeline during which human
emotions were evoked throughout the video. This feature allows viewers to gain
insights into the collective emotional responses experienced by the average
individual while watching specific moments in the video.

Demo: <https://www.youtube.com/watch?v=fU0F_mixcl4>

## How we built it

HumeTube works as a chrome browser extension that captures data from the users
by utilizing the front-facing camera. We then extract the timestamp of the
YouTube video from the DOM and simultaneously collect the emotions of the client
to then interpret using the Hume API for emotional classification.

The user can then load a YouTube video in which the browser extension will query
the data layer to retrieve the emotional history playback list that indicates
strong correlations between the average emotions observed throughout the video's
timeline. This information will be accessible via a collapsible HTML table,
directly injected next to the YouTube player.

## Challenges we ran into

A couple challenges we ran into was navigating outdated documentation of
creating a chrome browser extension and furthermore, providing access to the
laptop to capture recordings of the user's emotions.

## Accomplishments that we're proud of

The biggest accomplishments we've achieved come from overcoming our challenges.
The initial milestone was developing the browser extension to record every
timestamp of the video. The second achievement involved configuring the camera
to capture a single frame, encapsulating our reactions attached to a specific
timestamp.

## What we learned

We learned a lot from this experience. We learned how to create browser
extensions, manipulate data using Hume's batching API, and store data using
CockroachDB.

## What's next for HumeTube

We have a lot of features in mind to continue implementing further including
aggregating emotions based on regions, providing a trend line based on the
intensity of emotions evoked during specific scenes, and potentially creating a
larger frontend to collect and analyze all data that retrieves the bigger
picture (such as "video that had the highest average emotion of happiness",
etc.).

## Built with

- Deno
- Hume AI
- JavaScript
- TypeScript

## Data flow

![image](https://github.com/EthanThatOneKid/humetube/assets/31261035/76ad08a6-1129-48cb-a034-fc3a42afde8e)

> **NOTE**
>
> PII is not present in this data pipeline as the Hume API returns only the
> calculated emotions discarding the video frames.

## Development

### Extension

1. Open `chrome://extensions` in Chrome.
1. Enable **Developer mode**.
1. Click **Load unpacked**.
1. Select the `extension` directory.

### HTTP server

```sh
cd server
```

```sh
deno task start
```

<!-- TODO: Set up HTTP server for development. -->

### Database

The HumeTube API server uses Deno Kv to store data. The database is set up
automatically on [Deno Deploy](https://deno.com/deploy).

## Deployment

[Deno Deploy](https://deno.com/deploy).

## License

[`LICENSE`](LICENSE)

## Devpost submission

Devpost submission: <https://devpost.com/software/humetube>.

---

Created with 🐻 by [**@EthanThatOneKid**](https://etok.codes/) and
[**@karnikaavelumani**](https://karni.codes/)
