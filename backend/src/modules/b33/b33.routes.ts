import { Router } from 'express';
import { B33Controller } from './b33.controller.js';
import { authenticateJwt } from '../../shared/auth/index.js';
import { rbacGuard } from '../../shared/rbac/index.js';
import { idempotencyMiddleware } from '../../shared/middleware/index.js';

export function createB33Router(): Router {
  const router = Router();
  const controller = new B33Controller();

  router.use(authenticateJwt);

  // GET /api/v1/b33 - View geographic metrics & heatmap data
  router.get(
    '/',
    rbacGuard(['ADMIN', 'SUPERVISOR', 'INSPECTOR', 'MANUFACTURER']),
    controller.getGeoZones
  );

  // POST /api/v1/b33 - Recalculate / create geo metrics (Admin, Supervisor)
  router.post(
    '/',
    rbacGuard(['ADMIN', 'SUPERVISOR']),
    idempotencyMiddleware,
    controller.recalculateZone
  );

  // GET /api/v1/b33/:id - Get specific geo zone detail
  router.get(
    '/:id',
    rbacGuard(['ADMIN', 'SUPERVISOR', 'INSPECTOR', 'MANUFACTURER']),
    controller.getGeoZoneById
  );

  // PATCH /api/v1/b33/:id - Update zone metadata / inspector allocations (Admin, Supervisor)
  router.patch(
    '/:id',
    rbacGuard(['ADMIN', 'SUPERVISOR']),
    controller.updateGeoZone
  );

  return router;
}

export default createB33Router();

