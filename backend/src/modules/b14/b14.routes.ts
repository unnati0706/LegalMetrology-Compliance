import { Router } from 'express';
import { getOcrResults, getOcrById, processOcr, updateOcrText } from './b14.controller';
import { authenticateToken } from '../b04/b04.service';
import { requireRole } from '../b05/b05.guard';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getOcrResults);
router.post('/', requireRole(['Administrator', 'Inspector', 'Supervisor']), processOcr);
router.get('/:id', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getOcrById);
router.patch('/:id', requireRole(['Administrator', 'Inspector', 'Supervisor']), updateOcrText);

export default router;
