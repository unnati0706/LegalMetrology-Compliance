import { Request, Response, NextFunction } from 'express';
import { B19Service } from './b19.service';

const service = new B19Service();

export const getRules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = req.query.category as string;
    const version = req.query.version as string;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
    const limit = parseInt(req.query.limit as string || '10', 10);
    const offset = parseInt(req.query.offset as string || '0', 10);

    const result = await service.getRules(category, version, isActive, limit, offset);
    res.json({
      success: true,
      data: result.items,
      pagination: { limit, offset, total: result.total },
    });
  } catch (err) {
    next(err);
  }
};

export const getRuleById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rule = await service.getRuleById(req.params.id as string);
    res.json({ success: true, data: rule });
  } catch (err) {
    next(err);
  }
};

export const createRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const rule = await service.createRule(req.body, user.role, user.id);
    res.status(201).json({ success: true, data: rule });
  } catch (err) {
    next(err);
  }
};

export const updateRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const rule = await service.updateRuleVersion(req.params.id as string, req.body, user.role, user.id);
    res.json({ success: true, data: rule });
  } catch (err) {
    next(err);
  }
};
