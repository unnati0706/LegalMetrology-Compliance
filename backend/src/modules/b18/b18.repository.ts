import { B16Repository, DeclarationEntity } from '../b16/b16.repository';

export class B18Repository {
  private repo16 = new B16Repository();

  async findById(id: string): Promise<DeclarationEntity | null> {
    return this.repo16.findById(id);
  }

  async findAll(filters: { inspectionId?: string; limit?: number; offset?: number }) {
    return this.repo16.findAll(filters);
  }

  async applyManualCorrection(id: string, updates: { normalizedFields?: any; reason: string; verifiedBy: string }): Promise<DeclarationEntity | null> {
    const existing = await this.repo16.findById(id);
    if (!existing) return null;

    existing.normalizedFields = {
      ...existing.normalizedFields,
      ...(updates.normalizedFields || {}),
    };
    existing.isManuallyVerified = true;
    existing.manualOverrideReason = updates.reason;
    existing.verifiedBy = updates.verifiedBy;
    existing.updatedAt = new Date().toISOString();

    return existing;
  }

  async updateConfidences(id: string, confidences: Record<string, number>, overallConfidence: number): Promise<DeclarationEntity | null> {
    const existing = await this.repo16.findById(id);
    if (!existing) return null;

    existing.fieldConfidences = confidences;
    existing.overallConfidence = overallConfidence;
    existing.updatedAt = new Date().toISOString();

    return existing;
  }
}
