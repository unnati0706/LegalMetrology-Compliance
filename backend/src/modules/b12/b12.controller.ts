import { Request, Response, NextFunction } from 'express';
import { B12Service } from './b12.service';

const service = new B12Service();

export const queryLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actorId = req.query.actorId as string;
    const entityType = req.query.entityType as string;
    const entityId = req.query.entityId as string;
    const action = req.query.action as string;
    const fromDate = req.query.fromDate as string;
    const toDate = req.query.toDate as string;
    const limit = parseInt(req.query.limit as string || '10', 10);
    const offset = parseInt(req.query.offset as string || '0', 10);

    const result = await service.queryLogs(actorId, entityType, entityId, action, fromDate, toDate, limit, offset);
    res.json({
      success: true,
      data: result.items,
      pagination: { limit, offset, total: result.total },
    });
  } catch (err) {
    next(err);
  }
};

export const getLogById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const log = await service.getLogById(req.params.id as string);
    res.json({ success: true, data: log });
  } catch (err) {
    next(err);
  }
};

export const exportSnapshot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const snapshot = await service.exportAuditSnapshot(req.body.reason, userId);
    res.status(201).json({ success: true, data: snapshot });
  } catch (err) {
    next(err);
  }
};

export const annotateLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const log = await service.annotateLog(req.params.id as string, req.body.reason, userId);
    res.json({ success: true, data: log });
  } catch (err) {
    next(err);
  }
};
