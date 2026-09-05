import { v4 as uuidv4 } from 'uuid';
import { db } from '../../shared/database/index.js';
import { Report, Inspection, Declaration, CheckResult, Violation, Evidence, User } from '../../shared/types/index.js';

export class B29Repository {
  public saveReport(data: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Report {
    const entity: Report = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.store.reports.set(entity.id, entity);
    return entity;
  }

  public findInspectionById(id: string): Inspection | undefined {
    return db.store.inspections.get(id);
  }

  public findUserById(id: string): User | undefined {
    return db.store.users.get(id);
  }

  public findDeclarationsByInspectionId(inspectionId: string): Declaration[] {
    return Array.from(db.store.declarations.values()).filter(d => d.inspectionId === inspectionId);
  }

  public findCheckResultsByInspectionId(inspectionId: string): CheckResult[] {
    return Array.from(db.store.checkResults.values()).filter(c => c.inspectionId === inspectionId);
  }

  public findViolationsByInspectionId(inspectionId: string): Violation[] {
    return Array.from(db.store.violations.values()).filter(v => v.inspectionId === inspectionId);
  }

  public findEvidenceByInspectionId(inspectionId: string): Evidence[] {
    return Array.from(db.store.evidence.values()).filter(e => e.inspectionId === inspectionId);
  }

  public findReports(filter: {
    inspectionId?: string;
    format?: string;
    status?: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
  }): { items: Report[]; total: number } {
    let list = Array.from(db.store.reports.values());

    if (filter.inspectionId) {
      list = list.filter(r => r.inspectionId === filter.inspectionId);
    }
    if (filter.format) {
      list = list.filter(r => r.format === filter.format);
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

  public findReportById(id: string): Report | undefined {
    return db.store.reports.get(id);
  }

  public findLatestReportForInspection(inspectionId: string): Report | undefined {
    const list = Array.from(db.store.reports.values())
      .filter(r => r.inspectionId === inspectionId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return list[0];
  }

  public updateReport(id: string, updates: Partial<Report>): Report | undefined {
    const existing = db.store.reports.get(id);
    if (!existing) return undefined;

    const updated: Report = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    db.store.reports.set(id, updated);
    return updated;
  }
}
