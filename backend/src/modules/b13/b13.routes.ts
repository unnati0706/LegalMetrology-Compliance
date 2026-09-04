import { Router } from 'express';
import { getQualityResults, getQualityById, analyzeQuality, updateQualityFlags } from './b13.controller';
import { authenticateToken } from '../b04/b04.service';
import { requireRole } from '../b05/b05.guard';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getQualityResults);
router.post('/', requireRole(['Administrator', 'Inspector', 'Supervisor']), analyzeQuality);
router.get('/:id', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getQualityById);
router.patch('/:id', requireRole(['Administrator', 'Inspector', 'Supervisor']), updateQualityFlags);

export default router;
