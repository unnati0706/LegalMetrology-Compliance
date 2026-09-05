import { v4 as uuidv4 } from 'uuid';
import { db } from '../../shared/database/index.js';
import { Evidence, Declaration, Violation, CheckResult } from '../../shared/types/index.js';

export class B28Repository {
  public saveEvidence(data: Omit<Evidence, 'id' | 'createdAt' | 'updatedAt'>): Evidence {
    const entity: Evidence = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.store.evidence.set(entity.id, entity);
    return entity;
  }

  public findEvidenceList(filter: {
    inspectionId?: string;
    packageSide?: string;
    minQuality?: number;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
  }): { items: Evidence[]; total: number } {
    let list = Array.from(db.store.evidence.values());

    if (filter.inspectionId) {
      list = list.filter(e => e.inspectionId === filter.inspectionId);
    }
    if (filter.packageSide) {
      list = list.filter(e => e.packageSide === filter.packageSide);
    }
    if (filter.minQuality !== undefined) {
      list = list.filter(e => (e.qualityScore ?? 0) >= filter.minQuality!);
    }

    list.sort((a: any, b: any) => {
      const valA = a[filter.sortBy];
      const valB = b[filter.sortBy];
      if (filter.sortOrder === 'ASC') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    const total = list.length;
    const startIndex = (filter.page - 1) * filter.limit;
    const items = list.slice(startIndex, startIndex + filter.limit);

    return { items, total };
  }

  public findEvidenceById(id: string): Evidence | undefined {
    return db.store.evidence.get(id);
  }

  public updateEvidence(id: string, updates: Partial<Evidence>): Evidence | undefined {
    const existing = db.store.evidence.get(id);
    if (!existing) return undefined;

    const updated: Evidence = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    db.store.evidence.set(id, updated);
    return updated;
  }

  public getLinkedArtifacts(evidenceId: string) {
    const declarations = Array.from(db.store.declarations.values()).filter(d => d.evidenceId === evidenceId);
    const checkResults = Array.from(db.store.checkResults.values()).filter(c => c.evidenceId === evidenceId);
    const violations = Array.from(db.store.violations.values()).filter(v => v.evidenceId === evidenceId);

    return {
      declarations,
      checkResults,
      violations,
    };
  }
}
