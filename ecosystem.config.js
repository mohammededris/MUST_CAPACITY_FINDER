module.exports = {
  apps: [
    {
      name: "must-capacity-api",
      script: "./index.js",
      cwd: "/home/azureuser/MUST_CAPACITY_FINDER",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "500M",
      env_file: "/home/azureuser/MUST_CAPACITY_FINDER/.env",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      error_file: "/home/azureuser/MUST_CAPACITY_FINDER/logs/api-error.log",
      out_file: "/home/azureuser/MUST_CAPACITY_FINDER/logs/api-out.log",
      log_file: "/home/azureuser/MUST_CAPACITY_FINDER/logs/api-combined.log",
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
