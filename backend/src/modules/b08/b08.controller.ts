import { Request, Response, NextFunction } from 'express';
import { B08Service } from './b08.service';

const service = new B08Service();

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const category = req.query.category as string;
    const limit = parseInt(req.query.limit as string || '10', 10);
    const offset = parseInt(req.query.offset as string || '0', 10);

    const result = await service.getProducts(user.role, user.id, category, limit, offset);
    res.json({
      success: true,
      data: result.items,
      pagination: { limit, offset, total: result.total },
    });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const product = await service.getProductById(req.params.id, user.role, user.id);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const product = await service.createProduct(req.body, user.role, user.id);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const product = await service.updateProduct(req.params.id, req.body, user.role, user.id);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};
