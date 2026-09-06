import { Router } from 'express';
import { getApplicableRules, getApplicabilityById, evaluateApplicability } from './b20.controller';
import { authenticateToken } from '../b04/b04.service';
import { requireRole } from '../b05/b05.guard';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getApplicableRules);
router.post('/', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), evaluateApplicability);
router.get('/:id', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getApplicabilityById);
router.patch('/:id', requireRole(['Administrator']), evaluateApplicability);

export default router;
