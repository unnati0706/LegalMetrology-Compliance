import { v4 as uuidv4 } from 'uuid';
import { db } from '../../shared/database/index.js';
import { CheckResult, Rule, Violation, Declaration, Evidence } from '../../shared/types/index.js';

export class B26Repository {
  public findCheckResults(filter: {
    inspectionId?: string;
    status: string;
    ruleCategory?: string;
    minConfidence?: number;
    maxConfidence?: number;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
  }): { items: Array<CheckResult & { rule?: Rule; declaration?: Declaration; evidence?: Evidence }>; total: number } {
    let list = Array.from(db.store.checkResults.values());

    if (filter.inspectionId) {
      list = list.filter(r => r.inspectionId === filter.inspectionId);
    }
    if (filter.status) {
      list = list.filter(r => r.status === filter.status);
    }
    if (filter.minConfidence !== undefined) {
      list = list.filter(r => r.confidence >= filter.minConfidence!);
    }
    if (filter.maxConfidence !== undefined) {
      list = list.filter(r => r.confidence <= filter.maxConfidence!);
    }
    if (filter.ruleCategory) {
      list = list.filter(r => {
        const rule = db.store.rules.get(r.ruleId);
        return rule?.category === filter.ruleCategory;
      });
    }

    list.sort((a: any, b: any) => {
      const valA = a[filter.sortBy];
      const valB = b[filter.sortBy];
      if (filter.sortOrder === 'ASC') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    const total = list.length;
    const startIndex = (filter.page - 1) * filter.limit;
    const paged = list.slice(startIndex, startIndex + filter.limit);

    const items = paged.map(r => ({
      ...r,
      rule: db.store.rules.get(r.ruleId),
      declaration: r.declarationId ? db.store.declarations.get(r.declarationId) : undefined,
      evidence: r.evidenceId ? db.store.evidence.get(r.evidenceId) : undefined,
    }));

    return { items, total };
  }

  public findCheckResultById(id: string): CheckResult | undefined {
    return db.store.checkResults.get(id);
  }

  public updateCheckResult(id: string, updates: Partial<CheckResult>): CheckResult | undefined {
    const existing = db.store.checkResults.get(id);
    if (!existing) return undefined;

    const updated: CheckResult = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    db.store.checkResults.set(id, updated);
    return updated;
  }

  public findRuleById(ruleId: string): Rule | undefined {
    return db.store.rules.get(ruleId);
  }

  public saveViolation(violation: Omit<Violation, 'id' | 'createdAt' | 'updatedAt'>): Violation {
    const entity: Violation = {
      ...violation,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.store.violations.set(entity.id, entity);
    return entity;
  }

  public findExistingViolation(inspectionId: string, checkResultId: string): Violation | undefined {
    return Array.from(db.store.violations.values()).find(
      v => v.inspectionId === inspectionId && v.checkResultId === checkResultId
    );
  }
}
