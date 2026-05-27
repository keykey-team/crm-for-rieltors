import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { env } from '../../configuration/env';
import { errorHandler } from '../../common/infrastructure/http/error-handler';
import { routes } from './routes';

const app = express();

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  if (env.clientUrls.includes(origin)) return true;

  return env.nodeEnv === 'development' && /^https:\/\/[a-z0-9-]+\.ngrok-free\.app$/i.test(origin);
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use('/api', routes);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`CRM server listening on http://localhost:${env.port}`);
});

