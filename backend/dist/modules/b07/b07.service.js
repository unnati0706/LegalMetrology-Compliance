"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.B07Service = void 0;
const b07_repository_1 = require("./b07.repository");
const errors_1 = require("../../shared/errors");
const audit_1 = require("../../shared/audit");
class B07Service {
    repo = new b07_repository_1.B07Repository();
    async getUsers(role, status, limit = 10, offset = 0) {
        return this.repo.findAll({ role, status, limit, offset });
    }
    async getUserById(id) {
        const user = await this.repo.findById(id);
        if (!user) {
            throw new errors_1.NotFoundError('07', 'User');
        }
        return user;
    }
    async createUser(payload, actingUserId) {
        if (!payload.username || !payload.email) {
            throw new errors_1.ValidationError('Username and email are required');
        }
        const created = await this.repo.create(payload);
        (0, audit_1.recordAuditLog)({
            userId: actingUserId,
            action: 'INVITE_USER',
            entityType: 'User',
            entityId: created.id,
            newValue: created,
        });
        return created;
    }
    async updateUser(id, updates, actingUserId) {
        const previous = await this.getUserById(id);
        const updated = await this.repo.update(id, updates);
        if (!updated) {
            throw new errors_1.NotFoundError('07', 'User');
        }
        (0, audit_1.recordAuditLog)({
            userId: actingUserId,
            action: 'UPDATE_USER_STATUS',
            entityType: 'User',
            entityId: id,
            previousValue: previous,
            newValue: updated,
        });
        return updated;
    }
}
exports.B07Service = B07Service;
