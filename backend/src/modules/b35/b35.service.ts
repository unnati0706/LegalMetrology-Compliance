import { v4 as uuidv4 } from 'uuid';
import { B35Repository } from './b35.repository.js';
import { 
  QueueQuery, 
  RefreshQueueInput, 
  UpdateQueueItemInput 
} from './b35.schemas.js';
import { 
  InspectNextItem 
} from '../../shared/types/index.js';
import { AuthUser } from '../../shared/auth/index.js';
import { ApiError } from '../../shared/errors/index.js';
import { auditLogService } from '../../shared/audit/index.js';

export class B35Service {
  constructor(private repo: B35Repository = new B35Repository()) {}

  public async listQueueItems(query: QueueQuery) {
    return this.repo.getQueueItems(query);
  }

  public async getQueueItemById(id: string): Promise<InspectNextItem> {
    const item = await this.repo.findQueueItemById(id);
    if (!item) {
      throw ApiError.notFound('35_NOT_FOUND', `Inspect-Next queue item with ID '${id}' not found`);
    }
    return item;
  }

  public async refreshQueue(
    input: RefreshQueueInput,
    user: AuthUser,
    ipAddress?: string
  ): Promise<{ addedItems: InspectNextItem[]; totalQueued: number }> {
    const riskProfiles = await this.repo.getTopRiskProfiles(input.minRiskScoreThreshold);
    const addedItems: InspectNextItem[] = [];

    for (const rp of riskProfiles.slice(0, input.limitItems)) {
      const existing = await this.repo.findQueueItemByEntity(rp.entityId);
      if (existing) continue; // Already in queue

      const recommendedChecklist: string[] = [
        'PCR-2011-R06-MRP-USP',
        'PCR-2011-R06-NET-QTY',
        'PCR-2011-R06-MFG-NAME',
        'PCR-2011-R07-FONT-HEIGHT'
      ];

      if (rp.riskScore >= 75) {
        recommendedChecklist.push('PCR-2011-R06-DATE-FORMAT');
        recommendedChecklist.push('PCR-2011-R09-PDP-READABILITY');
      }

      const region = input.region || 'Western Zone - Maharashtra';

      const queueItem: InspectNextItem = {
        id: uuidv4(),
        entityId: rp.entityId,
        entityType: rp.entityType === 'MANUFACTURER' ? 'MANUFACTURER' : 'PRODUCT',
        targetName: rp.entityName,
        category: rp.entityType === 'CATEGORY' ? rp.entityName : 'Packaged Goods',
        region,
        priorityScore: parseFloat(Math.min(100, rp.riskScore * 1.15).toFixed(2)),
        riskTier: rp.riskTier,
        riskProfileId: rp.id,
        recommendedChecklist,
        status: 'QUEUED',
        estimatedEffortHours: rp.riskTier === 'CRITICAL' ? 4.0 : 2.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const saved = await this.repo.saveQueueItem(queueItem);
      addedItems.push(saved);
    }

    const { total } = await this.repo.getQueueItems({ page: 1, limit: 1 });

    await auditLogService.log({
      userId: user.id,
      action: 'REFRESH_INSPECT_NEXT_QUEUE',
      objectType: 'INSPECT_NEXT_QUEUE',
      objectId: 'BATCH_REFRESH',
      newValue: { addedCount: addedItems.length, totalQueued: total },
      ipAddress,
    });

    return { addedItems, totalQueued: total };
  }

  public async updateQueueItem(
    id: string,
    input: UpdateQueueItemInput,
    user: AuthUser,
    ipAddress?: string
  ): Promise<InspectNextItem> {
    const item = await this.getQueueItemById(id);
    const prev = { ...item };

    if (input.status) {
      item.status = input.status;
    }
    if (input.assignedInspectorId) {
      item.assignedInspectorId = input.assignedInspectorId;
      item.assignedInspectorName = input.assignedInspectorName || 'Assigned Officer';
      item.assignedAt = new Date();
      if (!input.status) item.status = 'ASSIGNED';
    }
    if (input.deferredReason) {
      item.deferredReason = input.deferredReason;
      item.status = 'DEFERRED';
    }
    if (input.priorityScore !== undefined) {
      item.priorityScore = input.priorityScore;
    }
    item.updatedAt = new Date();

    const updated = await this.repo.saveQueueItem(item);

    await auditLogService.log({
      userId: user.id,
      action: 'UPDATE_INSPECT_NEXT_ITEM',
      objectType: 'INSPECT_NEXT_QUEUE',
      objectId: id,
      previousValue: prev,
      newValue: updated,
      reason: input.deferredReason,
      ipAddress,
    });

    return updated;
  }
}
