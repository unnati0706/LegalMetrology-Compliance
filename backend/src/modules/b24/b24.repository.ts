import { v4 as uuidv4 } from 'uuid';
import { db } from '../../shared/database/index.js';
import { CheckResult, Rule } from '../../shared/types/index.js';

export class B24Repository {
  public findRuleByCode(ruleCode: string, version: string): Rule | undefined {
    return Array.from(db.store.rules.values()).find(
      r => r.ruleCode === ruleCode && r.version === version
    );
  }

  public saveCheckResults(results: Omit<CheckResult, 'id' | 'createdAt' | 'updatedAt'>[]): CheckResult[] {
    const saved: CheckResult[] = [];
    for (const r of results) {
      const entity: CheckResult = {
        ...r,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.store.checkResults.set(entity.id, entity);
      saved.push(entity);
    }
    return saved;
  }

  public findCheckResults(filter: {
    inspectionId?: string;
    status?: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
  }): { items: CheckResult[]; total: number } {
    let list = Array.from(db.store.checkResults.values()).filter(r => 
      ['PCR-2011-R06-DATE-FORMAT', 'PCR-2011-R07-FONT-HEIGHT', 'PCR-2011-R09-PDP-READABILITY']
        .includes(r.ruleCode || '')
    );

    if (filter.inspectionId) {
      list = list.filter(r => r.inspectionId === filter.inspectionId);
    }
    if (filter.status) {
      list = list.filter(r => r.status === filter.status);
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
}
