import { B16Repository, DeclarationEntity } from '../b16/b16.repository';

export class B17Repository {
  private repo16 = new B16Repository();

  async findById(id: string): Promise<DeclarationEntity | null> {
    return this.repo16.findById(id);
  }

  async findAll(filters: { inspectionId?: string; limit?: number; offset?: number }) {
    return this.repo16.findAll(filters);
  }

  async updateNormalizedFields(id: string, normalizedFields: any): Promise<DeclarationEntity | null> {
    const existing = await this.repo16.findById(id);
    if (!existing) return null;

    existing.normalizedFields = {
      ...existing.normalizedFields,
      ...normalizedFields,
    };
    existing.updatedAt = new Date().toISOString();
    return existing;
  }
}
