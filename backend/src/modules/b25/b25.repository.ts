import { v4 as uuidv4 } from 'uuid';
import { db } from '../../shared/database/index.js';
import { CheckResult, Rule, Violation, Evidence } from '../../shared/types/index.js';

export class B25Repository {
  public findCheckResultsByInspectionId(inspectionId: string): CheckResult[] {
    return Array.from(db.store.checkResults.values()).filter(r => r.inspectionId === inspectionId);
  }

  public findCheckResultById(id: string): CheckResult | undefined {
    return db.store.checkResults.get(id);
  }

  public findRuleById(ruleId: string): Rule | undefined {
    return db.store.rules.get(ruleId);
  }

  public findEvidenceById(evidenceId: string): Evidence | undefined {
    return db.store.evidence.get(evidenceId);
  }

  public findExistingViolation(inspectionId: string, checkResultId: string): Violation | undefined {
    return Array.from(db.store.violations.values()).find(
      v => v.inspectionId === inspectionId && v.checkResultId === checkResultId
    );
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

  public findViolations(filter: {
    inspectionId?: string;
    severity?: string;
    status?: string;
    ruleCode?: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
  }): { items: Violation[]; total: number } {
    let list = Array.from(db.store.violations.values());

    if (filter.inspectionId) {
      list = list.filter(v => v.inspectionId === filter.inspectionId);
    }
    if (filter.severity) {
      list = list.filter(v => v.severity === filter.severity);
    }
    if (filter.status) {
      list = list.filter(v => v.status === filter.status);
    }
    if (filter.ruleCode) {
      list = list.filter(v => v.ruleCode === filter.ruleCode);
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

  public findViolationById(id: string): Violation | undefined {
    return db.store.violations.get(id);
  }

  public updateViolation(id: string, updates: Partial<Violation>): Violation | undefined {
    const existing = db.store.violations.get(id);
    if (!existing) return undefined;

    const updated: Violation = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    db.store.violations.set(id, updated);
    return updated;
  }
}
