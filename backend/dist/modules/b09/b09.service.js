"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.B09Service = void 0;
const b09_repository_1 = require("./b09.repository");
const errors_1 = require("../../shared/errors");
const audit_1 = require("../../shared/audit");
const validTransitions = {
    draft: ['processing'],
    processing: ['reviewed'],
    reviewed: ['finalized'],
    finalized: [], // Finalized state is terminal
};
class B09Service {
    repo = new b09_repository_1.B09Repository();
    async getInspections(userRole, userId, status, limit = 10, offset = 0) {
        const manufacturerIdFilter = userRole === 'Manufacturer' ? userId : undefined;
        const inspectorIdFilter = userRole === 'Inspector' ? userId : undefined;
        return this.repo.findAll({ status, manufacturerId: manufacturerIdFilter, inspectorId: inspectorIdFilter, limit, offset });
    }
    async getInspectionById(id, userRole, userId) {
        const inspection = await this.repo.findById(id);
        if (!inspection) {
            throw new errors_1.NotFoundError('09', 'Inspection');
        }
        if (userRole === 'Manufacturer' && inspection.manufacturerId !== userId) {
            throw new errors_1.PermissionDeniedError('Manufacturer can only view their own product inspections');
        }
        return inspection;
    }
    async createInspection(payload, userRole, userId) {
        if (!payload.productId || !payload.manufacturerId) {
            throw new errors_1.ValidationError('productId and manufacturerId are required');
        }
        const created = await this.repo.create({
            productId: payload.productId,
            manufacturerId: payload.manufacturerId,
            inspectorId: userId,
            ruleVersion: payload.ruleVersion,
        });
        (0, audit_1.recordAuditLog)({
            userId,
            action: 'CREATE_INSPECTION',
            entityType: 'Inspection',
            entityId: created.id,
            newValue: created,
        });
        return created;
    }
    async updateInspection(id, updates, userRole, userId) {
        const current = await this.getInspectionById(id, userRole, userId);
        if (current.status === 'finalized') {
            throw new errors_1.InvalidStateTransitionError('Cannot update a finalized inspection');
        }
        if (updates.status && updates.status !== current.status) {
            const allowedNextStates = validTransitions[current.status] || [];
            if (!allowedNextStates.includes(updates.status)) {
                throw new errors_1.InvalidStateTransitionError(`Invalid state transition from '${current.status}' to '${updates.status}'. Allowed transitions: ${allowedNextStates.join(', ') || 'none'}`);
            }
        }
        const updated = await this.repo.update(id, updates);
        if (!updated) {
            throw new errors_1.NotFoundError('09', 'Inspection');
        }
        (0, audit_1.recordAuditLog)({
            userId,
            action: 'TRANSITION_INSPECTION_STATUS',
            entityType: 'Inspection',
            entityId: id,
            previousValue: current,
            newValue: updated,
        });
        return updated;
    }
}
exports.B09Service = B09Service;
