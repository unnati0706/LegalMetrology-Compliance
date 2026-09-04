import { B07Repository, UserLifecycleEntity } from './b07.repository';
import { NotFoundError, ValidationError } from '../../shared/errors';
import { recordAuditLog } from '../../shared/audit';

export class B07Service {
  private repo = new B07Repository();

  async getUsers(role?: string, status?: string, limit = 10, offset = 0) {
    return this.repo.findAll({ role, status, limit, offset });
  }

  async getUserById(id: string): Promise<UserLifecycleEntity> {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundError('07', 'User');
    }
    return user;
  }

  async createUser(payload: { username: string; email: string; role: any; status?: 'active' | 'invited' | 'suspended' }, actingUserId?: string): Promise<UserLifecycleEntity> {
    if (!payload.username || !payload.email) {
      throw new ValidationError('Username and email are required');
    }

    const created = await this.repo.create(payload);
    recordAuditLog({
      userId: actingUserId,
      action: 'INVITE_USER',
      entityType: 'User',
      entityId: created.id,
      newValue: created,
    });
    return created;
  }

  async updateUser(id: string, updates: { username?: string; role?: any; status?: 'active' | 'invited' | 'suspended' }, actingUserId?: string): Promise<UserLifecycleEntity> {
    const previous = await this.getUserById(id);
    const updated = await this.repo.update(id, updates);
    if (!updated) {
      throw new NotFoundError('07', 'User');
    }

    recordAuditLog({
      userId: actingUserId,
      action: 'UPDATE_USER_STATUS',
      entityType: 'User',
      entityId: id,
      previousValue: previous,
      newValue: updated,
    });
    return updated;
  }
}
