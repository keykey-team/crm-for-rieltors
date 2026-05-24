import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { env } from '../../configuration/env';
import { errorHandler } from '../../common/infrastructure/http/error-handler';
import { routes } from './routes';

const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use('/api', routes);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`CRM server listening on http://localhost:${env.port}`);
});

