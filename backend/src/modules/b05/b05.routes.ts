import { Router } from 'express';
import { getRoles, getRoleById, createRole, updateRole } from './b05.controller';
import { authenticateToken } from '../b04/b04.service';
import { requireRole } from './b05.guard';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getRoles);
router.post('/', requireRole(['Administrator']), createRole);
router.get('/:id', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getRoleById);
router.patch('/:id', requireRole(['Administrator']), updateRole);

export default router;
