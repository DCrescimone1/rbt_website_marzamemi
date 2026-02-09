module.exports = {
  apps: [{
    name: 'seacilyvillas',
    script: 'npm',
    args: 'start',
    cwd: '/home/raspy/projects/rbt_website_marzamemi',
    exec_mode: 'fork',
    instances: 1,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3004
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    out_file: './logs/pm2_out.log',
    error_file: './logs/pm2_error.log',
    log_file: './logs/pm2_combined.log',
    merge_logs: true,
    time: true,
    autorestart: true,
    watch: false
  }]
}