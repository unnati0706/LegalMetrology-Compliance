import { Router } from 'express';
import { getSecuritySettings, updateSecuritySettings } from './b03.controller';
import { authenticateToken } from '../b04/b04.service';
import { requireRole } from '../b05/b05.guard';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getSecuritySettings);
router.post('/', requireRole(['Administrator']), updateSecuritySettings);
router.get('/:id', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getSecuritySettings);
router.patch('/:id', requireRole(['Administrator']), updateSecuritySettings);

export default router;
