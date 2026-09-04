import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/index.js';
import { AuditLog } from '../types/index.js';

export interface RecordAuditParams {
  userId: string;
  action: string;
  objectType: string;
  objectId: string;
  previousValue?: Record<string, any> | null;
  newValue?: Record<string, any> | null;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  public static async log(params: RecordAuditParams): Promise<AuditLog> {
    const entry: AuditLog = {
      id: uuidv4(),
      userId: params.userId,
      action: params.action,
      objectType: params.objectType,
      objectId: params.objectId,
      previousValue: params.previousValue ? JSON.parse(JSON.stringify(params.previousValue)) : null,
      newValue: params.newValue ? JSON.parse(JSON.stringify(params.newValue)) : null,
      reason: params.reason,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      timestamp: new Date(),
    };

    db.store.auditLogs.push(entry);
    return entry;
  }

  public static getLogs(filter?: { objectType?: string; objectId?: string; userId?: string }): AuditLog[] {
    let logs = [...db.store.auditLogs];
    if (filter?.objectType) {
      logs = logs.filter(l => l.objectType === filter.objectType);
    }
    if (filter?.objectId) {
      logs = logs.filter(l => l.objectId === filter.objectId);
    }
    if (filter?.userId) {
      logs = logs.filter(l => l.userId === filter.userId);
    }
    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}
