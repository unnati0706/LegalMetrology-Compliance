import { Request, Response, NextFunction } from 'express';
import { B39Service } from './b39.service.js';
import { ApiResponse } from '../../shared/types/index.js';
import { AuthenticatedRequest } from '../../shared/auth/index.js';

export class B39Controller {
  constructor(private service: B39Service = new B39Service()) {}

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as any;
      const { certifications, total } = await this.service.listCertifications(query);

      const response: ApiResponse = {
        success: true,
        data: certifications,
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
      const cert = await this.service.getCertificationById(id);

      const response: ApiResponse = {
        success: true,
        data: cert,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cert = await this.service.createSelfCertification(req.body, req.user!, req.ip);

      const response: ApiResponse = {
        success: true,
        data: cert,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const updated = await this.service.updateCertificationStatus(id, req.body, req.user!, req.ip);

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
