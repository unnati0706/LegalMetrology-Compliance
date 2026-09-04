import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export interface UserLifecycleEntity {
  id: string;
  username: string;
  email: string;
  role: 'Administrator' | 'Inspector' | 'Supervisor' | 'Manufacturer';
  status: 'active' | 'invited' | 'suspended';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

const b07UsersStore: Map<string, UserLifecycleEntity> = new Map();

// Seed initial users
const seedB07Users = () => {
  if (b07UsersStore.size > 0) return;

  const users: UserLifecycleEntity[] = [
    { id: 'usr_admin', username: 'admin', email: 'admin@legalmetrology.gov.in', role: 'Administrator', status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null },
    { id: 'usr_inspector1', username: 'inspector1', email: 'inspector1@legalmetrology.gov.in', role: 'Inspector', status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null },
    { id: 'usr_supervisor1', username: 'supervisor1', email: 'supervisor1@legalmetrology.gov.in', role: 'Supervisor', status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null },
    { id: 'usr_mfr', username: 'mfr_nestle', email: 'compliance@nestle.com', role: 'Manufacturer', status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null },
  ];

  for (const u of users) {
    b07UsersStore.set(u.id, u);
  }
};

seedB07Users();

export class B07Repository {
  async findAll(filters: { role?: string; status?: string; limit?: number; offset?: number }) {
    seedB07Users();
    const limit = filters.limit || 10;
    const offset = filters.offset || 0;
    let list = Array.from(b07UsersStore.values()).filter((u) => !u.deletedAt);

    if (filters.role) {
      list = list.filter((u) => u.role === filters.role);
    }
    if (filters.status) {
      list = list.filter((u) => u.status === filters.status);
    }

    return {
      items: list.slice(offset, offset + limit),
      total: list.length,
    };
  }

  async findById(id: string): Promise<UserLifecycleEntity | null> {
    seedB07Users();
    const u = b07UsersStore.get(id);
    if (!u || u.deletedAt) return null;
    return u;
  }

  async create(data: { username: string; email: string; role: any; status?: 'active' | 'invited' | 'suspended' }): Promise<UserLifecycleEntity> {
    seedB07Users();
    const id = uuidv4();
    const newUser: UserLifecycleEntity = {
      id,
      username: data.username,
      email: data.email,
      role: data.role || 'Inspector',
      status: data.status || 'invited',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };
    b07UsersStore.set(id, newUser);
    return newUser;
  }

  async update(id: string, updates: Partial<UserLifecycleEntity>): Promise<UserLifecycleEntity | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated: UserLifecycleEntity = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    b07UsersStore.set(id, updated);
    return updated;
  }
}
