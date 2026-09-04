import { Request, Response, NextFunction } from 'express';
import { B06Service } from './b06.service';

const service = new B06Service();

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entityType = req.query.entityType as string;
    const entityId = req.query.entityId as string;
    const limit = parseInt(req.query.limit as string || '10', 10);
    const offset = parseInt(req.query.offset as string || '0', 10);

    const result = await service.getAuditLogs(entityType, entityId, limit, offset);
    res.json({
      success: true,
      data: result.items,
      pagination: { limit, offset, total: result.total },
    });
  } catch (err) {
    next(err);
  }
};

export const getAuditLogById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await service.getAuditLogById(req.params.id);
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

export const createAuditLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const record = await service.createAuditLog(req.body, userId);
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

export const updateAuditLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await service.updateAuditLogReason(req.params.id, req.body.reason);
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};
