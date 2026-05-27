module.exports = {
  apps: [
    {
      name: 'crm-server',
      cwd: __dirname,
      script: './node_modules/.bin/tsx',
      args: 'src/app/server.ts',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: process.env.NODE_ENV || 'development',
      },
    },
  ],
};
