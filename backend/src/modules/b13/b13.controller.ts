import { Request, Response, NextFunction } from 'express';
import { B13Service } from './b13.service';

const service = new B13Service();

export const getQualityResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const evidenceId = req.query.evidenceId as string;
    const limit = parseInt(req.query.limit as string || '10', 10);
    const offset = parseInt(req.query.offset as string || '0', 10);

    const result = await service.getQualityResults(evidenceId, limit, offset);
    res.json({
      success: true,
      data: result.items,
      pagination: { limit, offset, total: result.total },
    });
  } catch (err) {
    next(err);
  }
};

export const getQualityById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quality = await service.getQualityById(req.params.id as string);
    res.json({ success: true, data: quality });
  } catch (err) {
    next(err);
  }
};

export const analyzeQuality = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const quality = await service.analyzeQuality(req.body, userId);
    res.status(201).json({ success: true, data: quality });
  } catch (err) {
    next(err);
  }
};

export const updateQualityFlags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const quality = await service.updateQualityFlags(req.params.id as string, req.body.flags, userId);
    res.json({ success: true, data: quality });
  } catch (err) {
    next(err);
  }
};
