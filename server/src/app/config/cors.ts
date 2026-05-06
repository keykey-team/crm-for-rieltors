import { CorsOptions } from 'cors';
import { env } from './env';


const allowedOrigins = new Set([env.clientUrl, 'http://localhost:3000']);

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },

  credentials: true,
};
