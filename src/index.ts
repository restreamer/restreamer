import { launch, getStream } from "puppeteer-stream";
import { exec } from "child_process";

import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

const streamToRtmp = async (
  rtmpUrl: string,
  pageUrl: string,
  resolution?: { width: number; height: number }
) => {
  const browser = await launch({
    defaultViewport: null,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      `--window-size=${resolution.width || 1920},${resolution.height || 1080}`,
      "--headless=chrome",
    ],
  });

  const page = await browser.newPage();
  await page.goto(pageUrl);

  const stream = await getStream(page, {
    audio: true,
    video: true,
  });

  console.log("restreaming to", rtmpUrl);

  const ffmpeg = exec(
    `ffmpeg -i - -c:v libx264 -preset veryfast -tune zerolatency -c:a aac -f flv ${rtmpUrl}`
    // `ffmpeg -i -  -map 0 -c:v libx264 -vf scale=640:480 -preset veryfast -tune zerolatency -g:v 60 -c:a aac -strict -2 -ar 44100 -b:a 64k -y -use_wallclock_as_timestamps 1 -async 1 -flags +global_header -f flv ${rtmpUrl}`
  );

  ffmpeg.stderr?.on("data", (chunk) => {
    // console.log(chunk.toString());
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
