import { Request, Response, NextFunction } from 'express';
import { B31Service } from './b31.service.js';
import { 
  AnalyticsQuerySchema, 
  GenerateSnapshotSchema, 
  UpdateSnapshotSchema 
} from './b31.schemas.js';
import { AuthRequest } from '../../shared/auth/index.js';

export class B31Controller {
  constructor(private service: B31Service = new B31Service()) {}

  public getAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = AnalyticsQuerySchema.parse(req.query);
      const kpis = await this.service.computeKPIs(query);
      const snapshots = await this.service.listSnapshots(query.page, query.limit);

      res.status(200).json({
        success: true,
        data: {
          kpis,
          recentSnapshots: snapshots.items,
        },
        meta: {
          page: query.page,
          limit: query.limit,
          totalSnapshots: snapshots.total,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  };

  public generateSnapshot = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = GenerateSnapshotSchema.parse(req.body);
      const snapshot = await this.service.generateSnapshot(body, req.user!, req.ip);

      res.status(201).json({
        success: true,
        data: snapshot,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  };

  public getSnapshotById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const snapshot = await this.service.getSnapshotById(id);

      res.status(200).json({
        success: true,
        data: snapshot,
      });
    } catch (err) {
      next(err);
    }
  };

  public updateSnapshot = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const body = UpdateSnapshotSchema.parse(req.body);
      const updated = await this.service.updateSnapshot(id, body, req.user!, req.ip);

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  };
}
