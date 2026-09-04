"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.B07Repository = void 0;
const uuid_1 = require("uuid");
const b07UsersStore = new Map();
// Seed initial users
const seedB07Users = () => {
    if (b07UsersStore.size > 0)
        return;
    const users = [
        { id: 'usr_admin', username: 'admin', email: 'admin@legalmetrology.gov.in', role: 'Administrator', status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null },
        { id: 'usr_inspector1', username: 'inspector1', email: 'inspector1@legalmetrology.gov.in', role: 'Inspector', status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null },
        { id: 'usr_supervisor1', username: 'supervisor1', email: 'supervisor1@legalmetrology.gov.in', role: 'Supervisor', status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null },
        { id: 'usr_mfr', username: 'mfr_nestle', email: 'compliance@nestle.com', role: 'Manufacturer', status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null },
    ];
    for (const u of users) {
        b07UsersStore.set(u.id, u);
    }
};
seedB07Users();
class B07Repository {
    async findAll(filters) {
        seedB07Users();
        const limit = filters.limit || 10;
        const offset = filters.offset || 0;
        let list = Array.from(b07UsersStore.values()).filter((u) => !u.deletedAt);
        if (filters.role) {
            list = list.filter((u) => u.role === filters.role);
        }
        if (filters.status) {
            list = list.filter((u) => u.status === filters.status);
        }
        return {
            items: list.slice(offset, offset + limit),
            total: list.length,
        };
    }
    async findById(id) {
        seedB07Users();
        const u = b07UsersStore.get(id);
        if (!u || u.deletedAt)
            return null;
        return u;
    }
    async create(data) {
        seedB07Users();
        const id = (0, uuid_1.v4)();
        const newUser = {
            id,
            username: data.username,
            email: data.email,
            role: data.role || 'Inspector',
            status: data.status || 'invited',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
        };
        b07UsersStore.set(id, newUser);
        return newUser;
    }
    async update(id, updates) {
        const existing = await this.findById(id);
        if (!existing)
            return null;
        const updated = {
            ...existing,
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        b07UsersStore.set(id, updated);
        return updated;
    }
}
exports.B07Repository = B07Repository;
