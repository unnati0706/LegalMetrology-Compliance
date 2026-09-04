import { Request, Response, NextFunction } from 'express';
import { B09Service } from './b09.service';

const service = new B09Service();

export const getInspections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const status = req.query.status as string;
    const limit = parseInt(req.query.limit as string || '10', 10);
    const offset = parseInt(req.query.offset as string || '0', 10);

    const result = await service.getInspections(user.role, user.id, status, limit, offset);
    res.json({
      success: true,
      data: result.items,
      pagination: { limit, offset, total: result.total },
    });
  } catch (err) {
    next(err);
  }
};

export const getInspectionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const inspection = await service.getInspectionById(req.params.id, user.role, user.id);
    res.json({ success: true, data: inspection });
  } catch (err) {
    next(err);
  }
};

export const createInspection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const inspection = await service.createInspection(req.body, user.role, user.id);
    res.status(201).json({ success: true, data: inspection });
  } catch (err) {
    next(err);
  }
};

export const updateInspection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const inspection = await service.updateInspection(req.params.id, req.body, user.role, user.id);
    res.json({ success: true, data: inspection });
  } catch (err) {
    next(err);
  }
};
