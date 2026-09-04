"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.B02Service = void 0;
const b02_repository_1 = require("./b02.repository");
const errors_1 = require("../../shared/errors");
const audit_1 = require("../../shared/audit");
class B02Service {
    repo = new b02_repository_1.B02Repository();
    async getDatabaseInfo() {
        return this.repo.getTables();
    }
    async getTableMeta(id) {
        const table = await this.repo.getTableById(id);
        if (!table) {
            throw new errors_1.NotFoundError('02', 'Table Metadata');
        }
        return table;
    }
    async syncSchema(userId) {
        const info = await this.repo.getTables();
        (0, audit_1.recordAuditLog)({
            userId,
            action: 'SYNC_SCHEMA',
            entityType: 'DatabaseSchema',
            entityId: 'global',
            newValue: { timestamp: new Date().toISOString() },
        });
        return { synced: true, tablesCount: info.tables.length };
    }
}
exports.B02Service = B02Service;
