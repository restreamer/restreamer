import { launch, getStream } from "puppeteer-stream";
import { exec } from "child_process";

import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

const streamToRtmp = async (
  rtmpUrl: string,
  pageUrl: string,
  resolution: { width: number; height: number } = { width: 1280, height: 720 }
) => {
  const browser = await launch({
    defaultViewport: null,
    args: [
      "--no-zygote",
      "--no-sandbox",
     // "--disable-gpu",
     // "--single-process",
     // "--start-fullscreen",
      "--headless=chrome",
      "--ignore-certificate-errors",
      "--disable-software-rasterizer",
      "--disable-setuid-sandbox",
      `--window-size=${resolution.width},${resolution.height}`,
    ],
  });

  const page = await browser.newPage();
  await page.goto(pageUrl);

  const videoConstraints = {
    mandatory: {
      minWidth: resolution.width,
      minHeight: resolution.height,
      maxWidth: resolution.width,
      maxHeight: resolution.height,
    },
  };

  const stream = await getStream(page, {
    audio: true,
    video: true,
    frameSize: 1000,
    // @ts-ignore
    videoConstraints,
  });

  console.log("restreaming to", rtmpUrl);

  const ffmpeg = exec(
    `ffmpeg -i - -c:v libx264 -vf scale=${resolution.width}:${resolution.height}  -preset veryfast -tune zerolatency -c:a aac -f flv ${rtmpUrl}`
    // `ffmpeg -i -  -map 0 -c:v libx264 -vf scale=640:480 -preset veryfast -tune zerolatency -g:v 60 -c:a aac -strict -2 -ar 44100 -b:a 64k -y -use_wallclock_as_timestamps 1 -async 1 -flags +global_header -f flv ${rtmpUrl}`
  );

  ffmpeg.stderr?.on("data", (chunk) => {
    console.log(chunk.toString());
  });

  stream.pipe(ffmpeg.stdin!!);
};

(async () => {
  // take stream key, and browser url as command arguments and return error if not provided
  if (process.argv.length < 3) {
    console.log("Please provide stream url and browser url");
    process.exit(1);
  }

  // get stream url from arguments
  const streamUrl = process.argv[2];
  const browserUrl = process.argv[3];

  // start stream
  console.log("Starting stream");
  await streamToRtmp(streamUrl, browserUrl, { width: 1920, height: 1080 });
})();
