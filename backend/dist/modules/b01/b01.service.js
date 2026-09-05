"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.B01Service = void 0;
const b01_repository_1 = require("./b01.repository");
const errors_1 = require("../../shared/errors");
const audit_1 = require("../../shared/audit");
class B01Service {
    repo = new b01_repository_1.B01Repository();
    async getConfigs(limit = 10, offset = 0) {
        return this.repo.findAll(limit, offset);
    }
    async getConfigById(id) {
        const config = await this.repo.findById(id);
        if (!config) {
            throw new errors_1.NotFoundError('01', 'Configuration');
        }
        return config;
    }
    async createConfig(payload, userId) {
        if (!payload.key || typeof payload.key !== 'string') {
            throw new errors_1.ValidationError('Key is required and must be a string');
        }
        const created = await this.repo.create(payload);
        (0, audit_1.recordAuditLog)({
            userId,
            action: 'CREATE_CONFIG',
            entityType: 'Config',
            entityId: created.id,
            newValue: created,
        });
        return created;
    }
    async updateConfig(id, updates, userId) {
        const existing = await this.getConfigById(id);
        const updated = await this.repo.update(id, updates);
        if (!updated) {
            throw new errors_1.NotFoundError('01', 'Configuration');
        }
        (0, audit_1.recordAuditLog)({
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
exports.B01Service = B01Service;
