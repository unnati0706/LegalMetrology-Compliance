import { B06Repository, AuditLogRecord } from './b06.repository';
import { NotFoundError, ValidationError } from '../../shared/errors';

export class B06Service {
  private repo = new B06Repository();

  async getAuditLogs(entityType?: string, entityId?: string, limit = 10, offset = 0) {
    return this.repo.findAll({ entityType, entityId, limit, offset });
  }

  async getAuditLogById(id: string): Promise<AuditLogRecord> {
    const record = await this.repo.findById(id);
    if (!record) {
      throw new NotFoundError('06', 'AuditLog');
    }
    return record;
  }

  async createAuditLog(payload: { action: string; entityType: string; entityId: string; previousValue?: any; newValue?: any; reason?: string }, userId?: string): Promise<AuditLogRecord> {
    if (!payload.action || !payload.entityType || !payload.entityId) {
      throw new ValidationError('action, entityType, and entityId are required');
    }
    return this.repo.create({ ...payload, userId });
  }

  async updateAuditLogReason(id: string, reason: string): Promise<AuditLogRecord> {
    if (!reason || typeof reason !== 'string') {
      throw new ValidationError('Reason must be a non-empty string');
    }
    const updated = await this.repo.updateReason(id, reason);
    if (!updated) {
      throw new NotFoundError('06', 'AuditLog');
    }
    return updated;
  }
}
