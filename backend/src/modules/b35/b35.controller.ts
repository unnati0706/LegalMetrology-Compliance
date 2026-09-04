import { Request, Response, NextFunction } from 'express';
import { B35Service } from './b35.service.js';
import { 
  QueueQuerySchema, 
  RefreshQueueSchema, 
  UpdateQueueItemSchema 
} from './b35.schemas.js';
import { AuthRequest } from '../../shared/auth/index.js';

export class B35Controller {
  constructor(private service: B35Service = new B35Service()) {}

  public getQueue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = QueueQuerySchema.parse(req.query);
      const result = await this.service.listQueueItems(query);

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

  public refreshQueue = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = RefreshQueueSchema.parse(req.body);
      const result = await this.service.refreshQueue(body, req.user!, req.ip);

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

  public getQueueItemById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const item = await this.service.getQueueItemById(id);

      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  public updateQueueItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const body = UpdateQueueItemSchema.parse(req.body);
      const updated = await this.service.updateQueueItem(id, body, req.user!, req.ip);

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  };
}
