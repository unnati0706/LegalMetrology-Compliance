import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, getSampleProducts } from './b08.controller';
import { authenticateToken } from '../b04/b04.service';
import { requireRole } from '../b05/b05.guard';

const router = Router();

router.use(authenticateToken);

router.get('/samples', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getSampleProducts);
router.get('/', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getProducts);
router.post('/', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), createProduct);
router.get('/:id', requireRole(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), getProductById);
router.patch('/:id', requireRole(['Administrator', 'Supervisor', 'Manufacturer']), updateProduct);

export default router;
