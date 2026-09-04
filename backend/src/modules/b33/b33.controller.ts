import { Request, Response, NextFunction } from 'express';
import { B33Service } from './b33.service.js';
import { 
  GeoQuerySchema, 
  RecalculateGeoMetricsSchema, 
  UpdateGeoZoneSchema 
} from './b33.schemas.js';
import { AuthRequest } from '../../shared/auth/index.js';

export class B33Controller {
  constructor(private service: B33Service = new B33Service()) {}

  public getGeoZones = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = GeoQuerySchema.parse(req.query);
      const result = await this.service.listGeoZones(query);

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

  public recalculateZone = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = RecalculateGeoMetricsSchema.parse(req.body);
      const zone = await this.service.recalculateZoneMetrics(body, req.user!, req.ip);

      res.status(201).json({
        success: true,
        data: zone,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  };

  public getGeoZoneById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const zone = await this.service.getGeoZoneById(id);

      res.status(200).json({
        success: true,
        data: zone,
      });
    } catch (err) {
      next(err);
    }
  };

  public updateGeoZone = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const body = UpdateGeoZoneSchema.parse(req.body);
      const updated = await this.service.updateGeoZone(id, body, req.user!, req.ip);

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  };
}
