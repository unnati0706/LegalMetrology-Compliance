import { Router } from 'express';
import { getConfigs, getConfigById, createConfig, updateConfig } from './b01.controller';
import { authenticateToken } from '../b04/b04.service';
import { requireRole } from '../b05/b05.guard';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getConfigs);
router.post('/', requireRole(['Administrator']), createConfig);
router.get('/:id', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getConfigById);
router.patch('/:id', requireRole(['Administrator']), updateConfig);

export default router;
