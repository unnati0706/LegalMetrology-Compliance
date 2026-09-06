import { Request, Response, NextFunction } from 'express';
import { B14Service } from './b14.service';

const service = new B14Service();

export const getOcrResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const evidenceId = req.query.evidenceId as string;
    const limit = parseInt(req.query.limit as string || '10', 10);
    const offset = parseInt(req.query.offset as string || '0', 10);

    const result = await service.getOcrResults(evidenceId, limit, offset);
    res.json({
      success: true,
      data: result.items,
      pagination: { limit, offset, total: result.total },
    });
  } catch (err) {
    next(err);
  }
};

export const getOcrById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.getOcrById(req.params.id as string);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const processOcr = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const result = await service.processOcr(req.body, userId);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const updateOcrText = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const result = await service.updateOcrText(req.params.id as string, req.body.rawText, userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
