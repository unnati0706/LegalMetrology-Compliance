import { Router } from 'express';
import { B34Controller } from './b34.controller.js';
import { authenticateJwt } from '../../shared/auth/index.js';
import { rbacGuard } from '../../shared/rbac/index.js';
import { idempotencyMiddleware } from '../../shared/middleware/index.js';

export function createB34Router(): Router {
  const router = Router();
  const controller = new B34Controller();

  router.use(authenticateJwt);

  // GET /api/v1/b34 - Query risk profiles (All authenticated roles)
  router.get(
    '/',
    rbacGuard(['ADMIN', 'SUPERVISOR', 'INSPECTOR', 'MANUFACTURER']),
    controller.getRiskProfiles
  );

  // POST /api/v1/b34 - Trigger risk computation (Admin, Supervisor)
  router.post(
    '/',
    rbacGuard(['ADMIN', 'SUPERVISOR']),
    idempotencyMiddleware,
    controller.computeRisk
  );

  // GET /api/v1/b34/:id - Fetch single profile with breakdown
  router.get(
    '/:id',
    rbacGuard(['ADMIN', 'SUPERVISOR', 'INSPECTOR', 'MANUFACTURER']),
    controller.getRiskProfileById
  );

  // PATCH /api/v1/b34/:id - Supervisor/Admin override risk score
  router.patch(
    '/:id',
    rbacGuard(['ADMIN', 'SUPERVISOR']),
    controller.overrideRisk
  );

  return router;
}

export default createB34Router();

