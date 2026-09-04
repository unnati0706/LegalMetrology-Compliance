import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors/index.js';
import { UserRole } from '../types/index.js';

export function requireRoles(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('PERMISSION_DENIED', `Action restricted to roles: ${allowedRoles.join(', ')}`));
    }

    next();
  };
}

export function rbacGuard(allowedRoles: UserRole[]) {
  return requireRoles(...allowedRoles);
}
