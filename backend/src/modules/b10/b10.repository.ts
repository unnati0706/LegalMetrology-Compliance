import { v4 as uuidv4 } from 'uuid';

export interface EvidenceEntity {
  id: string;
  inspectionId: string;
  fileKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  packageSide: string;
  checksum: string;
  signedUrl: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

const evidenceStore: Map<string, EvidenceEntity> = new Map();

// Seed default evidence record
const seedEvId = 'ev_001';
evidenceStore.set(seedEvId, {
  id: seedEvId,
  inspectionId: 'insp_001',
  fileKey: 'inspections/insp_001/front_label.jpg',
  originalName: 'front_label.jpg',
  mimeType: 'image/jpeg',
  sizeBytes: 2048500,
  packageSide: 'front',
  checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  signedUrl: 'https://s3.ap-south-1.amazonaws.com/legal-metrology-evidence/inspections/insp_001/front_label.jpg?expires=1700000000',
  uploadedBy: 'usr_inspector1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
});

export class B10Repository {
  async findAll(filters: { inspectionId?: string; limit?: number; offset?: number }) {
    const limit = filters.limit || 10;
    const offset = filters.offset || 0;
    let list = Array.from(evidenceStore.values()).filter((e) => !e.deletedAt);

    if (filters.inspectionId) {
      list = list.filter((e) => e.inspectionId === filters.inspectionId);
    }

    return {
      items: list.slice(offset, offset + limit),
      total: list.length,
    };
  }

  async findById(id: string): Promise<EvidenceEntity | null> {
    const e = evidenceStore.get(id);
    if (!e || e.deletedAt) return null;
    return e;
  }

  async create(data: { inspectionId: string; fileKey: string; originalName: string; mimeType: string; sizeBytes: number; packageSide?: string; checksum: string; signedUrl: string; uploadedBy: string }): Promise<EvidenceEntity> {
    const id = uuidv4();
    const evidence: EvidenceEntity = {
      id,
      inspectionId: data.inspectionId,
      fileKey: data.fileKey,
      originalName: data.originalName,
      mimeType: data.mimeType,
      sizeBytes: data.sizeBytes,
      packageSide: data.packageSide || 'front',
      checksum: data.checksum,
      signedUrl: data.signedUrl,
      uploadedBy: data.uploadedBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };
    evidenceStore.set(id, evidence);
    return evidence;
  }

  async update(id: string, updates: Partial<EvidenceEntity>): Promise<EvidenceEntity | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated: EvidenceEntity = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    evidenceStore.set(id, updated);
    return updated;
  }
}
