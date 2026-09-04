import { v4 as uuidv4 } from 'uuid';

export interface AuditLogRecord {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  previousValue?: any;
  newValue?: any;
  reason?: string;
  createdAt: string;
}

const auditStore: Map<string, AuditLogRecord> = new Map();

export class B06Repository {
  async findAll(filters: { entityType?: string; entityId?: string; limit?: number; offset?: number }) {
    const limit = filters.limit || 10;
    const offset = filters.offset || 0;
    let list = Array.from(auditStore.values());

    if (filters.entityType) {
      list = list.filter((a) => a.entityType === filters.entityType);
    }
    if (filters.entityId) {
      list = list.filter((a) => a.entityId === filters.entityId);
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      items: list.slice(offset, offset + limit),
      total: list.length,
    };
  }

  async findById(id: string): Promise<AuditLogRecord | null> {
    return auditStore.get(id) || null;
  }

  async create(payload: { userId?: string; action: string; entityType: string; entityId: string; previousValue?: any; newValue?: any; reason?: string }): Promise<AuditLogRecord> {
    const id = uuidv4();
    const record: AuditLogRecord = {
      id,
      userId: payload.userId || 'system',
      action: payload.action,
      entityType: payload.entityType,
      entityId: payload.entityId,
      previousValue: payload.previousValue ?? null,
      newValue: payload.newValue ?? null,
      reason: payload.reason || undefined,
      createdAt: new Date().toISOString(),
    };
    auditStore.set(id, record);
    return record;
  }

  async updateReason(id: string, reason: string): Promise<AuditLogRecord | null> {
    const existing = auditStore.get(id);
    if (!existing) return null;

    const updated: AuditLogRecord = {
      ...existing,
      reason,
    };
    auditStore.set(id, updated);
    return updated;
  }
}
