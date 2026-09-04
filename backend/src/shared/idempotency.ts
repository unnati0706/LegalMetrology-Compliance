import { Request, Response, NextFunction } from 'express';

interface CachedResponse {
  statusCode: number;
  body: any;
}

const idempotencyStore = new Map<string, CachedResponse>();

export const idempotencyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const key = req.headers['idempotency-key'] as string;
  if (!key || req.method === 'GET') {
    return next();
  }

  if (idempotencyStore.has(key)) {
    const cached = idempotencyStore.get(key)!;
    return res.status(cached.statusCode).json(cached.body);
  }

  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    idempotencyStore.set(key, {
      statusCode: res.statusCode,
      body,
    });
    return originalJson(body);
  };

  next();
};
