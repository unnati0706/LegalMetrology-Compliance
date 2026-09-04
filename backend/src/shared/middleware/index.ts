import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '../config/index.js';
import { db } from '../database/index.js';

export const securityHeaders = helmet();

export const corsMiddleware = cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
});

export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.',
    }
  }
});

export function validateRequest(schema: {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function idempotencyMiddleware(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['idempotency-key'] as string;
  if (!key || req.method !== 'POST') {
    return next();
  }

  const cached = db.store.idempotencyKeys.get(key);
  if (cached) {
    res.status(cached.response.status).json(cached.response.body);
    return;
  }

  const originalJson = res.json.bind(res);
  res.json = function (body: any) {
    db.store.idempotencyKeys.set(key, {
      response: {
        status: res.statusCode,
        body,
      },
      timestamp: Date.now(),
    });
    return originalJson(body);
  };

  next();
}
