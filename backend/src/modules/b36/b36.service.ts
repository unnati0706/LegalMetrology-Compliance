import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { B36Repository } from './b36.repository.js';
import { 
  IssueNoticeInput, 
  UpdateNoticeStatusInput, 
  QueryNoticesInput 
} from './b36.schemas.js';
import { LegalNotice } from '../../shared/types/index.js';
import { AuthUser } from '../../shared/auth/index.js';
import { ApiError } from '../../shared/errors/index.js';
import { auditLogService } from '../../shared/audit/index.js';

export class B36Service {
  constructor(private repo: B36Repository = new B36Repository()) {}

  public async listNotices(query: QueryNoticesInput) {
    return this.repo.getNotices(query);
  }

  public async getNoticeById(id: string): Promise<LegalNotice> {
    const notice = await this.repo.findNoticeById(id);
    if (!notice) {
      throw ApiError.notFound('36_NOT_FOUND', `Legal notice with ID '${id}' not found`);
    }
    return notice;
  }

  public async issueNotice(
    input: IssueNoticeInput,
    user: AuthUser,
    ipAddress?: string
  ): Promise<LegalNotice> {
    const noticeId = uuidv4();
    const year = new Date().getFullYear();
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const noticeNumber = `LM/NZ/${year}/${input.noticeType === 'SHOW_CAUSE' ? 'SC' : 'NOT'}-${randSuffix}`;

    const daysToAdd = input.deadlineDays || 15;
    const responseDeadline = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);

    const rawPayload = JSON.stringify({
      noticeNumber,
      inspectionId: input.inspectionId,
      manufacturerId: input.manufacturerId,
      allegations: input.allegations,
      issuedAt: new Date().toISOString()
    });
    const digitalSignatureHash = crypto.createHash('sha256').update(rawPayload).digest('hex');

    const notice: LegalNotice = {
      id: noticeId,
      noticeNumber,
      noticeType: input.noticeType,
      inspectionId: input.inspectionId,
      manufacturerId: input.manufacturerId,
      manufacturerName: input.manufacturerName,
      issuingAuthority: input.issuingAuthority,
      statutoryReference: input.statutoryReference,
      allegations: input.allegations,
      responseDeadline,
      status: 'ISSUED',
      issuedAt: new Date(),
      servedToEmail: input.servedToEmail,
      digitalSignatureHash,
      notes: input.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const saved = await this.repo.saveNotice(notice);

    await auditLogService.log({
      userId: user.id,
      action: 'ISSUE_LEGAL_NOTICE',
      objectType: 'LEGAL_NOTICE',
      objectId: saved.id,
      newValue: saved,
      ipAddress,
    });

    return saved;
  }

  public async updateNoticeStatus(
    id: string,
    input: UpdateNoticeStatusInput,
    user: AuthUser,
    ipAddress?: string
  ): Promise<LegalNotice> {
    const notice = await this.getNoticeById(id);
    const prev = { ...notice };

    notice.status = input.status;
    if (input.servedToEmail) {
      notice.servedToEmail = input.servedToEmail;
      notice.servedAt = new Date();
    }
    if (input.notes) {
      notice.notes = input.notes;
    }
    notice.updatedAt = new Date();

    const updated = await this.repo.updateNotice(notice);

    await auditLogService.log({
      userId: user.id,
      action: 'UPDATE_LEGAL_NOTICE_STATUS',
      objectType: 'LEGAL_NOTICE',
      objectId: id,
      previousValue: prev,
      newValue: updated,
      reason: input.reason,
      ipAddress,
    });

    return updated;
  }
}
