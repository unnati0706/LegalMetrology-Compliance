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
