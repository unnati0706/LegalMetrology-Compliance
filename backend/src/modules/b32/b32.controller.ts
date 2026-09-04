import { Request, Response, NextFunction } from 'express';
import { B32Service } from './b32.service.js';
import { 
  PatternQuerySchema, 
  TriggerScanSchema, 
  UpdatePatternStatusSchema 
} from './b32.schemas.js';
import { AuthRequest } from '../../shared/auth/index.js';

export class B32Controller {
  constructor(private service: B32Service = new B32Service()) {}

  public getPatterns = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = PatternQuerySchema.parse(req.query);
      const result = await this.service.listPatterns(query);

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

  public triggerScan = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = TriggerScanSchema.parse(req.body);
      const result = await this.service.triggerPatternScan(body, req.user!, req.ip);

      res.status(201).json({
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  };

  public getPatternById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const pattern = await this.service.getPatternById(id);

      res.status(200).json({
        success: true,
        data: pattern,
      });
    } catch (err) {
      next(err);
    }
  };

  public updatePatternStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const body = UpdatePatternStatusSchema.parse(req.body);
      const updated = await this.service.updatePatternStatus(id, body, req.user!, req.ip);

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  };
}
