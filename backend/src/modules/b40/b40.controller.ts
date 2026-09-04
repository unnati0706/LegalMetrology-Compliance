import { Request, Response, NextFunction } from 'express';
import { B40Service } from './b40.service.js';
import { ApiResponse } from '../../shared/types/index.js';
import { AuthenticatedRequest } from '../../shared/auth/index.js';

export class B40Controller {
  constructor(private service: B40Service = new B40Service()) {}

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as any;
      const { dossiers, total } = await this.service.listDossiers(query);

      const response: ApiResponse = {
        success: true,
        data: dossiers,
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
      const dossier = await this.service.getDossierById(id);

      const response: ApiResponse = {
        success: true,
        data: dossier,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public compile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dossier = await this.service.compileDossier(req.body, req.user!, req.ip);

      const response: ApiResponse = {
        success: true,
        data: dossier,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public transmit = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const updated = await this.service.transmitDossier(id, req.body, req.user!, req.ip);

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
