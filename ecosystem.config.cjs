module.exports = {
  apps: [
    {
      name: 'spill-the-bill-be',
      script: 'src/server.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
