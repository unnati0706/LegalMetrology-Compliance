import { getAuditLogs, AuditLogEntry, recordAuditLog } from '../../shared/audit';

export class B12Repository {
  async queryAuditTrail(filters: { actorId?: string; entityType?: string; entityId?: string; action?: string; fromDate?: string; toDate?: string; limit?: number; offset?: number }) {
    const limit = filters.limit || 10;
    const offset = filters.offset || 0;
    let logs = getAuditLogs();

    if (filters.actorId) {
      logs = logs.filter((l) => l.userId === filters.actorId);
    }
    if (filters.entityType) {
      logs = logs.filter((l) => l.entityType === filters.entityType);
    }
    if (filters.entityId) {
      logs = logs.filter((l) => l.entityId === filters.entityId);
    }
    if (filters.action) {
      logs = logs.filter((l) => l.action.toLowerCase() === filters.action!.toLowerCase());
    }
    if (filters.fromDate) {
      const from = new Date(filters.fromDate).getTime();
      logs = logs.filter((l) => new Date(l.createdAt).getTime() >= from);
    }
    if (filters.toDate) {
      const to = new Date(filters.toDate).getTime();
      logs = logs.filter((l) => new Date(l.createdAt).getTime() <= to);
    }

    logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      items: logs.slice(offset, offset + limit),
      total: logs.length,
    };
  }

  async findById(id: string): Promise<AuditLogEntry | null> {
    const logs = getAuditLogs();
    return logs.find((l) => l.id === id) || null;
  }
}
