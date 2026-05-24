import dotenv from 'dotenv';

dotenv.config();

function getRequired(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:3000',
  databaseUrl: getRequired('DATABASE_URL'),
  jwtSecret: getRequired('JWT_SECRET'),
  awsRegion: process.env.AWS_REGION ?? 'us-east-1',
  awsBucketName: process.env.AWS_BUCKET_NAME ?? '',
  awsFolderPrefix: process.env.AWS_FOLDER_PREFIX ?? '',
};

