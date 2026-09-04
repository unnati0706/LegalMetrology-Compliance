import { Router } from 'express';
import { getDatabaseInfo, getTableMeta, syncSchema } from './b02.controller';
import { authenticateToken } from '../b04/b04.service';
import { requireRole } from '../b05/b05.guard';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getDatabaseInfo);
router.post('/', requireRole(['Administrator']), syncSchema);
router.get('/:id', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getTableMeta);

export default router;
