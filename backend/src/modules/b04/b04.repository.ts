import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export interface UserEntity {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: 'Administrator' | 'Inspector' | 'Supervisor' | 'Manufacturer';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface SessionEntity {
  id: string;
  userId: string;
  refreshToken: string;
  expiresAt: string;
  isRevoked: boolean;
  createdAt: string;
  updatedAt: string;
}

const usersStore = new Map<string, UserEntity>();
const sessionsStore = new Map<string, SessionEntity>();

// Seed default users for testing & development
const seedUsers = async () => {
  if (usersStore.size > 0) return;

  const adminHash = await bcrypt.hash('AdminPass123!', 10);
  const adminId = uuidv4();
  usersStore.set(adminId, {
    id: adminId,
    username: 'admin',
    email: 'admin@legalmetrology.gov.in',
    passwordHash: adminHash,
    role: 'Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  });

  const inspectorHash = await bcrypt.hash('Inspector123!', 10);
  const inspectorId = uuidv4();
  usersStore.set(inspectorId, {
    id: inspectorId,
    username: 'inspector1',
    email: 'inspector1@legalmetrology.gov.in',
    passwordHash: inspectorHash,
    role: 'Inspector',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  });

  const supervisorHash = await bcrypt.hash('Supervisor123!', 10);
  const supervisorId = uuidv4();
  usersStore.set(supervisorId, {
    id: supervisorId,
    username: 'supervisor1',
    email: 'supervisor1@legalmetrology.gov.in',
    passwordHash: supervisorHash,
    role: 'Supervisor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  });

  const mfrHash = await bcrypt.hash('Manufacturer123!', 10);
  const mfrId = uuidv4();
  usersStore.set(mfrId, {
    id: mfrId,
    username: 'mfr_nestle',
    email: 'compliance@nestle.com',
    passwordHash: mfrHash,
    role: 'Manufacturer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  });
};

seedUsers();

export class B04Repository {
  async findUserByEmail(email: string): Promise<UserEntity | null> {
    await seedUsers();
    for (const u of usersStore.values()) {
      if (u.email.toLowerCase() === email.toLowerCase() && !u.deletedAt) {
        return u;
      }
    }
    return null;
  }

  async findUserById(id: string): Promise<UserEntity | null> {
    await seedUsers();
    const user = usersStore.get(id);
    if (!user || user.deletedAt) return null;
    return user;
  }

  async createUser(data: { username: string; email: string; passwordHash: string; role?: 'Administrator' | 'Inspector' | 'Supervisor' | 'Manufacturer' }): Promise<UserEntity> {
    const id = uuidv4();
    const newUser: UserEntity = {
      id,
      username: data.username,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role || 'Inspector',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };
    usersStore.set(id, newUser);
    return newUser;
  }

  async createSession(userId: string, refreshToken: string, expiresAt: string): Promise<SessionEntity> {
    const id = uuidv4();
    const session: SessionEntity = {
      id,
      userId,
      refreshToken,
      expiresAt,
      isRevoked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    sessionsStore.set(id, session);
    return session;
  }

  async findSessionByRefreshToken(refreshToken: string): Promise<SessionEntity | null> {
    for (const s of sessionsStore.values()) {
      if (s.refreshToken === refreshToken && !s.isRevoked) {
        return s;
      }
    }
    return null;
  }

  async revokeSession(sessionId: string): Promise<void> {
    const s = sessionsStore.get(sessionId);
    if (s) {
      s.isRevoked = true;
      s.updatedAt = new Date().toISOString();
    }
  }

  async findAllUsers(limit = 10, offset = 0): Promise<{ items: UserEntity[]; total: number }> {
    await seedUsers();
    const active = Array.from(usersStore.values()).filter((u) => !u.deletedAt);
    return {
      items: active.slice(offset, offset + limit),
      total: active.length,
    };
  }

  async updateUser(id: string, updates: { username?: string; email?: string; role?: any }): Promise<UserEntity | null> {
    const user = await this.findUserById(id);
    if (!user) return null;

    const updated: UserEntity = {
      ...user,
      ...(updates.username ? { username: updates.username } : {}),
      ...(updates.email ? { email: updates.email } : {}),
      ...(updates.role ? { role: updates.role } : {}),
      updatedAt: new Date().toISOString(),
    };
    usersStore.set(id, updated);
    return updated;
  }
}
