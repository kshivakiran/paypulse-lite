import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

/**
 * Task 2.5 — Global Express error handler.
 * Catches ALL errors thrown by controllers/middleware and returns
 * a consistent JSON response. Never leaks internal stack traces.
 */
export const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Determine if this is a known operational error
  const statusCode = err.statusCode || err.status || 500;
  const isOperational = err.isOperational === true;

  // Log unexpected errors for debugging
  if (!isOperational) {
    console.error('❌ Unexpected Error:', err);
  }

  // Never expose internal details to the client
  const clientMessage = isOperational
    ? err.message
    : 'An internal server error occurred. Please try again later.';

  res.status(statusCode).json({
    error: clientMessage,
    ...(process.env.NODE_ENV === 'development' && !isOperational
      ? { debug: err.message }
      : {}),
  });
};
