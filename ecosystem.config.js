module.exports = {
  apps: [
    {
      name: "must-capacity-api",
      script: "./server/index.js",
      cwd: "/var/www/must-capacity-finder",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      error_file: "/var/log/must-capacity-finder/api-error.log",
      out_file: "/var/log/must-capacity-finder/api-out.log",
      log_file: "/var/log/must-capacity-finder/api-combined.log",
      time: true,
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      // Restart configuration
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",

      // Advanced features
      listen_timeout: 10000,
      kill_timeout: 5000,
    },
  ],
};
