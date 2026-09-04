import { db } from '../../shared/database/index.js';
import { AnalyticsSnapshot, AnalyticsKPIs, Inspection, Violation } from '../../shared/types/index.js';

export class B31Repository {
  public async getInspections(filter?: {
    startDate?: Date;
    endDate?: Date;
    category?: string;
    manufacturerId?: string;
  }): Promise<Inspection[]> {
    let list = Array.from(db.store.inspections.values()).filter(i => !i.deletedAt);

    if (filter?.startDate) {
      list = list.filter(i => i.createdAt >= filter.startDate!);
    }
    if (filter?.endDate) {
      list = list.filter(i => i.createdAt <= filter.endDate!);
    }
    if (filter?.category) {
      list = list.filter(i => i.category.toLowerCase() === filter.category!.toLowerCase());
    }
    if (filter?.manufacturerId) {
      list = list.filter(i => i.manufacturerId === filter.manufacturerId);
    }

    return list;
  }

  public async getViolations(inspectionIds: string[]): Promise<Violation[]> {
    const idSet = new Set(inspectionIds);
    return Array.from(db.store.violations.values()).filter(
      v => !v.deletedAt && idSet.has(v.inspectionId)
    );
  }

  public async saveSnapshot(snapshot: AnalyticsSnapshot): Promise<AnalyticsSnapshot> {
    db.store.analyticsSnapshots.set(snapshot.id, snapshot);
    return snapshot;
  }

  public async findSnapshotById(id: string): Promise<AnalyticsSnapshot | null> {
    const s = db.store.analyticsSnapshots.get(id);
    if (!s || s.deletedAt) return null;
    return s;
  }

  public async listSnapshots(page: number = 1, limit: number = 20): Promise<{ items: AnalyticsSnapshot[]; total: number }> {
    const all = Array.from(db.store.analyticsSnapshots.values())
      .filter(s => !s.deletedAt)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = all.length;
    const startIndex = (page - 1) * limit;
    const items = all.slice(startIndex, startIndex + limit);
    return { items, total };
  }

  public async updateSnapshot(snapshot: AnalyticsSnapshot): Promise<AnalyticsSnapshot> {
    db.store.analyticsSnapshots.set(snapshot.id, snapshot);
    return snapshot;
  }
}
