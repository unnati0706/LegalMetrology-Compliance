import { v4 as uuidv4 } from 'uuid';
import { B38Repository } from './b38.repository.js';
import { 
  AssessPenaltyInput, 
  UpdatePenaltyPaymentInput, 
  QueryPenaltiesInput 
} from './b38.schemas.js';
import { PenaltyAssessment, PenaltyBreakdownItem, OffenseType } from '../../shared/types/index.js';
import { AuthUser } from '../../shared/auth/index.js';
import { ApiError } from '../../shared/errors/index.js';
import { auditLogService } from '../../shared/audit/index.js';

export class B38Service {
  constructor(private repo: B38Repository = new B38Repository()) {}

  public async listPenalties(query: QueryPenaltiesInput) {
    return this.repo.getPenalties(query);
  }

  public async getPenaltyById(id: string): Promise<PenaltyAssessment> {
    const penalty = await this.repo.findPenaltyById(id);
    if (!penalty) {
      throw ApiError.notFound('38_NOT_FOUND', `Penalty assessment with ID '${id}' not found`);
    }
    return penalty;
  }

  public async assessPenalty(
    input: AssessPenaltyInput,
    user: AuthUser,
    ipAddress?: string
  ): Promise<PenaltyAssessment> {
    const multiplierMap: Record<OffenseType, number> = {
      FIRST_OFFENSE: 1.0,
      SECOND_OFFENSE: 2.0,
      SUBSEQUENT_OFFENSE: 4.0,
    };

    const multiplier = multiplierMap[input.offenseType] || 1.0;
    const breakdown: PenaltyBreakdownItem[] = [];
    let totalAmount = 0;

    for (const section of input.sectionsViolated) {
      let base = input.customBaseAmount || 25000;
      if (section.includes('39')) {
        base = input.customBaseAmount || 20000;
      }
      const finalAmount = base * multiplier;
      totalAmount += finalAmount;

      breakdown.push({
        section,
        baseAmount: base,
        offenseMultiplier: multiplier,
        finalAmount,
        description: `Statutory penalty assessed under ${section} (${input.offenseType})`,
      });
    }

    const compoundingFee = input.compoundingApplicable ? totalAmount : 0;
    const year = new Date().getFullYear();
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const assessmentNumber = `LM/FIN/${year}/PA-${randSuffix}`;

    const assessment: PenaltyAssessment = {
      id: uuidv4(),
      assessmentNumber,
      inspectionId: input.inspectionId,
      noticeId: input.noticeId,
      manufacturerId: input.manufacturerId,
      manufacturerName: input.manufacturerName,
      offenseType: input.offenseType,
      totalAmount,
      compoundingApplicable: input.compoundingApplicable,
      compoundingFee,
      breakdown,
      status: 'ASSESSED',
      assessedBy: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const saved = await this.repo.savePenalty(assessment);

    await auditLogService.log({
      userId: user.id,
      action: 'ASSESS_PENALTY',
      objectType: 'PENALTY_ASSESSMENT',
      objectId: saved.id,
      newValue: saved,
      ipAddress,
    });

    return saved;
  }

  public async updatePayment(
    id: string,
    input: UpdatePenaltyPaymentInput,
    user: AuthUser,
    ipAddress?: string
  ): Promise<PenaltyAssessment> {
    const penalty = await this.getPenaltyById(id);
    const prev = { ...penalty };

    penalty.status = input.status;
    if (input.status === 'PAID') {
      penalty.paidAt = new Date();
      penalty.paymentReference = input.paymentReference || `PAY-TXN-${Date.now()}`;
      penalty.receiptNumber = input.receiptNumber || `LM/REC/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (input.courtCaseReference) {
      penalty.courtCaseReference = input.courtCaseReference;
    }
    penalty.updatedAt = new Date();

    const updated = await this.repo.updatePenalty(penalty);

    await auditLogService.log({
      userId: user.id,
      action: 'UPDATE_PENALTY_STATUS',
      objectType: 'PENALTY_ASSESSMENT',
      objectId: id,
      previousValue: prev,
      newValue: updated,
      reason: input.notes,
      ipAddress,
    });

    return updated;
  }
}
