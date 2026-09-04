import { db } from '../../shared/database/index.js';
import { ManufacturerAppeal, LegalNotice } from '../../shared/types/index.js';
import { QueryAppealsInput } from './b37.schemas.js';

export class B37Repository {
  public async getAppeals(query: QueryAppealsInput): Promise<{ appeals: ManufacturerAppeal[]; total: number }> {
    let all = Array.from(db.store.appeals.values()).filter(a => !a.deletedAt);

    if (query.status) {
      all = all.filter(a => a.status === query.status);
    }
    if (query.noticeId) {
      all = all.filter(a => a.noticeId === query.noticeId);
    }
    if (query.manufacturerId) {
      all = all.filter(a => a.manufacturerId === query.manufacturerId);
    }

    all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = all.length;
    const page = query.page || 1;
    const limit = query.limit || 20;
    const startIndex = (page - 1) * limit;
    const appeals = all.slice(startIndex, startIndex + limit);

    return { appeals, total };
  }

  public async findAppealById(id: string): Promise<ManufacturerAppeal | null> {
    const appeal = db.store.appeals.get(id);
    if (!appeal || appeal.deletedAt) return null;
    return appeal;
  }

  public async findNoticeById(noticeId: string): Promise<LegalNotice | null> {
    const notice = db.store.legalNotices.get(noticeId);
    if (!notice || notice.deletedAt) return null;
    return notice;
  }

  public async saveAppeal(appeal: ManufacturerAppeal): Promise<ManufacturerAppeal> {
    db.store.appeals.set(appeal.id, appeal);
    return appeal;
  }

  public async updateAppeal(appeal: ManufacturerAppeal): Promise<ManufacturerAppeal> {
    db.store.appeals.set(appeal.id, appeal);
    return appeal;
  }

  public async updateNotice(notice: LegalNotice): Promise<LegalNotice> {
    db.store.legalNotices.set(notice.id, notice);
    return notice;
  }
}
