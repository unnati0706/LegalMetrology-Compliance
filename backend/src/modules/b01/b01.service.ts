import { B01Repository, ConfigEntity } from './b01.repository';
import { NotFoundError, ValidationError } from '../../shared/errors';
import { recordAuditLog } from '../../shared/audit';

export class B01Service {
  private repo = new B01Repository();

  async getConfigs(limit = 10, offset = 0) {
    return this.repo.findAll(limit, offset);
  }

  async getConfigById(id: string): Promise<ConfigEntity> {
    const config = await this.repo.findById(id);
    if (!config) {
      throw new NotFoundError('01', 'Configuration');
    }
    return config;
  }

  async createConfig(payload: { key: string; value: any; description?: string }, userId?: string): Promise<ConfigEntity> {
    if (!payload.key || typeof payload.key !== 'string') {
      throw new ValidationError('Key is required and must be a string');
    }

    const created = await this.repo.create(payload);
    recordAuditLog({
      userId,
      action: 'CREATE_CONFIG',
      entityType: 'Config',
      entityId: created.id,
      newValue: created,
    });
    return created;
  }

  async updateConfig(id: string, updates: { value?: any; description?: string }, userId?: string): Promise<ConfigEntity> {
    const existing = await this.getConfigById(id);
    const updated = await this.repo.update(id, updates);
    if (!updated) {
      throw new NotFoundError('01', 'Configuration');
    }
    recordAuditLog({
      userId,
      action: 'UPDATE_CONFIG',
      entityType: 'Config',
      entityId: updated.id,
      previousValue: existing,
      newValue: updated,
    });
    return updated;
  }
}
