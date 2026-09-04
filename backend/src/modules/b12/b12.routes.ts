import { Router } from 'express';
import { queryLogs, getLogById, exportSnapshot, annotateLog } from './b12.controller';
import { authenticateToken } from '../b04/b04.service';
import { requireRole } from '../b05/b05.guard';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRole(['Administrator', 'Supervisor']), queryLogs);
router.post('/', requireRole(['Administrator', 'Supervisor']), exportSnapshot);
router.get('/:id', requireRole(['Administrator', 'Supervisor']), getLogById);
router.patch('/:id', requireRole(['Administrator', 'Supervisor']), annotateLog);

export default router;
