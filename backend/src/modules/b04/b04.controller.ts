import { Request, Response, NextFunction } from 'express';
import { B04Service } from './b04.service';

const service = new B04Service();

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await service.login(email, password);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const result = await service.refreshToken(refreshToken);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string || '10', 10);
    const offset = parseInt(req.query.offset as string || '0', 10);
    const result = await service.listUsers(limit, offset);
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
    const user = await service.registerUser(req.body, actingUserId);
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
