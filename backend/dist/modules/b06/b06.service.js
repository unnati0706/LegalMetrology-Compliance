"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.B06Service = void 0;
const b06_repository_1 = require("./b06.repository");
const errors_1 = require("../../shared/errors");
class B06Service {
    repo = new b06_repository_1.B06Repository();
    async getAuditLogs(entityType, entityId, limit = 10, offset = 0) {
        return this.repo.findAll({ entityType, entityId, limit, offset });
    }
    async getAuditLogById(id) {
        const record = await this.repo.findById(id);
        if (!record) {
            throw new errors_1.NotFoundError('06', 'AuditLog');
        }
        return record;
    }
    async createAuditLog(payload, userId) {
        if (!payload.action || !payload.entityType || !payload.entityId) {
            throw new errors_1.ValidationError('action, entityType, and entityId are required');
        }
        return this.repo.create({ ...payload, userId });
    }
    async updateAuditLogReason(id, reason) {
        if (!reason || typeof reason !== 'string') {
            throw new errors_1.ValidationError('Reason must be a non-empty string');
        }
        const updated = await this.repo.updateReason(id, reason);
        if (!updated) {
            throw new errors_1.NotFoundError('06', 'AuditLog');
        }
        return updated;
    }
}
exports.B06Service = B06Service;
