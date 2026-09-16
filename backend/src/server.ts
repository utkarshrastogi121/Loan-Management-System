import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';
import { logger } from './config/logger.js';

const startServer = async () => {
  await connectDB();

  const app = createApp();
  const PORT = parseInt(ENV.PORT, 10) || 5000;

  const server = app.listen(PORT, () => {
    logger.info(`Server running in ${ENV.NODE_ENV} mode on port ${PORT}`);
  });

  const handleShutdown = (signal: string) => {
    logger.info(`Received ${signal}. Shutting down server gracefully.`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer();