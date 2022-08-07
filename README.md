# REstreamer

With REstreamer you can stream a Website to a RTMP Server for example YouTube with NodeJS.
You can use NodeJS Arguments or .env file to provide the config. 
This works on Windows, MacOS and Linux.

Features
* Video
* Audio
* Headless
* Resolution
* Full HD Streaming
* Cookie Hide
* uBlock Origin (Adblocker)

## Demo

[https://www.youtube.com/watch?v=gfiQ-c7ib_Q](https://www.youtube.com/watch?v=gfiQ-c7ib_Q)

## Usage
```
npm install
npm start --rtmp={rtmp stream url} --url={browser url} --resolution=1920,1080
```

## Run in background
PM2 will restart every hour. This can be changed in the pm2.config.js file.
```
npm run pm2:start
```
```
npm run pm2:stop
```

## Arguments:

required:
```
--rtmp={rtmp stream url}
--url={browser url}
```
optional:
```
--resolution=1920,1080
```


## FAQ

Ubuntu 18 / 20 / 22


```
sudo apt-get update
```
```
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
```
```
sudo apt install -y nodejs
```
```
sudo apt-get install libpangocairo-1.0-0 libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxi6 libxtst6 libnss3 libcups2 libxss1 libxrandr2 libasound2 libatk1.0-0 libgtk-3-0 ffmpeg curl -y
```