import { Request, Response, NextFunction } from 'express';
import { B28Service } from './b28.service.js';
import { ApiResponse } from '../../shared/types/index.js';

export class B28Controller {
  constructor(private service: B28Service = new B28Service()) {}

  public list = async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const { inspectionId, packageSide, minQuality, page, limit, sortBy, sortOrder } = req.query as any;
      const { items, total } = await this.service.listEvidence({
        inspectionId,
        packageSide,
        minQuality: minQuality !== undefined ? Number(minQuality) : undefined,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'DESC',
      });

      res.status(200).json({
        success: true,
        data: items,
        meta: {
          page: Number(page) || 1,
          limit: Number(limit) || 10,
          total,
          totalPages: Math.ceil(total / (Number(limit) || 10)),
          timestamp: new Date().toISOString(),
        }
      });
    } catch (err) {
      next(err);
    }
  };

  public add = async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id || 'usr-inspector-default';
      const evidence = await this.service.addEvidenceToLocker(req.body, userId);
      res.status(201).json({
        success: true,
        data: evidence,
      });
    } catch (err) {
      next(err);
    }
  };

  public getById = async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const evidence = await this.service.getEvidenceItemById(id);
      res.status(200).json({
        success: true,
        data: evidence,
      });
    } catch (err) {
      next(err);
    }
  };

  public update = async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const userId = req.user?.id || 'usr-inspector-default';
      const updated = await this.service.updateEvidence(id, req.body, userId);
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  };
}
