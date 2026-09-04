import { v4 as uuidv4 } from 'uuid';
import { db } from '../../shared/database/index.js';
import { Inspection, Declaration, CheckResult, Violation, Evidence } from '../../shared/types/index.js';

export class B27Repository {
  public saveInspection(data: Omit<Inspection, 'id' | 'createdAt' | 'updatedAt'>): Inspection {
    const entity: Inspection = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.store.inspections.set(entity.id, entity);
    return entity;
  }

  public findInspections(filter: {
    productName?: string;
    category?: string;
    brand?: string;
    status?: string;
    inspectorId?: string;
    manufacturerId?: string;
    startDate?: string;
    endDate?: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
  }): { items: Inspection[]; total: number } {
    let list = Array.from(db.store.inspections.values());

    if (filter.productName) {
      const q = filter.productName.toLowerCase();
      list = list.filter(i => i.productName.toLowerCase().includes(q));
    }
    if (filter.category) {
      list = list.filter(i => i.category.toLowerCase() === filter.category!.toLowerCase());
    }
    if (filter.brand) {
      list = list.filter(i => i.brand?.toLowerCase() === filter.brand!.toLowerCase());
    }
    if (filter.status) {
      list = list.filter(i => i.status === filter.status);
    }
    if (filter.inspectorId) {
      list = list.filter(i => i.inspectorId === filter.inspectorId);
    }
    if (filter.manufacturerId) {
      list = list.filter(i => i.manufacturerId === filter.manufacturerId);
    }
    if (filter.startDate) {
      const from = new Date(filter.startDate).getTime();
      list = list.filter(i => i.createdAt.getTime() >= from);
    }
    if (filter.endDate) {
      const to = new Date(filter.endDate).getTime();
      list = list.filter(i => i.createdAt.getTime() <= to);
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

  public findInspectionById(id: string): Inspection | undefined {
    return db.store.inspections.get(id);
  }

  public updateInspection(id: string, updates: Partial<Inspection>): Inspection | undefined {
    const existing = db.store.inspections.get(id);
    if (!existing) return undefined;

    const updated: Inspection = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    db.store.inspections.set(id, updated);
    return updated;
  }

  public getInspectionDetails(id: string) {
    const inspection = db.store.inspections.get(id);
    if (!inspection) return null;

    const declarations = Array.from(db.store.declarations.values()).filter(d => d.inspectionId === id);
    const checkResults = Array.from(db.store.checkResults.values()).filter(c => c.inspectionId === id);
    const violations = Array.from(db.store.violations.values()).filter(v => v.inspectionId === id);
    const evidenceList = Array.from(db.store.evidence.values()).filter(e => e.inspectionId === id);

    return {
      inspection,
      declarations,
      checkResults,
      violations,
      evidenceList,
    };
  }

  public hasUnresolvedManualReviews(inspectionId: string): boolean {
    return Array.from(db.store.checkResults.values()).some(
      c => c.inspectionId === inspectionId && c.status === 'MANUAL_REVIEW' && !c.isOverridden
    );
  }
}
