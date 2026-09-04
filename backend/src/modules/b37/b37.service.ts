import { v4 as uuidv4 } from 'uuid';
import { B37Repository } from './b37.repository.js';
import { 
  SubmitAppealInput, 
  ReviewAppealInput, 
  QueryAppealsInput 
} from './b37.schemas.js';
import { ManufacturerAppeal, AppealStatus } from '../../shared/types/index.js';
import { AuthUser } from '../../shared/auth/index.js';
import { ApiError } from '../../shared/errors/index.js';
import { auditLogService } from '../../shared/audit/index.js';

export class B37Service {
  constructor(private repo: B37Repository = new B37Repository()) {}

  public async listAppeals(query: QueryAppealsInput) {
    return this.repo.getAppeals(query);
  }

  public async getAppealById(id: string): Promise<ManufacturerAppeal> {
    const appeal = await this.repo.findAppealById(id);
    if (!appeal) {
      throw ApiError.notFound('37_NOT_FOUND', `Appeal with ID '${id}' not found`);
    }
    return appeal;
  }

  public async submitAppeal(
    input: SubmitAppealInput,
    user: AuthUser,
    ipAddress?: string
  ): Promise<ManufacturerAppeal> {
    const notice = await this.repo.findNoticeById(input.noticeId);
    if (!notice) {
      throw ApiError.notFound('36_NOT_FOUND', `Notice with ID '${input.noticeId}' does not exist`);
    }

    const year = new Date().getFullYear();
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const appealNumber = `LM/APL/${year}/${randSuffix}`;

    const appeal: ManufacturerAppeal = {
      id: uuidv4(),
      appealNumber,
      noticeId: input.noticeId,
      manufacturerId: input.manufacturerId,
      appellantName: input.appellantName,
      groundsForAppeal: input.groundsForAppeal,
      correctiveActionPlan: input.correctiveActionPlan,
      rectificationEvidence: input.rectificationEvidence.map(e => ({
        ...e,
        uploadedAt: new Date(),
      })),
      status: 'SUBMITTED',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const saved = await this.repo.saveAppeal(appeal);

    // Update notice status to RESPONDED
    notice.status = 'RESPONDED';
    notice.updatedAt = new Date();
    await this.repo.updateNotice(notice);

    await auditLogService.log({
      userId: user.id,
      action: 'SUBMIT_MANUFACTURER_APPEAL',
      objectType: 'MANUFACTURER_APPEAL',
      objectId: saved.id,
      newValue: saved,
      ipAddress,
    });

    return saved;
  }

  public async reviewAppeal(
    id: string,
    input: ReviewAppealInput,
    user: AuthUser,
    ipAddress?: string
  ): Promise<ManufacturerAppeal> {
    const appeal = await this.getAppealById(id);
    const prev = { ...appeal };

    let newStatus: AppealStatus;
    switch (input.decision) {
      case 'ACCEPT':
        newStatus = 'ACCEPTED';
        break;
      case 'REJECT':
        newStatus = 'REJECTED';
        break;
      case 'REQUEST_MORE_INFO':
        newStatus = 'ADDITIONAL_INFO_REQUESTED';
        break;
      case 'MITIGATE':
        newStatus = 'MITIGATED';
        break;
    }

    appeal.status = newStatus;
    appeal.decision = input.decision;
    appeal.decisionNotes = input.decisionNotes;
    appeal.penaltyMitigationPercent = input.penaltyMitigationPercent || 0;
    appeal.reviewedBy = user.id;
    appeal.reviewedAt = new Date();
    appeal.updatedAt = new Date();

    const updated = await this.repo.updateAppeal(appeal);

    await auditLogService.log({
      userId: user.id,
      action: 'REVIEW_MANUFACTURER_APPEAL',
      objectType: 'MANUFACTURER_APPEAL',
      objectId: id,
      previousValue: prev,
      newValue: updated,
      reason: input.decisionNotes,
      ipAddress,
    });

    return updated;
  }
}
