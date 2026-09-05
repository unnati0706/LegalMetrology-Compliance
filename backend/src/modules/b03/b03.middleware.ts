import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { ZodSchema, ZodError } from 'zod';
import { config } from '../../config';
import { ValidationError } from '../../shared/errors';

export const helmetMiddleware = helmet();

export const corsMiddleware = cors({
  origin: config.corsOrigin,
  credentials: true,
});

export const rateLimiterMiddleware = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later',
    },
  },
});

export const validateRequest = (schema: { body?: ZodSchema; query?: ZodSchema; params?: ZodSchema }) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      next();
    } catch (err: any) {
      if (err instanceof ZodError) {
        const issues = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return next(new ValidationError(`Validation failed: ${issues}`, err.errors));
      }
      next(err);
    }
  };
};
