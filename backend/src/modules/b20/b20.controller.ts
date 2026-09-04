import { Request, Response, NextFunction } from 'express';
import { B20Service } from './b20.service';

const service = new B20Service();

export const getApplicableRules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = (req.query.category as string) || 'ALL';
    const version = req.query.ruleVersion as string;
    const inspectionDate = req.query.inspectionDate as string;

    const rules = await service.getApplicableRules(category, version, inspectionDate);
    res.json({ success: true, data: rules });
  } catch (err) {
    next(err);
  }
};

export const getApplicabilityById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getApplicabilityById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const evaluateApplicability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const result = await service.evaluateApplicability(req.body, userId);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
