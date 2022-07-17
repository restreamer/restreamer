import { launch, getStream } from "puppeteer-stream";
import { exec } from "child_process";

import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import minimist from 'minimist';
import 'dotenv/config'

puppeteer.use(StealthPlugin());

const streamToRtmp = async (
  rtmpUrl: string,
  pageUrl: string,
  resolution: { width: number; height: number } = { width: 1920, height: 1080 }
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
    frameSize: 2000,
    // @ts-ignore
    videoConstraints,
  });

  const ffmpeg = exec(
    `ffmpeg -i - -c:v libx264 -vf scale=${resolution.width}:${resolution.height}  -preset veryfast -r 30 -filter:v fps=fps=30 -g:v 60 -c:a aac -f flv ${rtmpUrl}`
    // `ffmpeg -i -  -map 0 -c:v libx264 -vf scale=640:480 -preset veryfast -tune zerolatency -g:v 60 -c:a aac -strict -2 -ar 44100 -b:a 64k -y -use_wallclock_as_timestamps 1 -async 1 -flags +global_header -f flv ${rtmpUrl}`
  );

  ffmpeg.stderr?.on("data", (chunk) => {
    console.log(chunk.toString());
  });

  stream.pipe(ffmpeg.stdin!!);
};

(async () => {
  console.log('process.env', process.env.RTMP)
  var argv = minimist(process.argv.slice(2));
  const rtmp = argv.rtmp || process.env.RTMP;
  const url = argv.url || process.env.URL;
  const resolutionArgs = argv.resolution || process.env.RESOLUTION;

  if(!rtmp) {
    console.log("Please provide rtmp url");
    process.exit(1);
  }
  if(!url) {
    console.log("Please provide website url");
    process.exit(1);
  }

  let resolution = { width: 1920, height: 1080 };
  if(resolutionArgs) {
    const resolutionFormatted = resolutionArgs.split(",");
    if(resolutionFormatted.length !== 2) {
      console.log("Please provide resolution in format width,height");
      process.exit(1);
    }
    resolution.width = parseInt(resolutionFormatted[0]);
    resolution.height = parseInt(resolutionFormatted[1]);
  }

  // start stream
  console.log("Starting stream");
  console.log('RTMP Url:', rtmp);
  console.log('Website:', url);
  console.log('Resolution:', resolution);

  await streamToRtmp(rtmp, url, resolution);
})();
