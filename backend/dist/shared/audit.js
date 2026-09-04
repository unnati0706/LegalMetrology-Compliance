"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogs = exports.recordAuditLog = void 0;
const uuid_1 = require("uuid");
const auditLogsStore = [];
const recordAuditLog = (payload) => {
    const entry = {
        id: (0, uuid_1.v4)(),
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
exports.recordAuditLog = recordAuditLog;
const getAuditLogs = (entityType, entityId) => {
    return auditLogsStore.filter((log) => {
        if (entityType && log.entityType !== entityType)
            return false;
        if (entityId && log.entityId !== entityId)
            return false;
        return true;
    });
};
exports.getAuditLogs = getAuditLogs;
