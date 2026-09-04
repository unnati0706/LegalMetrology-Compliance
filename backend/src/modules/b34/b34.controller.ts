import { Request, Response, NextFunction } from 'express';
import { B34Service } from './b34.service.js';
import { 
  RiskProfileQuerySchema, 
  ComputeRiskProfileSchema, 
  OverrideRiskProfileSchema 
} from './b34.schemas.js';
import { AuthRequest } from '../../shared/auth/index.js';

export class B34Controller {
  constructor(private service: B34Service = new B34Service()) {}

  public getRiskProfiles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = RiskProfileQuerySchema.parse(req.query);
      const result = await this.service.listRiskProfiles(query);

      res.status(200).json({
        success: true,
        data: result.items,
        meta: {
          page: query.page,
          limit: query.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / query.limit),
        },
      });
    } catch (err) {
      next(err);
    }
  };

  public computeRisk = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = ComputeRiskProfileSchema.parse(req.body);
      const profile = await this.service.computeRiskProfile(body, req.user!, req.ip);

      res.status(201).json({
        success: true,
        data: profile,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  };

  public getRiskProfileById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const profile = await this.service.getRiskProfileById(id);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (err) {
      next(err);
    }
  };

  public overrideRisk = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const body = OverrideRiskProfileSchema.parse(req.body);
      const updated = await this.service.overrideRiskProfile(id, body, req.user!, req.ip);

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  };
}
