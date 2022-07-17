module.exports = {
    apps: [
        {
            name: 'restreamer',
            script: 'dist/index.js',
            args: '--rtmp=rtmp://a.rtmp.youtube.com/live2/4x4m-1sxe-syrh-4y6u-dmm0 --url=https://www.windy.com/'
        },
    ],
};