import { Router } from 'express';
import { getDetections, getDetectionById, processVision, updateBoundingBox } from './b15.controller';
import { authenticateToken } from '../b04/b04.service';
import { requireRole } from '../b05/b05.guard';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getDetections);
router.post('/', requireRole(['Administrator', 'Inspector', 'Supervisor']), processVision);
router.get('/:id', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getDetectionById);
router.patch('/:id', requireRole(['Administrator', 'Inspector', 'Supervisor']), updateBoundingBox);

export default router;
