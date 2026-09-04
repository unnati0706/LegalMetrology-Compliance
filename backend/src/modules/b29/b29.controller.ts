import { Request, Response, NextFunction } from 'express';
import { B29Service } from './b29.service.js';
import { ApiResponse } from '../../shared/types/index.js';

export class B29Controller {
  constructor(private service: B29Service = new B29Service()) {}

  public generate = async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id || 'usr-inspector-default';
      const report = await this.service.generateReport(req.body, userId);
      res.status(201).json({
        success: true,
        data: report,
      });
    } catch (err) {
      next(err);
    }
  };

  public list = async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const { inspectionId, format, status, page, limit, sortBy, sortOrder } = req.query as any;
      const { items, total } = await this.service.listReports({
        inspectionId,
        format,
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
      const report = await this.service.getReportById(id);
      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (err) {
      next(err);
    }
  };

  public update = async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const userId = req.user?.id || 'usr-inspector-default';
      const updated = await this.service.updateReport(id, req.body, userId);
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  };
}
