import { Request, Response, NextFunction } from 'express';
import { B03Service } from './b03.service';

const service = new B03Service();

export const getSecuritySettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getSecuritySettings();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const updateSecuritySettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const data = await service.updateSecuritySettings(req.body, userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
