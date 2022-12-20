import { exec } from "child_process";
import "dotenv/config";
import minimist from "minimist";
import { executablePath } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { getStream, launch } from "puppeteer-stream";
import { minimal_args } from "./flags";
import { extensions } from "./plugins";

puppeteer.use(StealthPlugin());

const streamToRtmp = async (
  rtmpUrl: string,
  pageUrl: string,
  resolution: { width: number; height: number } = { width: 1920, height: 1080 },
  frameRate: number = 30,
  buffSize: number = 4,
  scrollToY: number = 0,
) => {
  const browser = await launch({
    defaultViewport: null,
    ignoreDefaultArgs: ["--hide-scrollbars", "--disable-extensions", "--enable-automation"],
    args: [
      ...minimal_args,
     `--disable-extensions-except=${extensions.toString()}`,
     `--load-extension=${extensions.toString()}`,
     '--headless=chrome',
      `--window-size=${resolution.width},${resolution.height}`,
    ],
    executablePath: executablePath(),
  });

  const [page] = await browser.pages();
  await page.goto(pageUrl, { waitUntil: "networkidle0" });
  await page.addStyleTag({content: 'body { overflow: hidden !important; }'});
  await page.emulateMediaFeatures([{
    name: 'prefers-color-scheme', value: 'dark' }]);
  await page.evaluate((scrollToY) => {
    window.scrollTo(0, scrollToY);
  }, scrollToY);
  page.setViewport({ width: resolution.width, height: resolution.height });
  
  const videoConstraints = {
    mandatory: {
      minWidth: resolution.width,
      minHeight: resolution.height,
      maxWidth: resolution.width,
      maxHeight: resolution.height,
    },
  };

  setTimeout(async () => {
    try {
      const ffmpeg = exec(
        `ffmpeg -i - -c:v libx264 -vf scale=${resolution.width}:${resolution.height} -preset veryfast -r ${frameRate} -filter:v fps=fps=${frameRate} -g:v ${frameRate * 2} -c:a aac -b:v ${buffSize}M -maxrate ${buffSize}M -bufsize ${buffSize / 2}M  -f flv ${rtmpUrl}`
      );

      ffmpeg.stderr?.on("data", (chunk) => {
        console.log(chunk.toString());
      });

      const stream = await getStream(page, {
        audio: true,
        video: true,
        frameSize: 1000,
        // @ts-ignore
        videoConstraints,
      });

      stream.pipe(ffmpeg.stdin!!);
    } catch (error) {
      console.log("error", error);
    }
  }, 1000);
};

(async () => {
  var argv = minimist(process.argv.slice(2));
  const rtmp = argv.rtmp || process.env.RTMP;
  const url = argv.url || process.env.URL;
  const resolutionArgs = argv.resolution || process.env.RESOLUTION;
  const framerate = argv.framerate || process.env.FRAMERATE || 30;
  const scrollToY = parseInt(argv.scrollToY || process.env.SCROLLTOY || 0);

  if (!rtmp) {
    console.log("Please provide rtmp url");
    process.exit(1);
  }
  if (!url) {
    console.log("Please provide website url");
    process.exit(1);
  }

  let resolution = { width: 1920, height: 1080 };
  if (resolutionArgs) {
    const resolutionFormatted = resolutionArgs.split(",");
    if (resolutionFormatted.length !== 2) {
      console.log("Please provide resolution in format width,height");
      process.exit(1);
    }
    resolution.width = parseInt(resolutionFormatted[0]);
    resolution.height = parseInt(resolutionFormatted[1]);
  }

  // start stream
  console.log("Starting stream");
  console.log("RTMP Url:", rtmp);
  console.log("Website:", url);
  console.log("Resolution:", resolution);
  console.log("Framerate:", framerate);
  console.log("ScrollToY:", scrollToY);

  await streamToRtmp(rtmp, url, resolution, framerate, 4, scrollToY);
})();
