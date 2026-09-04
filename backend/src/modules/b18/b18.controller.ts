import { Request, Response, NextFunction } from 'express';
import { B18Service } from './b18.service';

const service = new B18Service();

export const getDeclarations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const inspectionId = req.query.inspectionId as string;
    const limit = parseInt(req.query.limit as string || '10', 10);
    const offset = parseInt(req.query.offset as string || '0', 10);

    const result = await service.getDeclarations(inspectionId, limit, offset);
    res.json({
      success: true,
      data: result.items,
      pagination: { limit, offset, total: result.total },
    });
  } catch (err) {
    next(err);
  }
};

export const getDeclarationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const decl = await service.getDeclarationById(req.params.id);
    res.json({ success: true, data: decl });
  } catch (err) {
    next(err);
  }
};

export const evaluateConfidence = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const declarationId = req.body.declarationId || req.body.id;
    const result = await service.evaluateConfidence(declarationId, req.body.confidences, userId);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const applyManualCorrection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const decl = await service.applyManualCorrection(req.params.id, req.body, userId);
    res.json({ success: true, data: decl });
  } catch (err) {
    next(err);
  }
};
