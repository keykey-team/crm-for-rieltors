import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { routes } from './routes';
import { errorHandler } from '../common/errors/error-handler';

const app = express();
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use('/api', routes);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`CRM server listening on http://localhost:${env.port}`);
});
