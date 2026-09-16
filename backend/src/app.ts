import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import { ENV } from './config/env.js';
import rootRouter from './routes/index.js';
import { apiLimiter } from './middlewares/rateLimiter.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';

export const createApp = (): Application => {
  const app = express();

  // Basic Security & Parsing Middlewares
  app.use(
    cors({
      origin: ENV.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Global API Rate Limiter
  app.use('/api', apiLimiter);

  // Serve static files for uploaded salary slips
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

  // Health check route
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Mount API Router
  app.use('/api/v1', rootRouter);

  // Global Error Handler
  app.use(errorHandler);

  return app;
};