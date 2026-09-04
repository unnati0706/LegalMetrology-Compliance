import express, { Express } from 'express';
import { securityHeaders, corsMiddleware, apiLimiter } from './shared/middleware/index.js';
import { errorHandler } from './shared/errors/index.js';

// Import Module Routes
import b21Router from './modules/b21/b21.routes.js';
import b22Router from './modules/b22/b22.routes.js';
import b23Router from './modules/b23/b23.routes.js';
import b24Router from './modules/b24/b24.routes.js';
import b25Router from './modules/b25/b25.routes.js';

export function createApp(): Express {
  const app = express();

  // Security Middleware
  app.use(securityHeaders);
  app.use(corsMiddleware);
  app.use(apiLimiter);

  // Body parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'HEALTHY', timestamp: new Date().toISOString() });
  });

  // Mount Compliance Modules B21 - B25
  app.use('/api/v1/b21', b21Router);
  app.use('/api/v1/b22', b22Router);
  app.use('/api/v1/b23', b23Router);
  app.use('/api/v1/b24', b24Router);
  app.use('/api/v1/b25', b25Router);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
