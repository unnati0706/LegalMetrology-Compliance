import { B05Repository } from './b05.repository';
import { NotFoundError, ValidationError } from '../../shared/errors';
import { recordAuditLog } from '../../shared/audit';

export class B05Service {
  private repo = new B05Repository();

  async getRoles() {
    return this.repo.findAllRoles();
  }

  async getRoleById(id: string) {
    const role = await this.repo.findRoleById(id);
    if (!role) {
      throw new NotFoundError('05', 'Role');
    }
    return role;
  }

  async createRole(data: { name: any; description: string; permissions: string[] }, userId?: string) {
    if (!data.name || !data.description) {
      throw new ValidationError('Name and description are required for a role');
    }
    const role = await this.repo.createRole(data);
    recordAuditLog({
      userId,
      action: 'CREATE_ROLE',
      entityType: 'Role',
      entityId: role.id,
      newValue: role,
    });
    return role;
  }

  async updateRole(id: string, updates: { description?: string; permissions?: string[] }, userId?: string) {
    const previous = await this.getRoleById(id);
    const updated = await this.repo.updateRole(id, updates);
    if (!updated) {
      throw new NotFoundError('05', 'Role');
    }
    recordAuditLog({
      userId,
      action: 'UPDATE_ROLE',
      entityType: 'Role',
      entityId: updated.id,
      previousValue: previous,
      newValue: updated,
    });
    return updated;
  }
}
