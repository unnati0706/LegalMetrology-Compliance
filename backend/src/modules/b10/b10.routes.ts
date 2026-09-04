import { Router } from 'express';
import { getEvidenceList, getEvidenceById, uploadEvidence, updateEvidence } from './b10.controller';
import { authenticateToken } from '../b04/b04.service';
import { requireRole } from '../b05/b05.guard';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getEvidenceList);
router.post('/', requireRole(['Administrator', 'Inspector', 'Supervisor']), uploadEvidence);
router.get('/:id', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getEvidenceById);
router.patch('/:id', requireRole(['Administrator', 'Inspector', 'Supervisor']), updateEvidence);

export default router;
