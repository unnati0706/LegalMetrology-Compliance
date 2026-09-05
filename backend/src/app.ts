
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

import express from 'express';
import { helmetMiddleware, corsMiddleware, rateLimiterMiddleware } from './modules/b03/b03.middleware';
import { idempotencyMiddleware } from './shared/idempotency';
import { errorHandler } from './shared/errors';
import { getAuditLogs } from './shared/audit';

import b01Routes from './modules/b01/b01.routes';
import b02Routes from './modules/b02/b02.routes';
import b03Routes from './modules/b03/b03.routes';
import b04Routes from './modules/b04/b04.routes';
import b05Routes from './modules/b05/b05.routes';
import b06Routes from './modules/b06/b06.routes';
import b07Routes from './modules/b07/b07.routes';
import b08Routes from './modules/b08/b08.routes';
import b09Routes from './modules/b09/b09.routes';
import b10Routes from './modules/b10/b10.routes';
import b11Routes from './modules/b11/b11.routes';
import b12Routes from './modules/b12/b12.routes';
import b13Routes from './modules/b13/b13.routes';
import b14Routes from './modules/b14/b14.routes';
import b15Routes from './modules/b15/b15.routes';
import b16Routes from './modules/b16/b16.routes';
import b17Routes from './modules/b17/b17.routes';
import b18Routes from './modules/b18/b18.routes';
import b19Routes from './modules/b19/b19.routes';
import b20Routes from './modules/b20/b20.routes';

const app = express();

// Global Middlewares
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiterMiddleware);
app.use(idempotencyMiddleware);

// Health Check Endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'UP',
    service: 'Legal Metrology Compliance Backend (SIH26034)',
    timestamp: new Date().toISOString(),
  });
});

// Module API Routes
app.use('/api/v1/b01', b01Routes);
app.use('/api/v1/b02', b02Routes);
app.use('/api/v1/b03', b03Routes);
app.use('/api/v1/b04', b04Routes);
app.use('/api/v1/b05', b05Routes);
app.use('/api/v1/b06', b06Routes);
app.use('/api/v1/b07', b07Routes);
app.use('/api/v1/b08', b08Routes);
app.use('/api/v1/b09', b09Routes);
app.use('/api/v1/b10', b10Routes);
app.use('/api/v1/b11', b11Routes);
app.use('/api/v1/b12', b12Routes);
app.use('/api/v1/b13', b13Routes);
app.use('/api/v1/b14', b14Routes);
app.use('/api/v1/b15', b15Routes);
app.use('/api/v1/b16', b16Routes);
app.use('/api/v1/b17', b17Routes);
app.use('/api/v1/b18', b18Routes);
app.use('/api/v1/b19', b19Routes);
app.use('/api/v1/b20', b20Routes);

// Audit Logs Endpoint (Admin/Supervisor)
app.get('/api/v1/audit-logs', (req, res) => {
  const entityType = req.query.entityType as string;
  const entityId = req.query.entityId as string;
  const logs = getAuditLogs(entityType, entityId);
  res.json({ success: true, data: logs });
});

// Global Error Handler
app.use(errorHandler);

export default app;

