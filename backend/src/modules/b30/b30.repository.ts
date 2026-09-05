import { v4 as uuidv4 } from 'uuid';
import { db } from '../../shared/database/index.js';
import { Report, Inspection, Declaration, CheckResult, Violation, Evidence, User } from '../../shared/types/index.js';

export class B30Repository {
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

  public findReportsByInspectionId(inspectionId: string): Report[] {
    return Array.from(db.store.reports.values())
      .filter(r => r.inspectionId === inspectionId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  public findReportById(id: string): Report | undefined {
    return db.store.reports.get(id);
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
