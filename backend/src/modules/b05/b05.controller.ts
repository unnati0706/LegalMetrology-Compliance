import { Request, Response, NextFunction } from 'express';
import { B05Service } from './b05.service';

const service = new B05Service();

export const getRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await service.getRoles();
    res.json({ success: true, data: roles });
  } catch (err) {
    next(err);
  }
};

export const getRoleById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = await service.getRoleById(req.params.id);
    res.json({ success: true, data: role });
  } catch (err) {
    next(err);
  }
};

export const createRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const role = await service.createRole(req.body, userId);
    res.status(201).json({ success: true, data: role });
  } catch (err) {
    next(err);
  }
};

export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const role = await service.updateRole(req.params.id, req.body, userId);
    res.json({ success: true, data: role });
  } catch (err) {
    next(err);
  }
};
