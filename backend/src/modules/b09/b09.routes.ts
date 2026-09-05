import { Router } from 'express';
import { getInspections, getInspectionById, createInspection, updateInspection } from './b09.controller';
import { authenticateToken } from '../b04/b04.service';
import { requireRole } from '../b05/b05.guard';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getInspections);
router.post('/', requireRole(['Administrator', 'Inspector', 'Supervisor']), createInspection);
router.get('/:id', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getInspectionById);
router.patch('/:id', requireRole(['Administrator', 'Inspector', 'Supervisor']), updateInspection);

export default router;
