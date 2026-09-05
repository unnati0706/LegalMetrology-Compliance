import { B12Repository } from './b12.repository';
import { NotFoundError, ValidationError } from '../../shared/errors';
import { recordAuditLog } from '../../shared/audit';

export class B12Service {
  private repo = new B12Repository();

  async queryLogs(actorId?: string, entityType?: string, entityId?: string, action?: string, fromDate?: string, toDate?: string, limit = 10, offset = 0) {
    return this.repo.queryAuditTrail({ actorId, entityType, entityId, action, fromDate, toDate, limit, offset });
  }

  async getLogById(id: string) {
    const log = await this.repo.findById(id);
    if (!log) {
      throw new NotFoundError('12', 'AuditLog');
    }
    return log;
  }

  async exportAuditSnapshot(reason: string, userId: string) {
    if (!reason) {
      throw new ValidationError('Reason is required for exporting an audit trail snapshot');
    }
    const result = await this.repo.queryAuditTrail({ limit: 100 });
    recordAuditLog({
      userId,
      action: 'EXPORT_AUDIT_SNAPSHOT',
      entityType: 'AuditTrail',
      entityId: 'snapshot_' + Date.now(),
      reason,
      newValue: { count: result.total },
    });
    return {
      exportedAt: new Date().toISOString(),
      recordCount: result.total,
      snapshot: result.items,
    };
  }

  async annotateLog(id: string, reason: string, userId: string) {
    const log = await this.getLogById(id);
    if (!reason) {
      throw new ValidationError('Reason is required for annotating an audit log entry');
    }
    log.reason = reason;
    recordAuditLog({
      userId,
      action: 'ANNOTATE_AUDIT_LOG',
      entityType: 'AuditLog',
      entityId: id,
      reason,
    });
    return log;
  }
}
