"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.B05Repository = void 0;
const uuid_1 = require("uuid");
const rolesStore = new Map([
    [
        'role_admin',
        {
            id: 'role_admin',
            name: 'Administrator',
            description: 'System administrator with full write/read access to configuration, users, and rules',
            permissions: ['*'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ],
    [
        'role_inspector',
        {
            id: 'role_inspector',
            name: 'Inspector',
            description: 'Field officer performing packaging compliance checks and uploading evidence',
            permissions: ['inspection:read', 'inspection:write', 'declaration:read', 'evidence:write'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ],
    [
        'role_supervisor',
        {
            id: 'role_supervisor',
            name: 'Supervisor',
            description: 'Senior officer managing inspections, reviewing flags/overrides, and generating reports',
            permissions: ['inspection:read', 'inspection:write', 'override:review', 'report:generate'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ],
    [
        'role_manufacturer',
        {
            id: 'role_manufacturer',
            name: 'Manufacturer',
            description: 'Brand/Packer account accessing compliance reports for owned products',
            permissions: ['declaration:read', 'report:read'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ],
]);
class B05Repository {
    async findAllRoles() {
        return Array.from(rolesStore.values());
    }
    async findRoleById(id) {
        for (const r of rolesStore.values()) {
            if (r.id === id || r.name.toLowerCase() === id.toLowerCase()) {
                return r;
            }
        }
        return null;
    }
    async createRole(data) {
        const id = (0, uuid_1.v4)();
        const role = {
            id,
            name: data.name,
            description: data.description,
            permissions: data.permissions || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        rolesStore.set(id, role);
        return role;
    }
    async updateRole(id, updates) {
        const role = await this.findRoleById(id);
        if (!role)
            return null;
        const updated = {
            ...role,
            ...(updates.description ? { description: updates.description } : {}),
            ...(updates.permissions ? { permissions: updates.permissions } : {}),
            updatedAt: new Date().toISOString(),
        };
        rolesStore.set(role.id, updated);
        return updated;
    }
}
exports.B05Repository = B05Repository;
