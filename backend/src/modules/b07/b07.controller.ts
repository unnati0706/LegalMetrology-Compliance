import { Request, Response, NextFunction } from 'express';
import { B07Service } from './b07.service';

const service = new B07Service();

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = req.query.role as string;
    const status = req.query.status as string;
    const limit = parseInt(req.query.limit as string || '10', 10);
    const offset = parseInt(req.query.offset as string || '0', 10);

    const result = await service.getUsers(role, status, limit, offset);
    res.json({
      success: true,
      data: result.items,
      pagination: { limit, offset, total: result.total },
    });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await service.getUserById(req.params.id as string);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actingUserId = (req as any).user?.id;
    const user = await service.createUser(req.body, actingUserId);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actingUserId = (req as any).user?.id;
    const user = await service.updateUser(req.params.id as string, req.body, actingUserId);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
