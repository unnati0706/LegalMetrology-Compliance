import { Request, Response, NextFunction } from 'express';
import { B23Service } from './b23.service.js';
import { ApiResponse } from '../../shared/types/index.js';

export class B23Controller {
  constructor(private service: B23Service = new B23Service()) {}

  public evaluate = async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id || 'system-user';
      const result = await this.service.evaluateEntityAndConsumerCare(req.body, userId);
      res.status(200).json({
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          ruleVersion: result.ruleVersion,
        }
      });
    } catch (err) {
      next(err);
    }
  };

  public list = async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const { inspectionId, status, page, limit, sortBy, sortOrder } = req.query as any;
      const { items, total } = await this.service.listCheckResults({
        inspectionId,
        status,
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

  public getById = async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const item = await this.service.getCheckResultById(id);
      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  public update = async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { status, overrideReason } = req.body;
      const userId = req.user?.id || 'system-user';
      const updated = await this.service.overrideCheckResult(id, status, overrideReason, userId);
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  };
}
