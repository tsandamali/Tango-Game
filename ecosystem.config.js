// PM2 ecosystem configuration for production deployment
module.exports = {
  apps: [
    {
      name: 'tango-puzzle-game',
      script: './src/server.js',
      instances: 'max', // Use all available CPUs
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 80
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '500M',
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git'],
      min_uptime: '10s',
      max_restarts: 10
    }
  ]
};
