import { v4 as uuidv4 } from 'uuid';

export interface RawExtractedFields {
  mrpRaw?: string;
  netQuantityRaw?: string;
  mfgDateRaw?: string;
  expDateRaw?: string;
  manufacturerNameRaw?: string;
  addressRaw?: string;
  consumerCareRaw?: string;
}

export interface DeclarationEntity {
  id: string;
  inspectionId: string;
  evidenceId?: string;
  rawExtractedFields: RawExtractedFields;
  normalizedFields: any;
  fieldConfidences: Record<string, number>;
  overallConfidence: number;
  isManuallyVerified: boolean;
  manualOverrideReason?: string | null;
  verifiedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

const declarationsStore: Map<string, DeclarationEntity> = new Map();

// Seed default declaration
const seedDeclId = 'decl_001';
declarationsStore.set(seedDeclId, {
  id: seedDeclId,
  inspectionId: 'insp_001',
  evidenceId: 'ev_001',
  rawExtractedFields: {
    mrpRaw: 'MRP Rs. 14.00 (Incl. of all taxes)',
    netQuantityRaw: 'NET QUANTITY: 70g',
    mfgDateRaw: 'MFG DATE: 01/2026',
    manufacturerNameRaw: 'Nestle India Ltd',
    addressRaw: 'Moga, Punjab - 142001',
    consumerCareRaw: '1800-225-537 / wecare@nestle.in',
  },
  normalizedFields: {},
  fieldConfidences: { mrp: 0.92, netQuantity: 0.95, mfgDate: 0.88 },
  overallConfidence: 0.92,
  isManuallyVerified: false,
  manualOverrideReason: null,
  verifiedBy: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
});

export class B16Repository {
  async findAll(filters: { inspectionId?: string; limit?: number; offset?: number }) {
    const limit = filters.limit || 10;
    const offset = filters.offset || 0;
    let list = Array.from(declarationsStore.values()).filter((d) => !d.deletedAt);

    if (filters.inspectionId) {
      list = list.filter((d) => d.inspectionId === filters.inspectionId);
    }

    return {
      items: list.slice(offset, offset + limit),
      total: list.length,
    };
  }

  async findById(id: string): Promise<DeclarationEntity | null> {
    const d = declarationsStore.get(id);
    if (!d || d.deletedAt) return null;
    return d;
  }

  async create(data: { inspectionId: string; evidenceId?: string; rawExtractedFields: RawExtractedFields; fieldConfidences?: Record<string, number>; overallConfidence?: number }): Promise<DeclarationEntity> {
    const id = uuidv4();
    const decl: DeclarationEntity = {
      id,
      inspectionId: data.inspectionId,
      evidenceId: data.evidenceId,
      rawExtractedFields: data.rawExtractedFields,
      normalizedFields: {},
      fieldConfidences: data.fieldConfidences || { default: 0.90 },
      overallConfidence: data.overallConfidence || 0.90,
      isManuallyVerified: false,
      manualOverrideReason: null,
      verifiedBy: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };
    declarationsStore.set(id, decl);
    return decl;
  }

  async updateRawFields(id: string, rawFields: Partial<RawExtractedFields>): Promise<DeclarationEntity | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated: DeclarationEntity = {
      ...existing,
      rawExtractedFields: {
        ...existing.rawExtractedFields,
        ...rawFields,
      },
      updatedAt: new Date().toISOString(),
    };
    declarationsStore.set(id, updated);
    return updated;
  }
}
