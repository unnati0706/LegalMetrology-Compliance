import express, { Express } from 'express';
import { securityHeaders, corsMiddleware, apiLimiter } from './shared/middleware/index.js';
import { errorHandler } from './shared/errors/index.js';

// Import Module Routes (B21 - B40)
import b21Router from './modules/b21/b21.routes.js';
import b22Router from './modules/b22/b22.routes.js';
import b23Router from './modules/b23/b23.routes.js';
import b24Router from './modules/b24/b24.routes.js';
import b25Router from './modules/b25/b25.routes.js';
import b26Router from './modules/b26/b26.routes.js';
import b27Router from './modules/b27/b27.routes.js';
import b28Router from './modules/b28/b28.routes.js';
import b29Router from './modules/b29/b29.routes.js';
import b30Router from './modules/b30/b30.routes.js';
import b31Router from './modules/b31/b31.routes.js';
import b32Router from './modules/b32/b32.routes.js';
import b33Router from './modules/b33/b33.routes.js';
import b34Router from './modules/b34/b34.routes.js';
import b35Router from './modules/b35/b35.routes.js';
import b36Router from './modules/b36/b36.routes.js';
import b37Router from './modules/b37/b37.routes.js';
import b38Router from './modules/b38/b38.routes.js';
import b39Router from './modules/b39/b39.routes.js';
import b40Router from './modules/b40/b40.routes.js';

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
    res.status(200).json({
      status: 'HEALTHY',
      modules: [
        'B21', 'B22', 'B23', 'B24', 'B25',
        'B26', 'B27', 'B28', 'B29', 'B30',
        'B31', 'B32', 'B33', 'B34', 'B35',
        'B36', 'B37', 'B38', 'B39', 'B40'
      ],
      timestamp: new Date().toISOString()
    });
  });

  // Mount Compliance, History, Analytics & Enforcement Modules B21 - B40
  app.use('/api/v1/b21', b21Router);
  app.use('/api/v1/b22', b22Router);
  app.use('/api/v1/b23', b23Router);
  app.use('/api/v1/b24', b24Router);
  app.use('/api/v1/b25', b25Router);
  app.use('/api/v1/b26', b26Router);
  app.use('/api/v1/b27', b27Router);
  app.use('/api/v1/b28', b28Router);
  app.use('/api/v1/b29', b29Router);
  app.use('/api/v1/b30', b30Router);
  app.use('/api/v1/b31', b31Router);
  app.use('/api/v1/b32', b32Router);
  app.use('/api/v1/b33', b33Router);
  app.use('/api/v1/b34', b34Router);
  app.use('/api/v1/b35', b35Router);
  app.use('/api/v1/b36', b36Router);
  app.use('/api/v1/b37', b37Router);
  app.use('/api/v1/b38', b38Router);
  app.use('/api/v1/b39', b39Router);
  app.use('/api/v1/b40', b40Router);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();

