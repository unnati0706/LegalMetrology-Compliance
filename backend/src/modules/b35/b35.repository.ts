import { db } from '../../shared/database/index.js';
import { InspectNextItem, RiskProfile } from '../../shared/types/index.js';
import { QueueQuery } from './b35.schemas.js';

export class B35Repository {
  public async getQueueItems(query: QueueQuery): Promise<{ items: InspectNextItem[]; total: number }> {
    let list = Array.from(db.store.inspectNextQueue.values()).filter(q => !q.deletedAt);

    if (query.status) {
      list = list.filter(q => q.status === query.status);
    }
    if (query.riskTier) {
      list = list.filter(q => q.riskTier === query.riskTier);
    }
    if (query.assignedInspectorId) {
      list = list.filter(q => q.assignedInspectorId === query.assignedInspectorId);
    }
    if (query.region) {
      list = list.filter(q => q.region.toLowerCase().includes(query.region!.toLowerCase()));
    }
    if (query.minPriority !== undefined) {
      list = list.filter(q => q.priorityScore >= query.minPriority!);
    }

    list.sort((a, b) => b.priorityScore - a.priorityScore);

    const total = list.length;
    const startIndex = (query.page - 1) * query.limit;
    const items = list.slice(startIndex, startIndex + query.limit);

    return { items, total };
  }

  public async findQueueItemById(id: string): Promise<InspectNextItem | null> {
    const q = db.store.inspectNextQueue.get(id);
    if (!q || q.deletedAt) return null;
    return q;
  }

  public async findQueueItemByEntity(entityId: string): Promise<InspectNextItem | null> {
    for (const q of db.store.inspectNextQueue.values()) {
      if (!q.deletedAt && q.entityId === entityId && (q.status === 'QUEUED' || q.status === 'ASSIGNED')) {
        return q;
      }
    }
    return null;
  }

  public async saveQueueItem(item: InspectNextItem): Promise<InspectNextItem> {
    db.store.inspectNextQueue.set(item.id, item);
    return item;
  }

  public async getTopRiskProfiles(minScore: number): Promise<RiskProfile[]> {
    return Array.from(db.store.riskProfiles.values())
      .filter(r => !r.deletedAt && r.riskScore >= minScore)
      .sort((a, b) => b.riskScore - a.riskScore);
  }
}
