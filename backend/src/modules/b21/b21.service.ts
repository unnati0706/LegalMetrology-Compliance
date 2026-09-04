import { B21Repository } from './b21.repository.js';
import { AuditService } from '../../shared/audit/index.js';
import { ApiError } from '../../shared/errors/index.js';
import { CheckResult, Declaration, CheckResultStatus } from '../../shared/types/index.js';

interface ValidateInput {
  inspectionId: string;
  isImported?: boolean;
  ruleVersion?: string;
  declarations: {
    field: string;
    value: string;
    rawText?: string;
    confidence: number;
    evidenceId?: string;
    boundingBox?: any;
  }[];
}

export class B21Service {
  constructor(private repo: B21Repository = new B21Repository()) {}

  public async evaluateCompleteness(input: ValidateInput, userId: string): Promise<{
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
    
    // Save raw declarations
    const savedDeclarations = this.repo.saveDeclarations(
      input.declarations.map(d => ({
        inspectionId: input.inspectionId,
        field: d.field.toLowerCase().trim(),
        value: d.value.trim(),
        rawText: d.rawText,
        confidence: d.confidence ?? 0.9,
        status: 'DETECTED',
        evidenceId: d.evidenceId,
        boundingBox: d.boundingBox,
      }))
    );

    const declMap = new Map<string, Declaration>();
    for (const d of savedDeclarations) {
      declMap.set(d.field, d);
    }

    const mandatoryRules = [
      { fieldKey: 'manufacturer_packer_importer', code: 'PCR-2011-R06-1-A', label: 'Manufacturer/Packer/Importer' },
      { fieldKey: 'generic_name', code: 'PCR-2011-R06-1-B', label: 'Generic / Common Name' },
      { fieldKey: 'net_quantity', code: 'PCR-2011-R06-1-C', label: 'Net Quantity' },
      { fieldKey: 'mfg_date', code: 'PCR-2011-R06-1-D', label: 'Date of Manufacture / Packing' },
      { fieldKey: 'mrp', code: 'PCR-2011-R06-1-E', label: 'Maximum Retail Price (MRP)' },
      { fieldKey: 'consumer_care', code: 'PCR-2011-R06-1-G', label: 'Consumer Care Details' },
    ];

    if (input.isImported) {
      mandatoryRules.push({ fieldKey: 'country_of_origin', code: 'PCR-2011-R06-ORIGIN', label: 'Country of Origin' });
    }

    const resultsToSave: Omit<CheckResult, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    for (const ruleDef of mandatoryRules) {
      const rule = this.repo.findRuleByCode(ruleDef.code, version);
      if (!rule) {
        throw ApiError.notFound('RULE_VERSION_NOT_FOUND', `Rule ${ruleDef.code} not found for version ${version}`);
      }

      const decl = declMap.get(ruleDef.fieldKey);

      let status: CheckResultStatus = 'PASS';
      let confidence = 1.0;
      let explanation = '';

      if (!decl || !decl.value || decl.value.trim().length === 0) {
        status = 'FLAG';
        confidence = 1.0;
        explanation = `Mandatory declaration "${ruleDef.label}" is missing from the package label in violation of ${rule.legalReference}.`;
      } else if (decl.confidence < 0.75) {
        status = 'MANUAL_REVIEW';
        confidence = decl.confidence;
        explanation = `Declaration "${ruleDef.label}" detected with low OCR confidence (${(decl.confidence * 100).toFixed(1)}%). Requires inspector verification.`;
      } else {
        status = 'PASS';
        confidence = decl.confidence;
        explanation = `Mandatory declaration "${ruleDef.label}" is present on the package per ${rule.legalReference}.`;
      }

      resultsToSave.push({
        inspectionId: input.inspectionId,
        ruleId: rule.id,
        ruleCode: rule.ruleCode,
        ruleVersion: version,
        status,
        confidence,
        explanation,
        declarationId: decl?.id,
        evidenceId: decl?.evidenceId,
        boundingBox: decl?.boundingBox,
        evaluationDetails: {
          fieldChecked: ruleDef.fieldKey,
          foundValue: decl?.value ?? null,
          ruleTitle: rule.title,
        }
      });
    }

    const savedResults = this.repo.saveCheckResults(resultsToSave);

    const summary = {
      totalChecks: savedResults.length,
      passed: savedResults.filter(r => r.status === 'PASS').length,
      flagged: savedResults.filter(r => r.status === 'FLAG').length,
      manualReview: savedResults.filter(r => r.status === 'MANUAL_REVIEW').length,
    };

    await AuditService.log({
      userId,
      action: 'B21_COMPLETENESS_EVALUATED',
      objectType: 'Inspection',
      objectId: input.inspectionId,
      newValue: { summary, checkCount: savedResults.length },
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
      throw ApiError.notFound('21_NOT_FOUND', `Check result ${id} not found in Module B21`);
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
      throw ApiError.notFound('21_NOT_FOUND', `Check result ${id} not found`);
    }

    const updated = this.repo.updateCheckResult(id, {
      status,
      isOverridden: true,
      overriddenBy: userId,
      overrideReason,
    });

    await AuditService.log({
      userId,
      action: 'B21_CHECK_RESULT_OVERRIDE',
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
