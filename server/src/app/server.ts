import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { corsOptions } from './config/cors';
import { routes } from './routes';
import { errorHandler } from '../common/errors';
import '../common/di/container';

const app = express();

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use('/api', routes);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});
