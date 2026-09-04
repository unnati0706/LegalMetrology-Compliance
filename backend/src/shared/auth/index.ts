import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { ApiError } from '../errors/index.js';
import { UserRole } from '../types/index.js';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  organization?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function generateToken(payload: AuthUser, expiresIn: string = config.jwtExpiresIn): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn } as jwt.SignOptions);
}

export function generateTestToken(payload: AuthUser): string {
  return generateToken(payload, '1h');
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing or invalid Authorization header'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthUser;
    req.user = decoded;
    next();
  } catch (err: any) {
    return next(ApiError.unauthorized('Invalid or expired authentication token'));
  }
}

export const authenticateJwt = authenticate;
export type AuthRequest = Request & { user?: AuthUser };
export type AuthenticatedRequest = AuthRequest;

