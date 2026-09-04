"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.B09Repository = void 0;
const uuid_1 = require("uuid");
const inspectionsStore = new Map();
// Seed initial inspection
const seedInspId = 'insp_001';
inspectionsStore.set(seedInspId, {
    id: seedInspId,
    inspectionNumber: 'INSP-2026-0001',
    productId: 'prod_maggie_001',
    manufacturerId: 'usr_mfr',
    inspectorId: 'usr_inspector1',
    status: 'draft',
    overallResult: 'PENDING',
    riskScore: 12.5,
    ruleVersion: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
});
class B09Repository {
    async findAll(filters) {
        const limit = filters.limit || 10;
        const offset = filters.offset || 0;
        let list = Array.from(inspectionsStore.values()).filter((i) => !i.deletedAt);
        if (filters.status) {
            list = list.filter((i) => i.status === filters.status);
        }
        if (filters.manufacturerId) {
            list = list.filter((i) => i.manufacturerId === filters.manufacturerId);
        }
        if (filters.inspectorId) {
            list = list.filter((i) => i.inspectorId === filters.inspectorId);
        }
        return {
            items: list.slice(offset, offset + limit),
            total: list.length,
        };
    }
    async findById(id) {
        const i = inspectionsStore.get(id);
        if (!i || i.deletedAt)
            return null;
        return i;
    }
    async create(data) {
        const id = (0, uuid_1.v4)();
        const count = inspectionsStore.size + 1;
        const inspectionNumber = `INSP-2026-${count.toString().padStart(4, '0')}`;
        const inspection = {
            id,
            inspectionNumber,
            productId: data.productId,
            manufacturerId: data.manufacturerId,
            inspectorId: data.inspectorId,
            status: 'draft',
            overallResult: 'PENDING',
            riskScore: 0.0,
            ruleVersion: data.ruleVersion || '1.0.0',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
        };
        inspectionsStore.set(id, inspection);
        return inspection;
    }
    async update(id, updates) {
        const existing = await this.findById(id);
        if (!existing)
            return null;
        const updated = {
            ...existing,
            ...updates,
            ruleVersion: existing.ruleVersion, // Rule version is immutable once created
            updatedAt: new Date().toISOString(),
        };
        inspectionsStore.set(id, updated);
        return updated;
    }
}
exports.B09Repository = B09Repository;
