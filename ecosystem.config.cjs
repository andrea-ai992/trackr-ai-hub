// PM2 ecosystem — lance Discord bot + Andy daemon sur le serveur
// Usage: pm2 start ecosystem.config.cjs

module.exports = {
  apps: [
    {
      name: 'andy-daemon',
      script: 'cli/andy-daemon.js',
      interpreter: 'node',
      interpreter_args: '--experimental-vm-modules',
      cwd: '/root/trackr',
      restart_delay: 5000,
      max_restarts: 999,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      out_file: '/root/logs/andy-daemon.log',
      error_file: '/root/logs/andy-daemon-error.log',
      merge_logs: true,
    },
    {
      name: 'discord-bot',
      script: 'bot/index.js',
      interpreter: 'node',
      cwd: '/root/trackr',
      restart_delay: 3000,
      max_restarts: 999,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      out_file: '/root/logs/discord-bot.log',
      error_file: '/root/logs/discord-bot-error.log',
      merge_logs: true,
    },
  ],
}
