import { v4 as uuidv4 } from 'uuid';

export interface AuditLogPayload {
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  previousValue?: any;
  newValue?: any;
  reason?: string;
}

export interface AuditLogEntry extends AuditLogPayload {
  id: string;
  createdAt: string;
}

const auditLogsStore: AuditLogEntry[] = [];

export const recordAuditLog = (payload: AuditLogPayload): AuditLogEntry => {
  const entry: AuditLogEntry = {
    id: uuidv4(),
    userId: payload.userId || 'system',
    action: payload.action,
    entityType: payload.entityType,
    entityId: payload.entityId,
    previousValue: payload.previousValue ?? null,
    newValue: payload.newValue ?? null,
    reason: payload.reason || undefined,
    createdAt: new Date().toISOString(),
  };

  auditLogsStore.push(entry);
  return entry;
};

export const getAuditLogs = (entityType?: string, entityId?: string): AuditLogEntry[] => {
  return auditLogsStore.filter((log) => {
    if (entityType && log.entityType !== entityType) return false;
    if (entityId && log.entityId !== entityId) return false;
    return true;
  });
};
