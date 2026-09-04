import { v4 as uuidv4 } from 'uuid';

export type PackageSide = 'front' | 'back' | 'side_left' | 'side_right' | 'top' | 'bottom';

export interface ImageMetadataEntity {
  id: string;
  evidenceId: string;
  inspectionId: string;
  packageSide: PackageSide;
  widthPixels: number;
  heightPixels: number;
  checksum: string;
  capturedAt: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

const metadataStore: Map<string, ImageMetadataEntity> = new Map();

// Seed default record
const seedMetaId = 'meta_001';
metadataStore.set(seedMetaId, {
  id: seedMetaId,
  evidenceId: 'ev_001',
  inspectionId: 'insp_001',
  packageSide: 'front',
  widthPixels: 1920,
  heightPixels: 1080,
  checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  capturedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
});

export class B11Repository {
  async findAll(filters: { inspectionId?: string; evidenceId?: string; limit?: number; offset?: number }) {
    const limit = filters.limit || 10;
    const offset = filters.offset || 0;
    let list = Array.from(metadataStore.values()).filter((m) => !m.deletedAt);

    if (filters.inspectionId) {
      list = list.filter((m) => m.inspectionId === filters.inspectionId);
    }
    if (filters.evidenceId) {
      list = list.filter((m) => m.evidenceId === filters.evidenceId);
    }

    return {
      items: list.slice(offset, offset + limit),
      total: list.length,
    };
  }

  async findById(id: string): Promise<ImageMetadataEntity | null> {
    const m = metadataStore.get(id);
    if (!m || m.deletedAt) return null;
    return m;
  }

  async create(data: { evidenceId: string; inspectionId: string; packageSide?: PackageSide; widthPixels: number; heightPixels: number; checksum: string }): Promise<ImageMetadataEntity> {
    const id = uuidv4();
    const metadata: ImageMetadataEntity = {
      id,
      evidenceId: data.evidenceId,
      inspectionId: data.inspectionId,
      packageSide: data.packageSide || 'front',
      widthPixels: data.widthPixels,
      heightPixels: data.heightPixels,
      checksum: data.checksum,
      capturedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };
    metadataStore.set(id, metadata);
    return metadata;
  }

  async update(id: string, updates: Partial<ImageMetadataEntity>): Promise<ImageMetadataEntity | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated: ImageMetadataEntity = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    metadataStore.set(id, updated);
    return updated;
  }
}
