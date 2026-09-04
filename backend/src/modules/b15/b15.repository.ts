import { v4 as uuidv4 } from 'uuid';
import { BoundingBox } from './vision.adapter';

export interface VisionDetectionEntity {
  id: string;
  evidenceId: string;
  regionType: 'PDP' | 'MRP' | 'NET_QUANTITY' | 'MANUFACTURER_INFO';
  boundingBox: BoundingBox;
  confidence: number;
  createdAt: string;
}

const visionStore: Map<string, VisionDetectionEntity> = new Map();

// Seed initial detection
const seedVisId = 'vis_001';
visionStore.set(seedVisId, {
  id: seedVisId,
  evidenceId: 'ev_001',
  regionType: 'PDP',
  boundingBox: { x: 10, y: 10, width: 600, height: 800 },
  confidence: 0.96,
  createdAt: new Date().toISOString(),
});

export class B15Repository {
  async findAll(filters: { evidenceId?: string; regionType?: string; limit?: number; offset?: number }) {
    const limit = filters.limit || 10;
    const offset = filters.offset || 0;
    let list = Array.from(visionStore.values());

    if (filters.evidenceId) {
      list = list.filter((v) => v.evidenceId === filters.evidenceId);
    }
    if (filters.regionType) {
      list = list.filter((v) => v.regionType === filters.regionType);
    }

    return {
      items: list.slice(offset, offset + limit),
      total: list.length,
    };
  }

  async findById(id: string): Promise<VisionDetectionEntity | null> {
    return visionStore.get(id) || null;
  }

  async create(data: { evidenceId: string; regionType: 'PDP' | 'MRP' | 'NET_QUANTITY' | 'MANUFACTURER_INFO'; boundingBox: BoundingBox; confidence: number }): Promise<VisionDetectionEntity> {
    const id = uuidv4();
    const detection: VisionDetectionEntity = {
      id,
      evidenceId: data.evidenceId,
      regionType: data.regionType,
      boundingBox: data.boundingBox,
      confidence: data.confidence,
      createdAt: new Date().toISOString(),
    };
    visionStore.set(id, detection);
    return detection;
  }

  async updateBoundingBox(id: string, boundingBox: BoundingBox): Promise<VisionDetectionEntity | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated: VisionDetectionEntity = {
      ...existing,
      boundingBox,
    };
    visionStore.set(id, updated);
    return updated;
  }
}
