import { Request, Response, NextFunction } from 'express';
import { B27Service } from './b27.service.js';
import { ApiResponse } from '../../shared/types/index.js';

export class B27Controller {
  constructor(private service: B27Service = new B27Service()) {}

  public list = async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const {
        productName,
        category,
        brand,
        status,
        inspectorId,
        manufacturerId,
        startDate,
        endDate,
        page,
        limit,
        sortBy,
        sortOrder
      } = req.query as any;

      const { items, total } = await this.service.searchInspections({
        productName,
        category,
        brand,
        status,
        inspectorId,
        manufacturerId,
        startDate,
        endDate,
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

  public create = async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const inspectorId = req.user?.id || 'usr-inspector-default';
      const inspection = await this.service.createInspection(req.body, inspectorId);
      res.status(201).json({
        success: true,
        data: inspection,
      });
    } catch (err) {
      next(err);
    }
  };

  public getById = async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const details = await this.service.getInspectionDetails(id);
      res.status(200).json({
        success: true,
        data: details,
      });
    } catch (err) {
      next(err);
    }
  };

  public update = async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const userId = req.user?.id || 'usr-inspector-default';
      const updated = await this.service.updateInspection(id, req.body, userId);
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  };
}
