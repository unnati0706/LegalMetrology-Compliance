"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.B03Service = void 0;
const b03_repository_1 = require("./b03.repository");
const audit_1 = require("../../shared/audit");
class B03Service {
    repo = new b03_repository_1.B03Repository();
    async getSecuritySettings() {
        return this.repo.getSettings();
    }
    async updateSecuritySettings(updates, userId) {
        const previous = await this.repo.getSettings();
        const updated = await this.repo.updateSettings(updates);
        (0, audit_1.recordAuditLog)({
            userId,
            action: 'UPDATE_SECURITY_SETTINGS',
            entityType: 'SecurityConfig',
            entityId: updated.id,
            previousValue: previous,
            newValue: updated,
        });
        return updated;
    }
}
exports.B03Service = B03Service;
