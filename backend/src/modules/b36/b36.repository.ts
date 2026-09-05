import { db } from '../../shared/database/index.js';
import { LegalNotice } from '../../shared/types/index.js';
import { QueryNoticesInput } from './b36.schemas.js';

export class B36Repository {
  public async getNotices(query: QueryNoticesInput): Promise<{ notices: LegalNotice[]; total: number }> {
    let all = Array.from(db.store.legalNotices.values()).filter(n => !n.deletedAt);

    if (query.status) {
      all = all.filter(n => n.status === query.status);
    }
    if (query.noticeType) {
      all = all.filter(n => n.noticeType === query.noticeType);
    }
    if (query.manufacturerId) {
      all = all.filter(n => n.manufacturerId === query.manufacturerId);
    }
    if (query.inspectionId) {
      all = all.filter(n => n.inspectionId === query.inspectionId);
    }

    all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = all.length;
    const page = query.page || 1;
    const limit = query.limit || 20;
    const startIndex = (page - 1) * limit;
    const notices = all.slice(startIndex, startIndex + limit);

    return { notices, total };
  }

  public async findNoticeById(id: string): Promise<LegalNotice | null> {
    const notice = db.store.legalNotices.get(id);
    if (!notice || notice.deletedAt) return null;
    return notice;
  }

  public async saveNotice(notice: LegalNotice): Promise<LegalNotice> {
    db.store.legalNotices.set(notice.id, notice);
    return notice;
  }

  public async updateNotice(notice: LegalNotice): Promise<LegalNotice> {
    db.store.legalNotices.set(notice.id, notice);
    return notice;
  }
}
