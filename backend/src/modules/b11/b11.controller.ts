import { Request, Response, NextFunction } from 'express';
import { B11Service } from './b11.service';

const service = new B11Service();

export const getMetadataList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const inspectionId = req.query.inspectionId as string;
    const evidenceId = req.query.evidenceId as string;
    const limit = parseInt(req.query.limit as string || '10', 10);
    const offset = parseInt(req.query.offset as string || '0', 10);

    const result = await service.getMetadataList(inspectionId, evidenceId, limit, offset);
    res.json({
      success: true,
      data: result.items,
      pagination: { limit, offset, total: result.total },
    });
  } catch (err) {
    next(err);
  }
};

export const getMetadataById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metadata = await service.getMetadataById(req.params.id as string);
    res.json({ success: true, data: metadata });
  } catch (err) {
    next(err);
  }
};

export const createMetadata = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const metadata = await service.createMetadata(req.body, userId);
    res.status(201).json({ success: true, data: metadata });
  } catch (err) {
    next(err);
  }
};

export const updateMetadata = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const metadata = await service.updateMetadata(req.params.id as string, req.body, userId);
    res.json({ success: true, data: metadata });
  } catch (err) {
    next(err);
  }
};
