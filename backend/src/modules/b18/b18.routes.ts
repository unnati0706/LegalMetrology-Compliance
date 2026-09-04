import { Router } from 'express';
import { getDeclarations, getDeclarationById, evaluateConfidence, applyManualCorrection } from './b18.controller';
import { authenticateToken } from '../b04/b04.service';
import { requireRole } from '../b05/b05.guard';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getDeclarations);
router.post('/', requireRole(['Administrator', 'Inspector', 'Supervisor']), evaluateConfidence);
router.get('/:id', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getDeclarationById);
router.patch('/:id', requireRole(['Administrator', 'Inspector', 'Supervisor']), applyManualCorrection);

export default router;
