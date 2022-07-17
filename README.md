# REstreamer


With REstreamer you can stream a Website to a RTMP Server for example YouTube with NodeJS.


Working
* Video
* Audio
* Headless
* Resolution


## To use, please call:
```
npm install
npm start --rtmp={rtmp stream url} --url={browser url} --resolution=1920,1080
```

## Run in background
```
npm run forever:start
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
