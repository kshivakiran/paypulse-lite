import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL: JWT_SECRET environment variable is not set.');
  }
  return secret;
}

export { getJwtSecret };

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Access denied. Token missing or invalid.'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as {
      id?: string;
      email?: string;
      role?: string;
    };

    if (!decoded || !decoded.id) {
      return next(new UnauthorizedError('Invalid token payload. Please log in again.'));
    }

    req.user = { id: decoded.id, email: decoded.email!, role: decoded.role! };
    next();
  } catch (error) {
    return next(new UnauthorizedError('Invalid or expired JWT token.'));
  }
};

/**
 * Middleware to restrict access to admin users only.
 */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return next(new UnauthorizedError('Admin access required.'));
  }
  next();
};
