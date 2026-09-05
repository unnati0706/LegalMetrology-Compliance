import { db } from '../../shared/database/index.js';
import { ViolationPattern, Violation, Inspection } from '../../shared/types/index.js';
import { PatternQuery } from './b32.schemas.js';

export class B32Repository {
  public async getPatterns(query: PatternQuery): Promise<{ items: ViolationPattern[]; total: number }> {
    let list = Array.from(db.store.violationPatterns.values()).filter(p => !p.deletedAt);

    if (query.entityId) {
      list = list.filter(p => p.entityId === query.entityId);
    }
    if (query.entityType) {
      list = list.filter(p => p.entityType === query.entityType);
    }
    if (query.patternType) {
      list = list.filter(p => p.patternType === query.patternType);
    }
    if (query.status) {
      list = list.filter(p => p.status === query.status);
    }
    if (query.minOccurrences) {
      list = list.filter(p => p.occurrenceCount >= query.minOccurrences!);
    }

    list.sort((a, b) => b.occurrenceCount - a.occurrenceCount || b.updatedAt.getTime() - a.updatedAt.getTime());

    const total = list.length;
    const startIndex = (query.page - 1) * query.limit;
    const items = list.slice(startIndex, startIndex + query.limit);

    return { items, total };
  }

  public async findPatternById(id: string): Promise<ViolationPattern | null> {
    const p = db.store.violationPatterns.get(id);
    if (!p || p.deletedAt) return null;
    return p;
  }

  public async findPatternByCode(code: string): Promise<ViolationPattern | null> {
    for (const p of db.store.violationPatterns.values()) {
      if (!p.deletedAt && p.patternCode === code) return p;
    }
    return null;
  }

  public async savePattern(pattern: ViolationPattern): Promise<ViolationPattern> {
    db.store.violationPatterns.set(pattern.id, pattern);
    return pattern;
  }

  public async getAllViolationsWithInspections(lookbackDays: number): Promise<Array<{ violation: Violation; inspection: Inspection }>> {
    const cutoff = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);
    const results: Array<{ violation: Violation; inspection: Inspection }> = [];

    for (const v of db.store.violations.values()) {
      if (v.deletedAt || v.createdAt < cutoff) continue;
      const insp = db.store.inspections.get(v.inspectionId);
      if (insp && !insp.deletedAt) {
        results.push({ violation: v, inspection: insp });
      }
    }

    return results;
  }
}
