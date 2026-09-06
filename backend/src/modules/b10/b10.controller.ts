import { Request, Response, NextFunction } from 'express';
import { B10Service } from './b10.service';

const service = new B10Service();

export const getEvidenceList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const inspectionId = req.query.inspectionId as string;
    const limit = parseInt(req.query.limit as string || '10', 10);
    const offset = parseInt(req.query.offset as string || '0', 10);

    const result = await service.getEvidenceList(inspectionId, limit, offset);
    res.json({
      success: true,
      data: result.items,
      pagination: { limit, offset, total: result.total },
    });
  } catch (err) {
    next(err);
  }
};

export const getEvidenceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const evidence = await service.getEvidenceById(req.params.id as string);
    res.json({ success: true, data: evidence });
  } catch (err) {
    next(err);
  }
};

export const uploadEvidence = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const evidence = await service.uploadEvidence(req.body, user.id);
    res.status(201).json({ success: true, data: evidence });
  } catch (err) {
    next(err);
  }
};

export const updateEvidence = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const evidence = await service.updateEvidence(req.params.id as string, req.body, user.id);
    res.json({ success: true, data: evidence });
  } catch (err) {
    next(err);
  }
};
