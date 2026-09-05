"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.B01Repository = void 0;
const uuid_1 = require("uuid");
const configsInMemory = new Map();
// Seed initial system config
const defaultConfigId = (0, uuid_1.v4)();
configsInMemory.set(defaultConfigId, {
    id: defaultConfigId,
    key: 'SYSTEM_SETTINGS',
    value: { env: 'development', complianceVersion: '1.0.0', maxImageMB: 10 },
    description: 'Global system configuration settings',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
});
class B01Repository {
    async findAll(limit = 10, offset = 0) {
        const active = Array.from(configsInMemory.values()).filter((c) => !c.deletedAt);
        return {
            items: active.slice(offset, offset + limit),
            total: active.length,
        };
    }
    async findById(id) {
        const config = configsInMemory.get(id);
        if (!config || config.deletedAt)
            return null;
        return config;
    }
    async create(data) {
        const id = (0, uuid_1.v4)();
        const newConfig = {
            id,
            key: data.key,
            value: data.value,
            description: data.description,
            version: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
        };
        configsInMemory.set(id, newConfig);
        return newConfig;
    }
    async update(id, updates) {
        const existing = await this.findById(id);
        if (!existing)
            return null;
        const updated = {
            ...existing,
            ...(updates.value !== undefined ? { value: updates.value } : {}),
            ...(updates.description !== undefined ? { description: updates.description } : {}),
            version: existing.version + 1,
            updatedAt: new Date().toISOString(),
        };
        configsInMemory.set(id, updated);
        return updated;
    }
}
exports.B01Repository = B01Repository;
