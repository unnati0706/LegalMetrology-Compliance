import { v4 as uuidv4 } from 'uuid';

export type InspectionStatus = 'draft' | 'processing' | 'reviewed' | 'finalized';
export type InspectionResult = 'PASS' | 'FLAG' | 'MANUAL_REVIEW' | 'PENDING';

export interface InspectionEntity {
  id: string;
  inspectionNumber: string;
  productId: string;
  manufacturerId: string;
  inspectorId: string;
  status: InspectionStatus;
  overallResult: InspectionResult;
  riskScore: number;
  ruleVersion: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

const inspectionsStore: Map<string, InspectionEntity> = new Map();

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

export class B09Repository {
  async findAll(filters: { status?: string; manufacturerId?: string; inspectorId?: string; limit?: number; offset?: number }) {
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

  async findById(id: string): Promise<InspectionEntity | null> {
    const i = inspectionsStore.get(id);
    if (!i || i.deletedAt) return null;
    return i;
  }

  async create(data: { productId: string; manufacturerId: string; inspectorId: string; ruleVersion?: string }): Promise<InspectionEntity> {
    const id = uuidv4();
    const count = inspectionsStore.size + 1;
    const inspectionNumber = `INSP-2026-${count.toString().padStart(4, '0')}`;

    const inspection: InspectionEntity = {
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

  async update(id: string, updates: Partial<InspectionEntity>): Promise<InspectionEntity | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated: InspectionEntity = {
      ...existing,
      ...updates,
      ruleVersion: existing.ruleVersion, // Rule version is immutable once created
      updatedAt: new Date().toISOString(),
    };
    inspectionsStore.set(id, updated);
    return updated;
  }
}
