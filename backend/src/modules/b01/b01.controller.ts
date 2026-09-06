import { Request, Response, NextFunction } from 'express';
import { B01Service } from './b01.service';

const service = new B01Service();

export const getConfigs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string || '10', 10);
    const offset = parseInt(req.query.offset as string || '0', 10);
    const result = await service.getConfigs(limit, offset);
    res.json({
      success: true,
      data: result.items,
      pagination: { limit, offset, total: result.total },
    });
  } catch (err) {
    next(err);
  }
};

export const getConfigById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await service.getConfigById(req.params.id as string);
    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
};

export const createConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const config = await service.createConfig(req.body, userId);
    res.status(201).json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
};

export const updateConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const config = await service.updateConfig(req.params.id as string, req.body, userId);
    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
};
