import express, { Express } from 'express';
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
import b21Routes from './modules/b21/b21.routes';
import b22Routes from './modules/b22/b22.routes';
import b23Routes from './modules/b23/b23.routes';
import b24Routes from './modules/b24/b24.routes';
import b25Routes from './modules/b25/b25.routes';
import b26Routes from './modules/b26/b26.routes';
import b27Routes from './modules/b27/b27.routes';
import b28Routes from './modules/b28/b28.routes';
import b29Routes from './modules/b29/b29.routes';
import b30Routes from './modules/b30/b30.routes';
import b31Routes from './modules/b31/b31.routes';
import b32Routes from './modules/b32/b32.routes';
import b33Routes from './modules/b33/b33.routes';
import b34Routes from './modules/b34/b34.routes';
import b35Routes from './modules/b35/b35.routes';
import b36Routes from './modules/b36/b36.routes';
import b37Routes from './modules/b37/b37.routes';
import b38Routes from './modules/b38/b38.routes';
import b39Routes from './modules/b39/b39.routes';
import b40Routes from './modules/b40/b40.routes';

export const app: Express = express();

// Global Middlewares
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimiterMiddleware);
app.use(idempotencyMiddleware);

// Base Root Route
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Legal Metrology Compliance API Server Running',
  });
});

// Health Check Endpoints
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Legal Metrology Compliance Backend (SIH26034)',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/v1/health', (_req, res) => {
  res.json({
    status: 'ok',
  });
});

// Module API Routes (B01 - B40 under /api/v1)
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
app.use('/api/v1/b21', b21Routes);
app.use('/api/v1/b22', b22Routes);
app.use('/api/v1/b23', b23Routes);
app.use('/api/v1/b24', b24Routes);
app.use('/api/v1/b25', b25Routes);
app.use('/api/v1/b26', b26Routes);
app.use('/api/v1/b27', b27Routes);
app.use('/api/v1/b28', b28Routes);
app.use('/api/v1/b29', b29Routes);
app.use('/api/v1/b30', b30Routes);
app.use('/api/v1/b31', b31Routes);
app.use('/api/v1/b32', b32Routes);
app.use('/api/v1/b33', b33Routes);
app.use('/api/v1/b34', b34Routes);
app.use('/api/v1/b35', b35Routes);
app.use('/api/v1/b36', b36Routes);
app.use('/api/v1/b37', b37Routes);
app.use('/api/v1/b38', b38Routes);
app.use('/api/v1/b39', b39Routes);
app.use('/api/v1/b40', b40Routes);

// Audit Logs Endpoint (Admin/Supervisor)
app.get('/api/v1/audit-logs', (req, res) => {
  const entityType = req.query.entityType as string;
  const entityId = req.query.entityId as string;
  const logs = getAuditLogs(entityType, entityId);
  res.json({ success: true, data: logs });
});

// Global Error Handler
app.use(errorHandler);

export function createApp(): Express {
  return app;
}

export default app;
