module.exports = {
    apps: [
      {
        name: 'acquamarina',
        script: 'npm',
        args: 'start',
        exec_mode: 'fork',
        env: {
          NODE_ENV: 'production',
          PORT: 3001
        },
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        error_file: 'logs/pm2_error.log',
        out_file: 'logs/pm2_out.log',
        log_file: 'logs/pm2_combined.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
      }
    ]
  }