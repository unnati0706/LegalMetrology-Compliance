"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.B06Repository = void 0;
const uuid_1 = require("uuid");
const auditStore = new Map();
class B06Repository {
    async findAll(filters) {
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
    async findById(id) {
        return auditStore.get(id) || null;
    }
    async create(payload) {
        const id = (0, uuid_1.v4)();
        const record = {
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
    async updateReason(id, reason) {
        const existing = auditStore.get(id);
        if (!existing)
            return null;
        const updated = {
            ...existing,
            reason,
        };
        auditStore.set(id, updated);
        return updated;
    }
}
exports.B06Repository = B06Repository;
