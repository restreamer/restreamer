module.exports = {
    apps: [
        {
            name: 'restreamer',
            script: 'dist/index.js',
            instances: 1,
            cron_restart: '0 * * * *',
            env: {
                NODE_ENV: 'development'
            },
            env_production: {
                NODE_ENV: 'production'
            }
        },
    ],
};