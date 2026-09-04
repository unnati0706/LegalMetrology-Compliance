import { Request, Response, NextFunction } from 'express';
import { B15Service } from './b15.service';

const service = new B15Service();

export const getDetections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const evidenceId = req.query.evidenceId as string;
    const regionType = req.query.regionType as string;
    const limit = parseInt(req.query.limit as string || '10', 10);
    const offset = parseInt(req.query.offset as string || '0', 10);

    const result = await service.getDetections(evidenceId, regionType, limit, offset);
    res.json({
      success: true,
      data: result.items,
      pagination: { limit, offset, total: result.total },
    });
  } catch (err) {
    next(err);
  }
};

export const getDetectionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.getDetectionById(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const processVision = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const result = await service.processVision(req.body, userId);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const updateBoundingBox = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const result = await service.updateBoundingBox(req.params.id, req.body.boundingBox, userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
