import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser } from './b07.controller';
import { authenticateToken } from '../b04/b04.service';
import { requireRole } from '../b05/b05.guard';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRole(['Administrator', 'Inspector', 'Supervisor']), getUsers);
router.post('/', requireRole(['Administrator']), createUser);
router.get('/:id', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getUserById);
router.patch('/:id', requireRole(['Administrator']), updateUser);

export default router;
