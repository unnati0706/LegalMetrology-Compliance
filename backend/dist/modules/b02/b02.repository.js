"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.B02Repository = void 0;
const db_1 = require("../../db");
const baseTables = [
    { id: 'tbl_users', tableName: 'users', primaryKey: 'id', columns: ['id', 'username', 'email', 'password_hash', 'role', 'created_at', 'updated_at', 'deleted_at'], version: 1 },
    { id: 'tbl_sessions', tableName: 'sessions', primaryKey: 'id', columns: ['id', 'user_id', 'refresh_token', 'expires_at', 'is_revoked', 'created_at', 'updated_at'], version: 1 },
    { id: 'tbl_roles', tableName: 'roles', primaryKey: 'id', columns: ['id', 'name', 'description', 'created_at', 'updated_at'], version: 1 },
    { id: 'tbl_permissions', tableName: 'permissions', primaryKey: 'id', columns: ['id', 'role_id', 'resource', 'action', 'created_at'], version: 1 },
    { id: 'tbl_configs', tableName: 'configs', primaryKey: 'id', columns: ['id', 'key', 'value', 'description', 'version', 'created_at', 'updated_at', 'deleted_at'], version: 1 },
];
class B02Repository {
    async getTables() {
        return {
            dbStatus: (0, db_1.getDbStatus)(),
            tables: baseTables,
        };
    }
    async getTableById(id) {
        return baseTables.find((t) => t.id === id || t.tableName === id) || null;
    }
}
exports.B02Repository = B02Repository;
