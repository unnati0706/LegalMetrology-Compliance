import { db } from '../../shared/database/index.js';
import { PenaltyAssessment } from '../../shared/types/index.js';
import { QueryPenaltiesInput } from './b38.schemas.js';

export class B38Repository {
  public async getPenalties(query: QueryPenaltiesInput): Promise<{ penalties: PenaltyAssessment[]; total: number }> {
    let all = Array.from(db.store.penalties.values()).filter(p => !p.deletedAt);

    if (query.status) {
      all = all.filter(p => p.status === query.status);
    }
    if (query.manufacturerId) {
      all = all.filter(p => p.manufacturerId === query.manufacturerId);
    }
    if (query.inspectionId) {
      all = all.filter(p => p.inspectionId === query.inspectionId);
    }

    all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = all.length;
    const page = query.page || 1;
    const limit = query.limit || 20;
    const startIndex = (page - 1) * limit;
    const penalties = all.slice(startIndex, startIndex + limit);

    return { penalties, total };
  }

  public async findPenaltyById(id: string): Promise<PenaltyAssessment | null> {
    const penalty = db.store.penalties.get(id);
    if (!penalty || penalty.deletedAt) return null;
    return penalty;
  }

  public async savePenalty(penalty: PenaltyAssessment): Promise<PenaltyAssessment> {
    db.store.penalties.set(penalty.id, penalty);
    return penalty;
  }

  public async updatePenalty(penalty: PenaltyAssessment): Promise<PenaltyAssessment> {
    db.store.penalties.set(penalty.id, penalty);
    return penalty;
  }
}
