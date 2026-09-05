import { B26Repository } from './b26.repository.js';
import { AuditService } from '../../shared/audit/index.js';
import { ApiError } from '../../shared/errors/index.js';
import { CheckResult, Violation } from '../../shared/types/index.js';

export class B26Service {
  constructor(private repo: B26Repository = new B26Repository()) {}

  public async getReviewQueue(query: {
    inspectionId?: string;
    status: string;
    ruleCategory?: string;
    minConfidence?: number;
    maxConfidence?: number;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
  }) {
    return this.repo.findCheckResults(query);
  }

  public async getReviewItemById(id: string) {
    const item = this.repo.findCheckResultById(id);
    if (!item) {
      throw ApiError.notFound('26_NOT_FOUND', `Manual review check result ${id} not found`);
    }

    const rule = this.repo.findRuleById(item.ruleId);
    return {
      ...item,
      rule,
    };
  }

  public async resolveReviewItem(
    id: string,
    params: {
      resolution: 'CONFIRM_PASS' | 'CONFIRM_FLAG' | 'DISMISS';
      overrideReason: string;
      notes?: string;
      correctedValue?: string;
    },
    userId: string
  ): Promise<{ checkResult: CheckResult; violation?: Violation }> {
    const existing = this.repo.findCheckResultById(id);
    if (!existing) {
      throw ApiError.notFound('26_NOT_FOUND', `Check result ${id} not found in Manual Review queue`);
    }

    if (existing.status !== 'MANUAL_REVIEW' && !existing.isOverridden && params.resolution === 'DISMISS') {
      // Disallow dismissal if not in review
      throw ApiError.conflict('INVALID_STATE_TRANSITION', 'Only pending manual review items can be dismissed');
    }

    let newStatus: 'PASS' | 'FLAG' = 'PASS';
    let violationCreated: Violation | undefined = undefined;

    if (params.resolution === 'CONFIRM_PASS') {
      newStatus = 'PASS';
    } else if (params.resolution === 'CONFIRM_FLAG') {
      newStatus = 'FLAG';

      // Auto-generate violation
      const rule = this.repo.findRuleById(existing.ruleId);
      const existingViol = this.repo.findExistingViolation(existing.inspectionId, existing.id);
      if (!existingViol) {
        violationCreated = this.repo.saveViolation({
          inspectionId: existing.inspectionId,
          checkResultId: existing.id,
          ruleId: existing.ruleId,
          ruleCode: existing.ruleCode || rule?.ruleCode || 'PCR-MANUAL-FLAG',
          ruleVersion: existing.ruleVersion,
          legalReference: rule?.legalReference || 'Legal Metrology (Packaged Commodities) Rules, 2011',
          violationType: rule?.title || 'Manual Inspection Flagged Non-Compliance',
          severity: rule?.severity || 'MAJOR',
          explanation: `Inspector confirmed violation upon manual review: ${params.notes || params.overrideReason}`,
          evidenceId: existing.evidenceId,
          boundingBox: existing.boundingBox,
          status: 'OPEN',
        });
      }
    } else if (params.resolution === 'DISMISS') {
      newStatus = 'PASS';
    }

    const updatedCheckResult = this.repo.updateCheckResult(id, {
      status: newStatus,
      isOverridden: true,
      overriddenBy: userId,
      overrideReason: params.overrideReason,
      explanation: `${existing.explanation} [Manual Review by ${userId}: ${params.resolution} - ${params.overrideReason}]`,
    });

    await AuditService.log({
      userId,
      action: 'B26_MANUAL_REVIEW_RESOLVED',
      objectType: 'CheckResult',
      objectId: id,
      previousValue: { status: existing.status },
      newValue: {
        status: newStatus,
        resolution: params.resolution,
        overrideReason: params.overrideReason,
        violationId: violationCreated?.id,
      },
      reason: params.overrideReason,
    });

    return {
      checkResult: updatedCheckResult!,
      violation: violationCreated,
    };
  }

  public async batchAssignReviews(
    input: {
      inspectionId: string;
      assignedTo?: string;
      checkResultIds: string[];
      notes?: string;
    },
    userId: string
  ): Promise<{ assignedCount: number; inspectionId: string }> {
    let count = 0;
    for (const checkId of input.checkResultIds) {
      const check = this.repo.findCheckResultById(checkId);
      if (check && check.inspectionId === input.inspectionId) {
        count++;
      }
    }

    await AuditService.log({
      userId,
      action: 'B26_BATCH_ASSIGNED',
      objectType: 'Inspection',
      objectId: input.inspectionId,
      newValue: { assignedCount: count, assignedTo: input.assignedTo },
      reason: input.notes,
    });

    return { assignedCount: count, inspectionId: input.inspectionId };
  }
}
