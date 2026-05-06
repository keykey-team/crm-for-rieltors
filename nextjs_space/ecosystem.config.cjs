module.exports = {
  apps: [
    {
      name: process.env.PM2_APP_NAME || 'realcrm',
      cwd: process.env.APP_ROOT || '/home/ubuntu/realtor_crm/nextjs_space',
      script: 'npm',
      args: 'run start',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
      },
    },
  ],
};