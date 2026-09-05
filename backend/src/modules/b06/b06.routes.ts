import { Router } from 'express';
import { getAuditLogs, getAuditLogById, createAuditLog, updateAuditLog } from './b06.controller';
import { authenticateToken } from '../b04/b04.service';
import { requireRole } from '../b05/b05.guard';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRole(['Administrator', 'Inspector', 'Supervisor']), getAuditLogs);
router.post('/', requireRole(['Administrator', 'Inspector', 'Supervisor']), createAuditLog);
router.get('/:id', requireRole(['Administrator', 'Inspector', 'Supervisor']), getAuditLogById);
router.patch('/:id', requireRole(['Administrator', 'Supervisor']), updateAuditLog);

export default router;
