import { Router } from 'express';
import { getRules, getRuleById, createRule, updateRule } from './b19.controller';
import { authenticateToken } from '../b04/b04.service';
import { requireRole } from '../b05/b05.guard';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getRules);
router.post('/', requireRole(['Administrator']), createRule);
router.get('/:id', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getRuleById);
router.patch('/:id', requireRole(['Administrator']), updateRule);

export default router;
