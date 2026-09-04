import { Request, Response, NextFunction } from 'express';
import { PermissionDeniedError, UnauthorizedError } from '../../shared/errors';

export type AllowedRole = 'Administrator' | 'Inspector' | 'Supervisor' | 'Manufacturer';

export const requireRole = (allowedRoles: AllowedRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return next(new UnauthorizedError('Authentication required before authorization check'));
    }

    if (!allowedRoles.includes(user.role as AllowedRole)) {
      return next(
        new PermissionDeniedError(
          `Role '${user.role}' is not authorized to access this resource. Allowed roles: ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
};
