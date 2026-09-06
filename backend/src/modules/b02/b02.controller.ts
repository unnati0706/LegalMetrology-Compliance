import { Request, Response, NextFunction } from 'express';
import { B02Service } from './b02.service';

const service = new B02Service();

export const getDatabaseInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getDatabaseInfo();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getTableMeta = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getTableMeta(req.params.id as string);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const syncSchema = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const data = await service.syncSchema(userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
