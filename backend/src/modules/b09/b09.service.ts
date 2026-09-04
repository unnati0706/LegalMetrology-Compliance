import { B09Repository, InspectionEntity, InspectionStatus, InspectionResult } from './b09.repository';
import { NotFoundError, ValidationError, InvalidStateTransitionError, PermissionDeniedError } from '../../shared/errors';
import { recordAuditLog } from '../../shared/audit';

const validTransitions: Record<InspectionStatus, InspectionStatus[]> = {
  draft: ['processing'],
  processing: ['reviewed'],
  reviewed: ['finalized'],
  finalized: [], // Finalized state is terminal
};

export class B09Service {
  private repo = new B09Repository();

  async getInspections(userRole: string, userId: string, status?: string, limit = 10, offset = 0) {
    const manufacturerIdFilter = userRole === 'Manufacturer' ? userId : undefined;
    const inspectorIdFilter = userRole === 'Inspector' ? userId : undefined;
    return this.repo.findAll({ status, manufacturerId: manufacturerIdFilter, inspectorId: inspectorIdFilter, limit, offset });
  }

  async getInspectionById(id: string, userRole: string, userId: string): Promise<InspectionEntity> {
    const inspection = await this.repo.findById(id);
    if (!inspection) {
      throw new NotFoundError('09', 'Inspection');
    }
    if (userRole === 'Manufacturer' && inspection.manufacturerId !== userId) {
      throw new PermissionDeniedError('Manufacturer can only view their own product inspections');
    }
    return inspection;
  }

  async createInspection(payload: { productId: string; manufacturerId: string; ruleVersion?: string }, userRole: string, userId: string): Promise<InspectionEntity> {
    if (!payload.productId || !payload.manufacturerId) {
      throw new ValidationError('productId and manufacturerId are required');
    }

    const created = await this.repo.create({
      productId: payload.productId,
      manufacturerId: payload.manufacturerId,
      inspectorId: userId,
      ruleVersion: payload.ruleVersion,
    });

    recordAuditLog({
      userId,
      action: 'CREATE_INSPECTION',
      entityType: 'Inspection',
      entityId: created.id,
      newValue: created,
    });

    return created;
  }

  async updateInspection(id: string, updates: { status?: InspectionStatus; overallResult?: InspectionResult; riskScore?: number }, userRole: string, userId: string): Promise<InspectionEntity> {
    const current = await this.getInspectionById(id, userRole, userId);

    if (current.status === 'finalized') {
      throw new InvalidStateTransitionError('Cannot update a finalized inspection');
    }

    if (updates.status && updates.status !== current.status) {
      const allowedNextStates = validTransitions[current.status] || [];
      if (!allowedNextStates.includes(updates.status)) {
        throw new InvalidStateTransitionError(`Invalid state transition from '${current.status}' to '${updates.status}'. Allowed transitions: ${allowedNextStates.join(', ') || 'none'}`);
      }
    }

    const updated = await this.repo.update(id, updates);
    if (!updated) {
      throw new NotFoundError('09', 'Inspection');
    }

    recordAuditLog({
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
