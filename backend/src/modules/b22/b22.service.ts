import { B22Repository } from './b22.repository.js';
import { AuditService } from '../../shared/audit/index.js';
import { ApiError } from '../../shared/errors/index.js';
import { CheckResult, CheckResultStatus } from '../../shared/types/index.js';

interface MrpQuantityInput {
  inspectionId: string;
  ruleVersion?: string;
  mrpDeclaration: {
    rawText: string;
    confidence: number;
    evidenceId?: string;
    boundingBox?: any;
  };
  netQuantityDeclaration: {
    rawText: string;
    confidence: number;
    evidenceId?: string;
    boundingBox?: any;
  };
  unitSalePriceDeclaration?: {
    rawText?: string;
    confidence?: number;
    evidenceId?: string;
    boundingBox?: any;
  };
}

export class B22Service {
  constructor(private repo: B22Repository = new B22Repository()) {}

  public async evaluateMrpAndQuantity(input: MrpQuantityInput, userId: string): Promise<{
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

    const mrpText = (input.mrpDeclaration.rawText || '').trim();
    const netQtyText = (input.netQuantityDeclaration.rawText || '').trim();
    const uspText = (input.unitSalePriceDeclaration?.rawText || '').trim();

    // 1. Check MRP Format and Taxes
    const mrpFormatRule = this.repo.findRuleByCode('PCR-2011-R06-MRP-FORMAT', version);
    if (!mrpFormatRule) {
      throw ApiError.notFound('RULE_VERSION_NOT_FOUND', `Rule PCR-2011-R06-MRP-FORMAT not found for version ${version}`);
    }

    const hasMrpPrefix = /m\.?r\.?p\.?|maximum\s*retail\s*price/i.test(mrpText);
    const hasTaxInclusive = /incl(usive)?\.?\s*(of)?\s*all\s*taxes|incl\.?\s*taxes/i.test(mrpText);

    let mrpFormatStatus: CheckResultStatus = 'PASS';
    let mrpFormatExplanation = '';
    let mrpConfidence = input.mrpDeclaration.confidence ?? 0.9;

    if (mrpConfidence < 0.75) {
      mrpFormatStatus = 'MANUAL_REVIEW';
      mrpFormatExplanation = `MRP text "${mrpText}" extracted with low confidence (${(mrpConfidence * 100).toFixed(1)}%). Requires manual inspection.`;
    } else if (!hasMrpPrefix) {
      mrpFormatStatus = 'FLAG';
      mrpFormatExplanation = `Declaration is missing mandatory "MRP" or "Maximum Retail Price" prefix in violation of ${mrpFormatRule.legalReference}.`;
    } else if (!hasTaxInclusive) {
      mrpFormatStatus = 'FLAG';
      mrpFormatExplanation = `MRP declaration does not state "inclusive of all taxes" in violation of ${mrpFormatRule.legalReference}.`;
    } else {
      mrpFormatStatus = 'PASS';
      mrpFormatExplanation = `MRP correctly declared with tax inclusion: "${mrpText}" per ${mrpFormatRule.legalReference}.`;
    }

    resultsToSave.push({
      inspectionId: input.inspectionId,
      ruleId: mrpFormatRule.id,
      ruleCode: mrpFormatRule.ruleCode,
      ruleVersion: version,
      status: mrpFormatStatus,
      confidence: mrpConfidence,
      explanation: mrpFormatExplanation,
      evidenceId: input.mrpDeclaration.evidenceId,
      boundingBox: input.mrpDeclaration.boundingBox,
      evaluationDetails: {
        rawText: mrpText,
        hasMrpPrefix,
        hasTaxInclusive,
      }
    });

    // 2. Check MRP Indian Currency Symbol
    const mrpCurrencyRule = this.repo.findRuleByCode('PCR-2011-R06-MRP-CURRENCY', version);
    if (!mrpCurrencyRule) {
      throw ApiError.notFound('RULE_VERSION_NOT_FOUND', `Rule PCR-2011-R06-MRP-CURRENCY not found for version ${version}`);
    }

    const hasInrSymbol = /₹|rs\.?|inr/i.test(mrpText);
    const hasForeignCurrency = /\$|€|£|¥/i.test(mrpText);

    let currencyStatus: CheckResultStatus = 'PASS';
    let currencyExplanation = '';

    if (mrpConfidence < 0.75) {
      currencyStatus = 'MANUAL_REVIEW';
      currencyExplanation = `Currency indicator in "${mrpText}" requires manual review due to low OCR confidence.`;
    } else if (hasForeignCurrency) {
      currencyStatus = 'FLAG';
      currencyExplanation = `Package displays foreign currency in violation of Legal Metrology regulations (must be in INR/₹).`;
    } else if (!hasInrSymbol) {
      currencyStatus = 'FLAG';
      currencyExplanation = `MRP does not specify Indian currency designation (₹, Rs., INR) as required by ${mrpCurrencyRule.legalReference}.`;
    } else {
      currencyStatus = 'PASS';
      currencyExplanation = `Valid Indian currency designation verified in MRP declaration.`;
    }

    resultsToSave.push({
      inspectionId: input.inspectionId,
      ruleId: mrpCurrencyRule.id,
      ruleCode: mrpCurrencyRule.ruleCode,
      ruleVersion: version,
      status: currencyStatus,
      confidence: mrpConfidence,
      explanation: currencyExplanation,
      evidenceId: input.mrpDeclaration.evidenceId,
      boundingBox: input.mrpDeclaration.boundingBox,
      evaluationDetails: {
        rawText: mrpText,
        hasInrSymbol,
        hasForeignCurrency,
      }
    });

    // 3. Check Net Quantity Approved Metric Symbols
    const metricRule = this.repo.findRuleByCode('PCR-2011-R06-QTY-METRIC', version);
    if (!metricRule) {
      throw ApiError.notFound('RULE_VERSION_NOT_FOUND', `Rule PCR-2011-R06-QTY-METRIC not found for version ${version}`);
    }

    const netQtyConfidence = input.netQuantityDeclaration.confidence ?? 0.9;
    const hasInvalidMetric = /\b(gms|kgs|ltr|ltrs|kilos?|gm)\b/i.test(netQtyText);
    const hasValidMetric = /\b(\d+(\.\d+)?)\s*(g|kg|ml|l|m|cm|mm|n|u)\b/i.test(netQtyText);

    let metricStatus: CheckResultStatus = 'PASS';
    let metricExplanation = '';

    if (netQtyConfidence < 0.75) {
      metricStatus = 'MANUAL_REVIEW';
      metricExplanation = `Net quantity declaration "${netQtyText}" requires verification due to low extraction confidence.`;
    } else if (hasInvalidMetric) {
      metricStatus = 'FLAG';
      metricExplanation = `Net quantity uses non-standard abbreviations (e.g. gms/kgs/ltr) in violation of ${metricRule.legalReference}. Standard SI symbols (g, kg, ml, l, N) must be used.`;
    } else if (!hasValidMetric) {
      metricStatus = 'FLAG';
      metricExplanation = `Net quantity declaration does not conform to standard metric units or count per ${metricRule.legalReference}.`;
    } else {
      metricStatus = 'PASS';
      metricExplanation = `Net quantity declaration "${netQtyText}" correctly uses approved metric SI units.`;
    }

    resultsToSave.push({
      inspectionId: input.inspectionId,
      ruleId: metricRule.id,
      ruleCode: metricRule.ruleCode,
      ruleVersion: version,
      status: metricStatus,
      confidence: netQtyConfidence,
      explanation: metricExplanation,
      evidenceId: input.netQuantityDeclaration.evidenceId,
      boundingBox: input.netQuantityDeclaration.boundingBox,
      evaluationDetails: {
        rawText: netQtyText,
        hasInvalidMetric,
        hasValidMetric,
      }
    });

    // 4. Check Unit Sale Price (USP)
    const uspRule = this.repo.findRuleByCode('PCR-2011-R06-1-E-USP', version);
    if (!uspRule) {
      throw ApiError.notFound('RULE_VERSION_NOT_FOUND', `Rule PCR-2011-R06-1-E-USP not found for version ${version}`);
    }

    // Check if quantity >= 1kg / 1L or multi-pack
    const qtyMatch = netQtyText.match(/(\d+(\.\d+)?)\s*(g|kg|ml|l)/i);
    let qtyInGramsOrMl = 0;
    if (qtyMatch) {
      const num = parseFloat(qtyMatch[1]);
      const unit = qtyMatch[3].toLowerCase();
      qtyInGramsOrMl = (unit === 'kg' || unit === 'l') ? num * 1000 : num;
    }

    const isUspMandatory = qtyInGramsOrMl > 1000;
    let uspStatus: CheckResultStatus = 'PASS';
    let uspExplanation = '';
    const uspConfidence = input.unitSalePriceDeclaration?.confidence ?? 0.9;

    if (isUspMandatory && !uspText) {
      uspStatus = 'FLAG';
      uspExplanation = `Net quantity is ${qtyInGramsOrMl}g/ml (>1kg/1L); Unit Sale Price (USP) declaration is mandatory under ${uspRule.legalReference} but was not found.`;
    } else if (uspText) {
      const hasUspRate = /₹\s*\d+(\.\d+)?\s*\/\s*(g|kg|ml|l|piece|n|u)/i.test(uspText);
      if (!hasUspRate) {
        uspStatus = 'FLAG';
        uspExplanation = `Declared Unit Sale Price "${uspText}" does not follow the required standard format (₹ per g/kg/ml/l/piece) per ${uspRule.legalReference}.`;
      } else {
        uspStatus = 'PASS';
        uspExplanation = `Unit Sale Price correctly declared: "${uspText}".`;
      }
    } else {
      uspStatus = 'PASS';
      uspExplanation = `Unit Sale Price is optional for package net quantity <= 1kg/1L under ${uspRule.legalReference}.`;
    }

    resultsToSave.push({
      inspectionId: input.inspectionId,
      ruleId: uspRule.id,
      ruleCode: uspRule.ruleCode,
      ruleVersion: version,
      status: uspStatus,
      confidence: uspConfidence,
      explanation: uspExplanation,
      evidenceId: input.unitSalePriceDeclaration?.evidenceId,
      boundingBox: input.unitSalePriceDeclaration?.boundingBox,
      evaluationDetails: {
        rawText: uspText || null,
        isUspMandatory,
        qtyInGramsOrMl,
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
      action: 'B22_MRP_QUANTITY_EVALUATED',
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
      throw ApiError.notFound('22_NOT_FOUND', `Check result ${id} not found in Module B22`);
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
      throw ApiError.notFound('22_NOT_FOUND', `Check result ${id} not found in Module B22`);
    }

    const updated = this.repo.updateCheckResult(id, {
      status,
      isOverridden: true,
      overriddenBy: userId,
      overrideReason,
    });

    await AuditService.log({
      userId,
      action: 'B22_CHECK_RESULT_OVERRIDE',
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
