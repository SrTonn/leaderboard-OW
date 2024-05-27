module.exports = {
  apps: [{
    name: 'Leaderboard-ow',
    script: './index.mjs',
    watch: true,
    env: {
      PORT: 3000,
      NODE_ENV: 'dev',
    },
    env_production: {
      PORT: 8080,
      NODE_ENV: 'prd',
    },
  }],
};
