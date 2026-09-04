"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.B05Service = void 0;
const b05_repository_1 = require("./b05.repository");
const errors_1 = require("../../shared/errors");
const audit_1 = require("../../shared/audit");
class B05Service {
    repo = new b05_repository_1.B05Repository();
    async getRoles() {
        return this.repo.findAllRoles();
    }
    async getRoleById(id) {
        const role = await this.repo.findRoleById(id);
        if (!role) {
            throw new errors_1.NotFoundError('05', 'Role');
        }
        return role;
    }
    async createRole(data, userId) {
        if (!data.name || !data.description) {
            throw new errors_1.ValidationError('Name and description are required for a role');
        }
        const role = await this.repo.createRole(data);
        (0, audit_1.recordAuditLog)({
            userId,
            action: 'CREATE_ROLE',
            entityType: 'Role',
            entityId: role.id,
            newValue: role,
        });
        return role;
    }
    async updateRole(id, updates, userId) {
        const previous = await this.getRoleById(id);
        const updated = await this.repo.updateRole(id, updates);
        if (!updated) {
            throw new errors_1.NotFoundError('05', 'Role');
        }
        (0, audit_1.recordAuditLog)({
            userId,
            action: 'UPDATE_ROLE',
            entityType: 'Role',
            entityId: updated.id,
            previousValue: previous,
            newValue: updated,
        });
        return updated;
    }
}
exports.B05Service = B05Service;
