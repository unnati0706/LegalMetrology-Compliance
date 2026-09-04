import { getDbStatus } from '../../db';

export interface TableMeta {
  id: string;
  tableName: string;
  primaryKey: string;
  columns: string[];
  version: number;
}

const baseTables: TableMeta[] = [
  { id: 'tbl_users', tableName: 'users', primaryKey: 'id', columns: ['id', 'username', 'email', 'password_hash', 'role', 'created_at', 'updated_at', 'deleted_at'], version: 1 },
  { id: 'tbl_sessions', tableName: 'sessions', primaryKey: 'id', columns: ['id', 'user_id', 'refresh_token', 'expires_at', 'is_revoked', 'created_at', 'updated_at'], version: 1 },
  { id: 'tbl_roles', tableName: 'roles', primaryKey: 'id', columns: ['id', 'name', 'description', 'created_at', 'updated_at'], version: 1 },
  { id: 'tbl_permissions', tableName: 'permissions', primaryKey: 'id', columns: ['id', 'role_id', 'resource', 'action', 'created_at'], version: 1 },
  { id: 'tbl_configs', tableName: 'configs', primaryKey: 'id', columns: ['id', 'key', 'value', 'description', 'version', 'created_at', 'updated_at', 'deleted_at'], version: 1 },
];

export class B02Repository {
  async getTables() {
    return {
      dbStatus: getDbStatus(),
      tables: baseTables,
    };
  }

  async getTableById(id: string) {
    return baseTables.find((t) => t.id === id || t.tableName === id) || null;
  }
}
