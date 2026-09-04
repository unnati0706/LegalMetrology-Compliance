import { v4 as uuidv4 } from 'uuid';

export interface ImageQualityResultEntity {
  id: string;
  evidenceId: string;
  blurScore: number;
  glareScore: number;
  cropScore: number;
  overallQuality: number;
  isAcceptable: boolean;
  flags: string[];
  createdAt: string;
}

const qualityStore: Map<string, ImageQualityResultEntity> = new Map();

// Seed initial quality result
const seedQualId = 'qual_001';
qualityStore.set(seedQualId, {
  id: seedQualId,
  evidenceId: 'ev_001',
  blurScore: 12.0,
  glareScore: 8.5,
  cropScore: 5.0,
  overallQuality: 0.88,
  isAcceptable: true,
  flags: [],
  createdAt: new Date().toISOString(),
});

export class B13Repository {
  async findAll(filters: { evidenceId?: string; limit?: number; offset?: number }) {
    const limit = filters.limit || 10;
    const offset = filters.offset || 0;
    let list = Array.from(qualityStore.values());

    if (filters.evidenceId) {
      list = list.filter((q) => q.evidenceId === filters.evidenceId);
    }

    return {
      items: list.slice(offset, offset + limit),
      total: list.length,
    };
  }

  async findById(id: string): Promise<ImageQualityResultEntity | null> {
    return qualityStore.get(id) || null;
  }

  async create(data: { evidenceId: string; blurScore: number; glareScore: number; cropScore: number; overallQuality: number; isAcceptable: boolean; flags: string[] }): Promise<ImageQualityResultEntity> {
    const id = uuidv4();
    const result: ImageQualityResultEntity = {
      id,
      evidenceId: data.evidenceId,
      blurScore: data.blurScore,
      glareScore: data.glareScore,
      cropScore: data.cropScore,
      overallQuality: data.overallQuality,
      isAcceptable: data.isAcceptable,
      flags: data.flags || [],
      createdAt: new Date().toISOString(),
    };
    qualityStore.set(id, result);
    return result;
  }

  async updateFlags(id: string, flags: string[]): Promise<ImageQualityResultEntity | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated: ImageQualityResultEntity = {
      ...existing,
      flags,
    };
    qualityStore.set(id, updated);
    return updated;
  }
}
