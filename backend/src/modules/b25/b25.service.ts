import { B25Repository } from './b25.repository.js';
import { AuditService } from '../../shared/audit/index.js';
import { ApiError } from '../../shared/errors/index.js';
import { Violation, ViolationStatus } from '../../shared/types/index.js';

interface GenerateViolationsInput {
  inspectionId: string;
  checkResultIds?: string[];
  autoResolveFixed?: boolean;
}

export class B25Service {
  constructor(private repo: B25Repository = new B25Repository()) {}

  public async generateViolations(input: GenerateViolationsInput, userId: string): Promise<{
    inspectionId: string;
    generatedCount: number;
    existingCount: number;
    violations: Violation[];
  }> {
    let checkResults = this.repo.findCheckResultsByInspectionId(input.inspectionId);
    if (input.checkResultIds && input.checkResultIds.length > 0) {
      checkResults = checkResults.filter(r => input.checkResultIds!.includes(r.id));
    }

    const flaggedChecks = checkResults.filter(r => r.status === 'FLAG');

    const generated: Violation[] = [];
    let existingCount = 0;

    for (const check of flaggedChecks) {
      const existing = this.repo.findExistingViolation(input.inspectionId, check.id);
      if (existing) {
        existingCount++;
        generated.push(existing);
        continue;
      }

      const rule = this.repo.findRuleById(check.ruleId);
      const ruleCode = rule?.ruleCode || check.ruleCode || 'PCR-2011-UNKNOWN';
      const legalRef = rule?.legalReference || 'Legal Metrology (Packaged Commodities) Rules, 2011';
      const severity = rule?.severity || 'MAJOR';

      let packageSide = 'PDP';
      if (check.evidenceId) {
        const evidence = this.repo.findEvidenceById(check.evidenceId);
        if (evidence) {
          packageSide = evidence.packageSide;
        }
      }

      const violation = this.repo.saveViolation({
        inspectionId: input.inspectionId,
        checkResultId: check.id,
        ruleId: check.ruleId,
        ruleCode,
        ruleVersion: check.ruleVersion,
        legalReference: legalRef,
        violationType: rule?.title || 'Non-Compliance with Packaged Commodities Rules',
        severity,
        explanation: check.explanation,
        evidenceId: check.evidenceId,
        packageSide,
        boundingBox: check.boundingBox,
        status: 'OPEN',
      });

      generated.push(violation);
    }

    await AuditService.log({
      userId,
      action: 'B25_VIOLATIONS_GENERATED',
      objectType: 'Inspection',
      objectId: input.inspectionId,
      newValue: {
        flaggedChecksCount: flaggedChecks.length,
        generatedCount: generated.length - existingCount,
        existingCount,
      },
    });

    return {
      inspectionId: input.inspectionId,
      generatedCount: generated.length - existingCount,
      existingCount,
      violations: generated,
    };
  }

  public async getViolationById(id: string): Promise<Violation & { rule?: any; evidence?: any }> {
    const violation = this.repo.findViolationById(id);
    if (!violation) {
      throw ApiError.notFound('25_NOT_FOUND', `Violation ${id} not found in Module B25`);
    }

    const rule = this.repo.findRuleById(violation.ruleId);
    const evidence = violation.evidenceId ? this.repo.findEvidenceById(violation.evidenceId) : undefined;

    return {
      ...violation,
      rule,
      evidence,
    };
  }

  public async updateViolation(
    id: string,
    updates: {
      status: ViolationStatus;
      resolutionNotes: string;
      evidenceId?: string;
      boundingBox?: any;
    },
    userId: string
  ): Promise<Violation> {
    const existing = this.repo.findViolationById(id);
    if (!existing) {
      throw ApiError.notFound('25_NOT_FOUND', `Violation ${id} not found`);
    }

    // Invalid state transition check
    if (existing.status === 'RESOLVED' && updates.status === 'OPEN') {
      throw ApiError.conflict('INVALID_STATE_TRANSITION', 'Cannot reopen an already verified and resolved violation');
    }

    const updated = this.repo.updateViolation(id, {
      status: updates.status,
      resolutionNotes: updates.resolutionNotes,
      resolvedBy: userId,
      evidenceId: updates.evidenceId || existing.evidenceId,
      boundingBox: updates.boundingBox || existing.boundingBox,
    });

    await AuditService.log({
      userId,
      action: 'B25_VIOLATION_STATUS_UPDATED',
      objectType: 'Violation',
      objectId: id,
      previousValue: { status: existing.status },
      newValue: { status: updates.status, resolutionNotes: updates.resolutionNotes },
      reason: updates.resolutionNotes,
    });

    return updated!;
  }

  public async listViolations(query: {
    inspectionId?: string;
    severity?: string;
    status?: string;
    ruleCode?: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
  }) {
    return this.repo.findViolations(query);
  }
}
