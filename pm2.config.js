module.exports = {
    apps: [
        {
            name: 'restreamer',
            script: 'dist/index.js',
            args: '--rtmp=rtmp://a.rtmp.youtube.com/live2/4x4m-1sxe-syrh-4y6u-dmm0 --url=https://www.windy.com/',
            instances: "max",
            max_memory_restart: "2G",
            env: {
                NODE_ENV: "development",
            },
            env_production: {
                NODE_ENV: "production",
            }
        },
    ],
};