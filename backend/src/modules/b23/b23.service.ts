import { B23Repository } from './b23.repository.js';
import { AuditService } from '../../shared/audit/index.js';
import { ApiError } from '../../shared/errors/index.js';
import { CheckResult, CheckResultStatus } from '../../shared/types/index.js';

interface EntityConsumerCareInput {
  inspectionId: string;
  ruleVersion?: string;
  entityDeclaration: {
    entityType?: 'MANUFACTURER' | 'PACKER' | 'IMPORTER' | 'MARKETER';
    rawText: string;
    entityName?: string;
    address?: string;
    pinCode?: string;
    confidence: number;
    evidenceId?: string;
    boundingBox?: any;
  };
  consumerCareDeclaration: {
    rawText: string;
    contactPersonOrCell?: string;
    phone?: string;
    email?: string;
    postalAddress?: string;
    confidence: number;
    evidenceId?: string;
    boundingBox?: any;
  };
}

export class B23Service {
  constructor(private repo: B23Repository = new B23Repository()) {}

  public async evaluateEntityAndConsumerCare(input: EntityConsumerCareInput, userId: string): Promise<{
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

    const entityText = (input.entityDeclaration.rawText || '').trim();
    const entityConf = input.entityDeclaration.confidence ?? 0.9;

    const ccText = (input.consumerCareDeclaration.rawText || '').trim();
    const ccConf = input.consumerCareDeclaration.confidence ?? 0.9;

    // 1. Check Entity Complete Postal Address & Indian PIN Code
    const addrRule = this.repo.findRuleByCode('PCR-2011-R06-ENTITY-ADDR', version);
    if (!addrRule) {
      throw ApiError.notFound('RULE_VERSION_NOT_FOUND', `Rule PCR-2011-R06-ENTITY-ADDR not found for version ${version}`);
    }

    const pinMatch = entityText.match(/\b([1-9][0-9]{5})\b/);
    const hasPinCode = Boolean(input.entityDeclaration.pinCode || pinMatch);
    const pinCodeValue = input.entityDeclaration.pinCode || (pinMatch ? pinMatch[1] : null);

    const hasEntityRole = /mfd\.?\s*by|manufactured\s*by|pkd\.?\s*by|packed\s*by|imported\s*by|marketed\s*by/i.test(entityText);

    let addrStatus: CheckResultStatus = 'PASS';
    let addrExplanation = '';

    if (entityConf < 0.75) {
      addrStatus = 'MANUAL_REVIEW';
      addrExplanation = `Entity declaration "${entityText}" has low OCR confidence (${(entityConf * 100).toFixed(1)}%). Requires manual verification.`;
    } else if (!hasEntityRole) {
      addrStatus = 'FLAG';
      addrExplanation = `Declaration does not clearly specify manufacturer/packer/importer role prefix (e.g., 'Manufactured by' / 'Packed by') per ${addrRule.legalReference}.`;
    } else if (!hasPinCode) {
      addrStatus = 'FLAG';
      addrExplanation = `Manufacturer/packer address is missing a valid 6-digit Indian PIN code in violation of ${addrRule.legalReference}.`;
    } else {
      addrStatus = 'PASS';
      addrExplanation = `Complete entity address with valid Indian PIN code (${pinCodeValue}) verified per ${addrRule.legalReference}.`;
    }

    resultsToSave.push({
      inspectionId: input.inspectionId,
      ruleId: addrRule.id,
      ruleCode: addrRule.ruleCode,
      ruleVersion: version,
      status: addrStatus,
      confidence: entityConf,
      explanation: addrExplanation,
      evidenceId: input.entityDeclaration.evidenceId,
      boundingBox: input.entityDeclaration.boundingBox,
      evaluationDetails: {
        rawText: entityText,
        hasPinCode,
        pinCodeValue,
        hasEntityRole,
      }
    });

    // 2. Check Consumer Care Phone Number
    const phoneRule = this.repo.findRuleByCode('PCR-2011-R06-CC-PHONE', version);
    if (!phoneRule) {
      throw ApiError.notFound('RULE_VERSION_NOT_FOUND', `Rule PCR-2011-R06-CC-PHONE not found for version ${version}`);
    }

    // Phone patterns: Indian mobile 10-digits, landline with STD, toll-free 1800
    const phonePattern = /(?:1800[-\s]?\d{3}[-\s]?\d{3,4})|(?:\+?91[-\s]?)?[6-9]\d{9}|(?:0\d{2,4}[-\s]?\d{6,8})/;
    const phoneMatch = ccText.match(phonePattern);
    const hasValidPhone = Boolean(input.consumerCareDeclaration.phone || phoneMatch);

    let phoneStatus: CheckResultStatus = 'PASS';
    let phoneExplanation = '';

    if (ccConf < 0.75) {
      phoneStatus = 'MANUAL_REVIEW';
      phoneExplanation = `Consumer care text "${ccText}" has low confidence (${(ccConf * 100).toFixed(1)}%). Needs review.`;
    } else if (!hasValidPhone) {
      phoneStatus = 'FLAG';
      phoneExplanation = `Consumer care declaration is missing a valid operational Indian phone/toll-free number in violation of ${phoneRule.legalReference}.`;
    } else {
      phoneStatus = 'PASS';
      phoneExplanation = `Valid Indian consumer care phone number verified per ${phoneRule.legalReference}.`;
    }

    resultsToSave.push({
      inspectionId: input.inspectionId,
      ruleId: phoneRule.id,
      ruleCode: phoneRule.ruleCode,
      ruleVersion: version,
      status: phoneStatus,
      confidence: ccConf,
      explanation: phoneExplanation,
      evidenceId: input.consumerCareDeclaration.evidenceId,
      boundingBox: input.consumerCareDeclaration.boundingBox,
      evaluationDetails: {
        rawText: ccText,
        hasValidPhone,
      }
    });

    // 3. Check Consumer Care Email Address
    const emailRule = this.repo.findRuleByCode('PCR-2011-R06-CC-EMAIL', version);
    if (!emailRule) {
      throw ApiError.notFound('RULE_VERSION_NOT_FOUND', `Rule PCR-2011-R06-CC-EMAIL not found for version ${version}`);
    }

    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const emailMatch = ccText.match(emailPattern);
    const hasValidEmail = Boolean(input.consumerCareDeclaration.email || emailMatch);

    let emailStatus: CheckResultStatus = 'PASS';
    let emailExplanation = '';

    if (ccConf < 0.75) {
      emailStatus = 'MANUAL_REVIEW';
      emailExplanation = `Consumer care email in "${ccText}" requires verification due to low extraction confidence.`;
    } else if (!hasValidEmail) {
      emailStatus = 'FLAG';
      emailExplanation = `Consumer care declaration is missing a valid email address in violation of ${emailRule.legalReference}.`;
    } else {
      emailStatus = 'PASS';
      emailExplanation = `Valid consumer care email address verified per ${emailRule.legalReference}.`;
    }

    resultsToSave.push({
      inspectionId: input.inspectionId,
      ruleId: emailRule.id,
      ruleCode: emailRule.ruleCode,
      ruleVersion: version,
      status: emailStatus,
      confidence: ccConf,
      explanation: emailExplanation,
      evidenceId: input.consumerCareDeclaration.evidenceId,
      boundingBox: input.consumerCareDeclaration.boundingBox,
      evaluationDetails: {
        rawText: ccText,
        hasValidEmail,
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
      action: 'B23_ENTITY_CONSUMER_CARE_EVALUATED',
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
      throw ApiError.notFound('23_NOT_FOUND', `Check result ${id} not found in Module B23`);
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
      throw ApiError.notFound('23_NOT_FOUND', `Check result ${id} not found in Module B23`);
    }

    const updated = this.repo.updateCheckResult(id, {
      status,
      isOverridden: true,
      overriddenBy: userId,
      overrideReason,
    });

    await AuditService.log({
      userId,
      action: 'B23_CHECK_RESULT_OVERRIDE',
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
