import { Request, Response, NextFunction } from 'express';
import { B36Service } from './b36.service.js';
import { ApiResponse } from '../../shared/types/index.js';
import { AuthenticatedRequest } from '../../shared/auth/index.js';

export class B36Controller {
  constructor(private service: B36Service = new B36Service()) {}

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as any;
      const { notices, total } = await this.service.listNotices(query);

      const response: ApiResponse = {
        success: true,
        data: notices,
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
      const notice = await this.service.getNoticeById(id);

      const response: ApiResponse = {
        success: true,
        data: notice,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public issue = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const notice = await this.service.issueNotice(req.body, req.user!, req.ip);

      const response: ApiResponse = {
        success: true,
        data: notice,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const updated = await this.service.updateNoticeStatus(id, req.body, req.user!, req.ip);

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
