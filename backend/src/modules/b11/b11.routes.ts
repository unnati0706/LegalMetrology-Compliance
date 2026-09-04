import { Router } from 'express';
import { getMetadataList, getMetadataById, createMetadata, updateMetadata } from './b11.controller';
import { authenticateToken } from '../b04/b04.service';
import { requireRole } from '../b05/b05.guard';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getMetadataList);
router.post('/', requireRole(['Administrator', 'Inspector', 'Supervisor']), createMetadata);
router.get('/:id', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getMetadataById);
router.patch('/:id', requireRole(['Administrator', 'Inspector', 'Supervisor']), updateMetadata);

export default router;
