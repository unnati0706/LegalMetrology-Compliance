import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../../config';
import { B04Repository, UserEntity } from './b04.repository';
import { UnauthorizedError, NotFoundError, ValidationError } from '../../shared/errors';
import { recordAuditLog } from '../../shared/audit';

export interface JwtPayload {
  id: string;
  username: string;
  email: string;
  role: string;
}

export class B04Service {
  private repo = new B04Repository();

  async login(email: string, pass: string) {
    const user = await this.repo.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const match = await bcrypt.compare(pass, user.passwordHash);
    if (!match) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn as any });
    const refreshToken = jwt.sign({ id: user.id }, config.refreshTokenSecret, { expiresIn: config.refreshTokenExpiresIn as any });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await this.repo.createSession(user.id, refreshToken, expiresAt);

    recordAuditLog({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
    });

    const { passwordHash, ...userWithoutPassword } = user;
    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    };
  }

  async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, config.refreshTokenSecret) as { id: string };
      const session = await this.repo.findSessionByRefreshToken(token);
      if (!session) {
        throw new UnauthorizedError('Invalid or revoked refresh token');
      }

      const user = await this.repo.findUserById(decoded.id);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      const payload: JwtPayload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };

      const newAccessToken = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn as any });
      return { accessToken: newAccessToken };
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async registerUser(data: { username: string; email: string; password: string; role?: any }, actingUserId?: string) {
    if (!data.email || !data.password || !data.username) {
      throw new ValidationError('Username, email, and password are required');
    }

    const existing = await this.repo.findUserByEmail(data.email);
    if (existing) {
      throw new ValidationError('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.repo.createUser({
      username: data.username,
      email: data.email,
      passwordHash,
      role: data.role,
    });

    recordAuditLog({
      userId: actingUserId || user.id,
      action: 'USER_REGISTER',
      entityType: 'User',
      entityId: user.id,
      newValue: { id: user.id, username: user.username, role: user.role },
    });

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async listUsers(limit = 10, offset = 0) {
    const result = await this.repo.findAllUsers(limit, offset);
    const safeItems = result.items.map(({ passwordHash, ...safe }) => safe);
    return { items: safeItems, total: result.total };
  }

  async getUserById(id: string) {
    const user = await this.repo.findUserById(id);
    if (!user) {
      throw new NotFoundError('04', 'User');
    }
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async updateUser(id: string, updates: any, actingUserId?: string) {
    const previous = await this.getUserById(id);
    const updated = await this.repo.updateUser(id, updates);
    if (!updated) {
      throw new NotFoundError('04', 'User');
    }

    recordAuditLog({
      userId: actingUserId,
      action: 'UPDATE_USER',
      entityType: 'User',
      entityId: id,
      previousValue: previous,
      newValue: updated,
    });

    const { passwordHash, ...safeUser } = updated;
    return safeUser;
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(new UnauthorizedError('Bearer token is required'));
  }

  try {
    const user = jwt.verify(token, config.jwtSecret) as JwtPayload;
    (req as any).user = user;
    next();
  } catch (err) {
    return next(new UnauthorizedError('Invalid or expired access token'));
  }
};
