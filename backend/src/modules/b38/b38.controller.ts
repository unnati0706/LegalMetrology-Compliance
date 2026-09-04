import { Request, Response, NextFunction } from 'express';
import { B38Service } from './b38.service.js';
import { ApiResponse } from '../../shared/types/index.js';
import { AuthenticatedRequest } from '../../shared/auth/index.js';

export class B38Controller {
  constructor(private service: B38Service = new B38Service()) {}

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as any;
      const { penalties, total } = await this.service.listPenalties(query);

      const response: ApiResponse = {
        success: true,
        data: penalties,
        meta: {
          page: Number(query.page) || 1,
          limit: Number(query.limit) || 20,
          total,
          totalPages: Math.ceil(total / (Number(query.limit) || 20)),
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const penalty = await this.service.getPenaltyById(id);

      const response: ApiResponse = {
        success: true,
        data: penalty,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public assess = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const penalty = await this.service.assessPenalty(req.body, req.user!, req.ip);

      const response: ApiResponse = {
        success: true,
        data: penalty,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updatePayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const updated = await this.service.updatePayment(id, req.body, req.user!, req.ip);

      const response: ApiResponse = {
        success: true,
        data: updated,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
