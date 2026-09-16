import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { logger } from '../config/logger.js';
import { sendError } from '../utils/apiResponse.js';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(`[${req.method}] ${req.originalUrl} - ${err.message}`, { stack: err.stack });

  // Handle Multer upload size limit error
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      sendError(res, 'File size exceeds 5MB limit', null, 400);
      return;
    }
    sendError(res, `Upload error: ${err.message}`, null, 400);
    return;
  }

  // Handle custom upload mime errors
  if (err.message && err.message.includes('Invalid file type')) {
    sendError(res, err.message, null, 400);
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  sendError(res, message, null, statusCode);
};