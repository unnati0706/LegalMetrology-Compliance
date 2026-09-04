import { B27Repository } from './b27.repository.js';
import { AuditService } from '../../shared/audit/index.js';
import { ApiError } from '../../shared/errors/index.js';
import { Inspection, InspectionStatus } from '../../shared/types/index.js';

export class B27Service {
  constructor(private repo: B27Repository = new B27Repository()) {}

  public async searchInspections(query: {
    productName?: string;
    category?: string;
    brand?: string;
    status?: string;
    inspectorId?: string;
    manufacturerId?: string;
    startDate?: string;
    endDate?: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
  }) {
    return this.repo.findInspections(query);
  }

  public async createInspection(
    data: {
      productName: string;
      category: string;
      brand?: string;
      manufacturerId?: string;
      location?: string;
      ruleVersion?: string;
      metadata?: Record<string, any>;
    },
    inspectorId: string
  ): Promise<Inspection> {
    const inspection = this.repo.saveInspection({
      inspectorId,
      productName: data.productName.trim(),
      category: data.category.trim(),
      brand: data.brand?.trim(),
      manufacturerId: data.manufacturerId,
      location: data.location || 'Maharashtra, India',
      status: 'PENDING_ANALYSIS',
      ruleVersion: data.ruleVersion || 'PCR-2011-v2.0',
      metadata: data.metadata || {},
    });

    await AuditService.log({
      userId: inspectorId,
      action: 'B27_INSPECTION_CREATED',
      objectType: 'Inspection',
      objectId: inspection.id,
      newValue: inspection,
    });

    return inspection;
  }

  public async getInspectionDetails(id: string) {
    const details = this.repo.getInspectionDetails(id);
    if (!details) {
      throw ApiError.notFound('27_NOT_FOUND', `Inspection ${id} not found in history repository`);
    }
    return details;
  }

  public async updateInspection(
    id: string,
    updates: {
      productName?: string;
      category?: string;
      brand?: string;
      status?: InspectionStatus;
      location?: string;
      metadata?: Record<string, any>;
    },
    userId: string
  ): Promise<Inspection> {
    const existing = this.repo.findInspectionById(id);
    if (!existing) {
      throw ApiError.notFound('27_NOT_FOUND', `Inspection ${id} not found`);
    }

    // State transition guard: cannot complete if unresolved manual reviews exist
    if (updates.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
      if (this.repo.hasUnresolvedManualReviews(id)) {
        throw ApiError.conflict(
          'INVALID_STATE_TRANSITION',
          'Cannot finalize inspection: unresolved manual review items exist. Resolve or override all pending reviews first.'
        );
      }
    }

    const updated = this.repo.updateInspection(id, updates);

    await AuditService.log({
      userId,
      action: 'B27_INSPECTION_UPDATED',
      objectType: 'Inspection',
      objectId: id,
      previousValue: { status: existing.status, productName: existing.productName },
      newValue: updates,
    });

    return updated!;
  }
}
