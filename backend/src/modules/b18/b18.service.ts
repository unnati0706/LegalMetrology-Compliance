import { B18Repository } from './b18.repository';
import { DeclarationEntity } from '../b16/b16.repository';
import { NotFoundError, ValidationError } from '../../shared/errors';
import { recordAuditLog } from '../../shared/audit';

export class B18Service {
  private repo = new B18Repository();

  async getDeclarations(inspectionId?: string, limit = 10, offset = 0) {
    return this.repo.findAll({ inspectionId, limit, offset });
  }

  async getDeclarationById(id: string): Promise<DeclarationEntity> {
    const decl = await this.repo.findById(id);
    if (!decl) {
      throw new NotFoundError('18', 'Declaration');
    }
    return decl;
  }

  async evaluateConfidence(id: string, confidences?: Record<string, number>, userId?: string): Promise<{ declaration: DeclarationEntity; requiresManualReview: boolean }> {
    const decl = await this.getDeclarationById(id);
    const scores = confidences || decl.fieldConfidences || { mrp: 0.90, netQuantity: 0.90 };

    const values = Object.values(scores);
    const sum = values.reduce((a, b) => a + b, 0);
    const overall = parseFloat((sum / (values.length || 1)).toFixed(2));

    const updated = await this.repo.updateConfidences(id, scores, overall);
    if (!updated) {
      throw new NotFoundError('18', 'Declaration');
    }

    const hasLowConfidence = values.some((val) => val < 0.60);

    recordAuditLog({
      userId,
      action: 'EVALUATE_FIELD_CONFIDENCE',
      entityType: 'Declaration',
      entityId: id,
      newValue: { overallConfidence: overall, requiresManualReview: hasLowConfidence },
    });

    return {
      declaration: updated,
      requiresManualReview: hasLowConfidence,
    };
  }

  async applyManualCorrection(id: string, payload: { normalizedFields: any; reason: string }, userId: string): Promise<DeclarationEntity> {
    if (!payload.reason || typeof payload.reason !== 'string') {
      throw new ValidationError('A stated reason is mandatory when performing a manual override/correction');
    }

    const previous = await this.getDeclarationById(id);
    const updated = await this.repo.applyManualCorrection(id, {
      normalizedFields: payload.normalizedFields,
      reason: payload.reason,
      verifiedBy: userId,
    });

    if (!updated) {
      throw new NotFoundError('18', 'Declaration');
    }

    recordAuditLog({
      userId,
      action: 'MANUAL_DECLARATION_OVERRIDE',
      entityType: 'Declaration',
      entityId: id,
      reason: payload.reason,
      previousValue: previous.normalizedFields,
      newValue: updated.normalizedFields,
    });

    return updated;
  }
}
