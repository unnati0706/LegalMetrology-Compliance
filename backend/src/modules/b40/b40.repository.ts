import { db } from '../../shared/database/index.js';
import { CaseDossier, Violation, Evidence } from '../../shared/types/index.js';
import { QueryDossiersInput } from './b40.schemas.js';

export class B40Repository {
  public async getDossiers(query: QueryDossiersInput): Promise<{ dossiers: CaseDossier[]; total: number }> {
    let all = Array.from(db.store.caseDossiers.values()).filter(d => !d.deletedAt);

    if (query.targetAgency) {
      all = all.filter(d => d.targetAgency === query.targetAgency);
    }
    if (query.status) {
      all = all.filter(d => d.status === query.status);
    }
    if (query.inspectionId) {
      all = all.filter(d => d.inspectionId === query.inspectionId);
    }
    if (query.manufacturerId) {
      all = all.filter(d => d.manufacturerId === query.manufacturerId);
    }

    all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = all.length;
    const page = query.page || 1;
    const limit = query.limit || 20;
    const startIndex = (page - 1) * limit;
    const dossiers = all.slice(startIndex, startIndex + limit);

    return { dossiers, total };
  }

  public async findDossierById(id: string): Promise<CaseDossier | null> {
    const dossier = db.store.caseDossiers.get(id);
    if (!dossier || dossier.deletedAt) return null;
    return dossier;
  }

  public async getInspectionViolations(inspectionId: string): Promise<Violation[]> {
    return Array.from(db.store.violations.values()).filter(v => v.inspectionId === inspectionId && !v.deletedAt);
  }

  public async getInspectionEvidence(inspectionId: string): Promise<Evidence[]> {
    return Array.from(db.store.evidence.values()).filter(e => e.inspectionId === inspectionId && !e.deletedAt);
  }

  public async saveDossier(dossier: CaseDossier): Promise<CaseDossier> {
    db.store.caseDossiers.set(dossier.id, dossier);
    return dossier;
  }

  public async updateDossier(dossier: CaseDossier): Promise<CaseDossier> {
    db.store.caseDossiers.set(dossier.id, dossier);
    return dossier;
  }
}
