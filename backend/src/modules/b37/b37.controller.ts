import { Request, Response, NextFunction } from 'express';
import { B37Service } from './b37.service.js';
import { ApiResponse } from '../../shared/types/index.js';
import { AuthenticatedRequest } from '../../shared/auth/index.js';

export class B37Controller {
  constructor(private service: B37Service = new B37Service()) {}

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as any;
      const { appeals, total } = await this.service.listAppeals(query);

      const response: ApiResponse = {
        success: true,
        data: appeals,
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
      const appeal = await this.service.getAppealById(id);

      const response: ApiResponse = {
        success: true,
        data: appeal,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public submit = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appeal = await this.service.submitAppeal(req.body, req.user!, req.ip);

      const response: ApiResponse = {
        success: true,
        data: appeal,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public review = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const updated = await this.service.reviewAppeal(id, req.body, req.user!, req.ip);

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
