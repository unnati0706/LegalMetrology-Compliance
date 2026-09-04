import { Request, Response, NextFunction } from 'express';
import { B26Service } from './b26.service.js';
import { ApiResponse } from '../../shared/types/index.js';

export class B26Controller {
  constructor(private service: B26Service = new B26Service()) {}

  public list = async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const { inspectionId, ruleCategory, status, minConfidence, maxConfidence, page, limit, sortBy, sortOrder } = req.query as any;
      const { items, total } = await this.service.getReviewQueue({
        inspectionId,
        ruleCategory,
        status: status || 'MANUAL_REVIEW',
        minConfidence: minConfidence !== undefined ? Number(minConfidence) : undefined,
        maxConfidence: maxConfidence !== undefined ? Number(maxConfidence) : undefined,
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
      const item = await this.service.getReviewItemById(id);
      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  public resolve = async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const userId = req.user?.id || 'system-inspector';
      const result = await this.service.resolveReviewItem(id, req.body, userId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  public batchAssign = async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id || 'system-inspector';
      const result = await this.service.batchAssignReviews(req.body, userId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
}
