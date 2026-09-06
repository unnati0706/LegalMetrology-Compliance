import { Request, Response, NextFunction } from 'express';
import { B17Service } from './b17.service';

const service = new B17Service();

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
    const decl = await service.getDeclarationById(req.params.id as string);
    res.json({ success: true, data: decl });
  } catch (err) {
    next(err);
  }
};

export const normalizeDeclaration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const decl = await service.normalizeDeclaration(req.body.declarationId || req.body.id, userId);
    res.status(201).json({ success: true, data: decl });
  } catch (err) {
    next(err);
  }
};

export const updateNormalizedFields = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const decl = await service.updateNormalizedFields(req.params.id as string, req.body, userId);
    res.json({ success: true, data: decl });
  } catch (err) {
    next(err);
  }
};
