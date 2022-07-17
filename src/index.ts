import puppeteer from 'puppeteer';
import {PuppeteerScreenRecorder} from 'puppeteer-screen-recorder';
import { PassThrough, Writable } from 'stream';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const recorder = new PuppeteerScreenRecorder(page);

  // Stream to rtmp stream // YouTube
  const pipeStream = new PassThrough();
  await recorder.startStream(pipeStream);
  // await recorder.start('./simple.mp4');
  await page.goto('https://www.ventusky.com/');

  /*setTimeout(async ()=> {

    await recorder.stop();
    await browser.close();
  }, 5000)*/
})();