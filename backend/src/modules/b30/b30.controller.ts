import { Request, Response, NextFunction } from 'express';
import { B30Service } from './b30.service.js';
import { ApiResponse } from '../../shared/types/index.js';

export class B30Controller {
  constructor(private service: B30Service = new B30Service()) {}

  public listVersions = async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const { inspectionId, page, limit } = req.query as any;
      const { items, total } = await this.service.listReportVersions(
        inspectionId,
        Number(page) || 1,
        Number(limit) || 10
      );

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

  public createAmended = async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id || 'usr-inspector-default';
      const report = await this.service.createAmendedVersion(req.body, userId);
      res.status(201).json({
        success: true,
        data: report,
      });
    } catch (err) {
      next(err);
    }
  };

  public getById = async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const report = await this.service.getReportVersionById(id);
      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (err) {
      next(err);
    }
  };

  public compare = async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const id1 = req.params.id1 as string;
      const id2 = req.params.id2 as string;
      const diff = await this.service.compareVersions(id1, id2);
      res.status(200).json({
        success: true,
        data: diff,
      });
    } catch (err) {
      next(err);
    }
  };

  public update = async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const userId = req.user?.id || 'usr-inspector-default';
      const updated = await this.service.updateReportVersionMeta(id, req.body, userId);
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  };
}
