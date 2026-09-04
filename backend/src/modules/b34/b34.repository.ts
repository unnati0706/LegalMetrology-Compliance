import { db } from '../../shared/database/index.js';
import { RiskProfile, Inspection, Violation } from '../../shared/types/index.js';
import { RiskProfileQuery } from './b34.schemas.js';

export class B34Repository {
  public async getRiskProfiles(query: RiskProfileQuery): Promise<{ items: RiskProfile[]; total: number }> {
    let list = Array.from(db.store.riskProfiles.values()).filter(r => !r.deletedAt);

    if (query.entityId) {
      list = list.filter(r => r.entityId === query.entityId);
    }
    if (query.entityType) {
      list = list.filter(r => r.entityType === query.entityType);
    }
    if (query.riskTier) {
      list = list.filter(r => r.riskTier === query.riskTier);
    }
    if (query.minScore !== undefined) {
      list = list.filter(r => r.riskScore >= query.minScore!);
    }

    list.sort((a, b) => b.riskScore - a.riskScore);

    const total = list.length;
    const startIndex = (query.page - 1) * query.limit;
    const items = list.slice(startIndex, startIndex + query.limit);

    return { items, total };
  }

  public async findRiskProfileById(id: string): Promise<RiskProfile | null> {
    const r = db.store.riskProfiles.get(id);
    if (!r || r.deletedAt) return null;
    return r;
  }

  public async findRiskProfileByEntity(entityId: string, entityType: string): Promise<RiskProfile | null> {
    for (const r of db.store.riskProfiles.values()) {
      if (!r.deletedAt && r.entityId === entityId && r.entityType === entityType) {
        return r;
      }
    }
    return null;
  }

  public async saveRiskProfile(profile: RiskProfile): Promise<RiskProfile> {
    db.store.riskProfiles.set(profile.id, profile);
    return profile;
  }

  public async getEntityHistoricalInspections(entityId: string, entityType: string, lookbackDays: number): Promise<Inspection[]> {
    const cutoff = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);
    return Array.from(db.store.inspections.values()).filter(i => {
      if (i.deletedAt || i.createdAt < cutoff) return false;
      if (entityType === 'MANUFACTURER') {
        return i.manufacturerId === entityId;
      } else if (entityType === 'CATEGORY') {
        return i.category.toLowerCase() === entityId.toLowerCase();
      } else {
        return i.productName.toLowerCase().includes(entityId.toLowerCase());
      }
    });
  }

  public async getViolationsForInspections(inspectionIds: string[]): Promise<Violation[]> {
    const idSet = new Set(inspectionIds);
    return Array.from(db.store.violations.values()).filter(
      v => !v.deletedAt && idSet.has(v.inspectionId)
    );
  }
}
