import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public errorCode: string;
  public details?: any;

  constructor(statusCode: number, errorCode: string, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Payload failed schema validation', details?: any) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class PermissionDeniedError extends AppError {
  constructor(message: string = 'Permission denied for this action') {
    super(403, 'PERMISSION_DENIED', message);
  }
}

export class NotFoundError extends AppError {
  constructor(modulePrefix: string, resourceName: string = 'Resource') {
    super(404, `${modulePrefix}_NOT_FOUND`, `${resourceName} not found`);
  }
}

export class InvalidStateTransitionError extends AppError {
  constructor(message: string = 'Action not permitted in the current resource state') {
    super(400, 'INVALID_STATE_TRANSITION', message);
  }
}

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected internal server error occurred';

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(err.details ? { details: err.details } : {}),
    },
    timestamp: new Date().toISOString(),
  });
};
