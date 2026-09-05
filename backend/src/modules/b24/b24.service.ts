import { B24Repository } from './b24.repository.js';
import { AuditService } from '../../shared/audit/index.js';
import { ApiError } from '../../shared/errors/index.js';
import { CheckResult, CheckResultStatus } from '../../shared/types/index.js';
import { VisionAdapter, MockVisionAdapter } from '../../shared/adapters/index.js';

interface DatePlacementInput {
  inspectionId: string;
  ruleVersion?: string;
  inspectionDate?: string;
  dateDeclaration: {
    rawText: string;
    month?: number;
    year?: number;
    confidence: number;
    evidenceId?: string;
    boundingBox?: any;
  };
  packageDetails: {
    netQuantityGramsOrMl: number;
    packageSide?: 'FRONT' | 'BACK' | 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT' | 'PDP' | 'OTHER';
    measuredFontHeightMm?: number;
    contrastRatio?: number;
    isLegible?: boolean;
    evidenceId?: string;
    boundingBox?: any;
  };
}

export class B24Service {
  constructor(
    private repo: B24Repository = new B24Repository(),
    private visionAdapter: VisionAdapter = new MockVisionAdapter()
  ) {}

  public async evaluateDateAndPlacement(input: DatePlacementInput, userId: string): Promise<{
    inspectionId: string;
    ruleVersion: string;
    summary: {
      totalChecks: number;
      passed: number;
      flagged: number;
      manualReview: number;
    };
    results: CheckResult[];
  }> {
    const version = input.ruleVersion || 'PCR-2011-v2.0';
    const resultsToSave: Omit<CheckResult, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    const dateText = (input.dateDeclaration.rawText || '').trim();
    const dateConf = input.dateDeclaration.confidence ?? 0.9;
    const inspDate = input.inspectionDate ? new Date(input.inspectionDate) : new Date();

    // 1. Evaluate Date of Manufacture / Packing / Import
    const dateRule = this.repo.findRuleByCode('PCR-2011-R06-DATE-FORMAT', version);
    if (!dateRule) {
      throw ApiError.notFound('RULE_VERSION_NOT_FOUND', `Rule PCR-2011-R06-DATE-FORMAT not found for version ${version}`);
    }

    // Try parsing date components (e.g. 01/2026, Jan 2026, 05-2025, 08/25)
    let parsedMonth = input.dateDeclaration.month;
    let parsedYear = input.dateDeclaration.year;

    if (!parsedMonth || !parsedYear) {
      const monthNames: Record<string, number> = {
        jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
        jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
      };

      const wordMatch = dateText.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[.\s\/-]+(\d{2,4})/i);
      if (wordMatch) {
        parsedMonth = monthNames[wordMatch[1].toLowerCase().slice(0, 3)];
        let yr = parseInt(wordMatch[2], 10);
        if (yr < 100) yr += 2000;
        parsedYear = yr;
      } else {
        const numMatch = dateText.match(/(\d{1,2})[\/.-](\d{2,4})/);
        if (numMatch) {
          parsedMonth = parseInt(numMatch[1], 10);
          let yr = parseInt(numMatch[2], 10);
          if (yr < 100) yr += 2000;
          parsedYear = yr;
        }
      }
    }

    let dateStatus: CheckResultStatus = 'PASS';
    let dateExplanation = '';
    let isPostDated = false;

    if (dateConf < 0.75) {
      dateStatus = 'MANUAL_REVIEW';
      dateExplanation = `Date declaration "${dateText}" extracted with low confidence (${(dateConf * 100).toFixed(1)}%). Requires inspector check.`;
    } else if (!parsedMonth || !parsedYear || parsedMonth < 1 || parsedMonth > 12) {
      dateStatus = 'FLAG';
      dateExplanation = `Date declaration "${dateText}" does not conform to required Month and Year format under ${dateRule.legalReference}.`;
    } else {
      const inspYear = inspDate.getFullYear();
      const inspMonth = inspDate.getMonth() + 1;

      // Post-dating check: if pack date is after inspection date
      if (parsedYear > inspYear || (parsedYear === inspYear && parsedMonth > inspMonth)) {
        isPostDated = true;
        dateStatus = 'FLAG';
        dateExplanation = `Package is post-dated (${String(parsedMonth).padStart(2, '0')}/${parsedYear}) beyond inspection date (${String(inspMonth).padStart(2, '0')}/${inspYear}), in direct violation of ${dateRule.legalReference}.`;
      } else {
        dateStatus = 'PASS';
        dateExplanation = `Valid manufacturing/packing date declared (${String(parsedMonth).padStart(2, '0')}/${parsedYear}) per ${dateRule.legalReference}.`;
      }
    }

    resultsToSave.push({
      inspectionId: input.inspectionId,
      ruleId: dateRule.id,
      ruleCode: dateRule.ruleCode,
      ruleVersion: version,
      status: dateStatus,
      confidence: dateConf,
      explanation: dateExplanation,
      evidenceId: input.dateDeclaration.evidenceId,
      boundingBox: input.dateDeclaration.boundingBox,
      evaluationDetails: {
        rawText: dateText,
        parsedMonth,
        parsedYear,
        isPostDated,
      }
    });

    // 2. Evaluate Minimum Font Height (Rule 7 & Schedule II)
    const fontRule = this.repo.findRuleByCode('PCR-2011-R07-FONT-HEIGHT', version);
    if (!fontRule) {
      throw ApiError.notFound('RULE_VERSION_NOT_FOUND', `Rule PCR-2011-R07-FONT-HEIGHT not found for version ${version}`);
    }

    const netQty = input.packageDetails.netQuantityGramsOrMl;
    let requiredMinHeightMm = 1.0;
    if (netQty > 1000) {
      requiredMinHeightMm = 4.0;
    } else if (netQty > 200) {
      requiredMinHeightMm = 2.0;
    }

    const measuredHeight = input.packageDetails.measuredFontHeightMm ?? 2.5;

    let fontStatus: CheckResultStatus = 'PASS';
    let fontExplanation = '';

    if (measuredHeight < requiredMinHeightMm) {
      fontStatus = 'FLAG';
      fontExplanation = `Measured numeral font height (${measuredHeight}mm) is below the statutory minimum of ${requiredMinHeightMm}mm for net quantity ${netQty}g/ml per ${fontRule.legalReference}.`;
    } else {
      fontStatus = 'PASS';
      fontExplanation = `Numeral font height (${measuredHeight}mm) complies with minimum requirement (>= ${requiredMinHeightMm}mm) for net quantity ${netQty}g/ml per ${fontRule.legalReference}.`;
    }

    resultsToSave.push({
      inspectionId: input.inspectionId,
      ruleId: fontRule.id,
      ruleCode: fontRule.ruleCode,
      ruleVersion: version,
      status: fontStatus,
      confidence: 0.9,
      explanation: fontExplanation,
      evidenceId: input.packageDetails.evidenceId,
      boundingBox: input.packageDetails.boundingBox,
      evaluationDetails: {
        netQuantity: netQty,
        requiredMinHeightMm,
        measuredHeight,
      }
    });

    // 3. Evaluate PDP Prominence & Readability (Rule 9)
    const pdpRule = this.repo.findRuleByCode('PCR-2011-R09-PDP-READABILITY', version);
    if (!pdpRule) {
      throw ApiError.notFound('RULE_VERSION_NOT_FOUND', `Rule PCR-2011-R09-PDP-READABILITY not found for version ${version}`);
    }

    const contrastRatio = input.packageDetails.contrastRatio ?? 4.5;
    const isLegible = input.packageDetails.isLegible ?? true;

    let pdpStatus: CheckResultStatus = 'PASS';
    let pdpExplanation = '';

    if (!isLegible) {
      pdpStatus = 'FLAG';
      pdpExplanation = `Principal Display Panel text is illegible or obscured, violating clarity requirements of ${pdpRule.legalReference}.`;
    } else if (contrastRatio < 3.0) {
      pdpStatus = 'FLAG';
      pdpExplanation = `Color contrast ratio (${contrastRatio.toFixed(1)}:1) is insufficient (< 3.0:1) causing poor legibility under ${pdpRule.legalReference}.`;
    } else {
      pdpStatus = 'PASS';
      pdpExplanation = `Principal Display Panel declarations are conspicuous and legible with adequate contrast ratio (${contrastRatio.toFixed(1)}:1).`;
    }

    resultsToSave.push({
      inspectionId: input.inspectionId,
      ruleId: pdpRule.id,
      ruleCode: pdpRule.ruleCode,
      ruleVersion: version,
      status: pdpStatus,
      confidence: 0.92,
      explanation: pdpExplanation,
      evidenceId: input.packageDetails.evidenceId,
      boundingBox: input.packageDetails.boundingBox,
      evaluationDetails: {
        contrastRatio,
        isLegible,
        packageSide: input.packageDetails.packageSide,
      }
    });

    const savedResults = this.repo.saveCheckResults(resultsToSave);

    const summary = {
      totalChecks: savedResults.length,
      passed: savedResults.filter(r => r.status === 'PASS').length,
      flagged: savedResults.filter(r => r.status === 'FLAG').length,
      manualReview: savedResults.filter(r => r.status === 'MANUAL_REVIEW').length,
    };

    await AuditService.log({
      userId,
      action: 'B24_DATE_PLACEMENT_EVALUATED',
      objectType: 'Inspection',
      objectId: input.inspectionId,
      newValue: { summary },
    });

    return {
      inspectionId: input.inspectionId,
      ruleVersion: version,
      summary,
      results: savedResults,
    };
  }

  public async getCheckResultById(id: string): Promise<CheckResult> {
    const result = this.repo.findCheckResultById(id);
    if (!result) {
      throw ApiError.notFound('24_NOT_FOUND', `Check result ${id} not found in Module B24`);
    }
    return result;
  }

  public async overrideCheckResult(
    id: string, 
    status: CheckResultStatus, 
    overrideReason: string, 
    userId: string
  ): Promise<CheckResult> {
    const existing = this.repo.findCheckResultById(id);
    if (!existing) {
      throw ApiError.notFound('24_NOT_FOUND', `Check result ${id} not found in Module B24`);
    }

    const updated = this.repo.updateCheckResult(id, {
      status,
      isOverridden: true,
      overriddenBy: userId,
      overrideReason,
    });

    await AuditService.log({
      userId,
      action: 'B24_CHECK_RESULT_OVERRIDE',
      objectType: 'CheckResult',
      objectId: id,
      previousValue: { status: existing.status },
      newValue: { status, overrideReason },
      reason: overrideReason,
    });

    return updated!;
  }

  public async listCheckResults(query: {
    inspectionId?: string;
    status?: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
  }) {
    return this.repo.findCheckResults(query);
  }
}
