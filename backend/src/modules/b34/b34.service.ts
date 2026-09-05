import { v4 as uuidv4 } from 'uuid';
import { B34Repository } from './b34.repository.js';
import { 
  RiskProfileQuery, 
  ComputeRiskProfileInput, 
  OverrideRiskProfileInput 
} from './b34.schemas.js';
import { 
  RiskProfile, 
  RiskTier, 
  FactorContribution 
} from '../../shared/types/index.js';
import { AuthUser } from '../../shared/auth/index.js';
import { ApiError } from '../../shared/errors/index.js';
import { auditLogService } from '../../shared/audit/index.js';

export class B34Service {
  constructor(private repo: B34Repository = new B34Repository()) {}

  public async listRiskProfiles(query: RiskProfileQuery) {
    return this.repo.getRiskProfiles(query);
  }

  public async getRiskProfileById(id: string): Promise<RiskProfile> {
    const profile = await this.repo.findRiskProfileById(id);
    if (!profile) {
      throw ApiError.notFound('34_NOT_FOUND', `Risk profile with ID '${id}' not found`);
    }
    return profile;
  }

  public async computeRiskProfile(
    input: ComputeRiskProfileInput,
    user: AuthUser,
    ipAddress?: string
  ): Promise<RiskProfile> {
    const inspections = await this.repo.getEntityHistoricalInspections(
      input.entityId,
      input.entityType,
      input.lookbackDays
    );

    const inspectionIds = inspections.map(i => i.id);
    const violations = await this.repo.getViolationsForInspections(inspectionIds);

    const totalInspections = inspections.length;
    const totalViolations = violations.length;

    // 1. Violation Rate Factor (Weight: 0.35)
    let violationRateScore = 10.0;
    if (totalInspections > 0) {
      const nonCompliantCount = new Set(violations.map(v => v.inspectionId)).size;
      const rate = nonCompliantCount / totalInspections;
      violationRateScore = Math.min(100, Math.round(rate * 100));
    }

    // 2. Severity Factor (Weight: 0.30)
    let severityScore = 15.0;
    if (totalViolations > 0) {
      let weightedSum = 0;
      for (const v of violations) {
        if (v.severity === 'CRITICAL') weightedSum += 100;
        else if (v.severity === 'MAJOR') weightedSum += 60;
        else weightedSum += 25;
      }
      severityScore = Math.min(100, Math.round(weightedSum / totalViolations));
    }

    // 3. Repeat Offense / Recidivism Factor (Weight: 0.20)
    const ruleCounts: Map<string, number> = new Map();
    for (const v of violations) {
      ruleCounts.set(v.ruleCode, (ruleCounts.get(v.ruleCode) || 0) + 1);
    }
    const maxRepeatOnRule = Math.max(0, ...Array.from(ruleCounts.values()));
    let repeatScore = 10.0;
    if (maxRepeatOnRule >= 3) repeatScore = 90.0;
    else if (maxRepeatOnRule === 2) repeatScore = 65.0;
    else if (maxRepeatOnRule === 1) repeatScore = 30.0;

    // 4. Commodity Baseline Risk (Weight: 0.15)
    let categoryBaseScore = 40.0;
    const catUpper = input.entityName.toUpperCase();
    if (catUpper.includes('OIL') || catUpper.includes('WATER') || catUpper.includes('BABY')) {
      categoryBaseScore = 75.0; // High public health / economic impact
    } else if (catUpper.includes('SPICE') || catUpper.includes('SALT') || catUpper.includes('GRAIN')) {
      categoryBaseScore = 55.0;
    }

    const factorBreakdown: FactorContribution[] = [
      {
        factor: 'Historical Violation Rate',
        weight: 0.35,
        score: violationRateScore,
        contribution: parseFloat((0.35 * violationRateScore).toFixed(2)),
        description: `${totalViolations} violations across ${totalInspections} inspections (${violationRateScore}% rate)`,
      },
      {
        factor: 'Violation Severity Index',
        weight: 0.30,
        score: severityScore,
        contribution: parseFloat((0.30 * severityScore).toFixed(2)),
        description: `Weighted severity of historical violations under PCR 2011`,
      },
      {
        factor: 'Rule Recidivism Multiplier',
        weight: 0.20,
        score: repeatScore,
        contribution: parseFloat((0.20 * repeatScore).toFixed(2)),
        description: `Highest repetition on single rule: ${maxRepeatOnRule} times`,
      },
      {
        factor: 'Commodity Category Base Risk',
        weight: 0.15,
        score: categoryBaseScore,
        contribution: parseFloat((0.15 * categoryBaseScore).toFixed(2)),
        description: `Regulated priority tier for ${input.entityName}`,
      },
    ];

    const compositeScore = parseFloat(
      factorBreakdown.reduce((sum, f) => sum + f.contribution, 0).toFixed(2)
    );

    let riskTier: RiskTier = 'LOW';
    if (compositeScore >= 80.0) riskTier = 'CRITICAL';
    else if (compositeScore >= 65.0) riskTier = 'HIGH';
    else if (compositeScore >= 35.0) riskTier = 'MEDIUM';

    const explanation = `Calculated composite risk score of ${compositeScore}/100 (${riskTier}) for ${input.entityType} '${input.entityName}' based on ${totalInspections} inspections and ${totalViolations} violations in the past ${input.lookbackDays} days.`;

    const existing = await this.repo.findRiskProfileByEntity(input.entityId, input.entityType);

    const profile: RiskProfile = existing ? {
      ...existing,
      entityName: input.entityName,
      riskScore: compositeScore,
      riskTier,
      factorBreakdown,
      explanation,
      confidence: totalInspections >= 3 ? 0.96 : 0.85,
      historicalInspectionCount: totalInspections,
      historicalViolationCount: totalViolations,
      lastComputedAt: new Date(),
      updatedAt: new Date(),
    } : {
      id: uuidv4(),
      entityId: input.entityId,
      entityType: input.entityType,
      entityName: input.entityName,
      riskScore: compositeScore,
      riskTier,
      factorBreakdown,
      explanation,
      confidence: totalInspections >= 3 ? 0.96 : 0.85,
      historicalInspectionCount: totalInspections,
      historicalViolationCount: totalViolations,
      lastComputedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const saved = await this.repo.saveRiskProfile(profile);

    await auditLogService.log({
      userId: user.id,
      action: 'COMPUTE_RISK_PROFILE',
      objectType: 'RISK_PROFILE',
      objectId: saved.id,
      newValue: { entityId: saved.entityId, riskScore: saved.riskScore, riskTier: saved.riskTier },
      ipAddress,
    });

    return saved;
  }

  public async overrideRiskProfile(
    id: string,
    input: OverrideRiskProfileInput,
    user: AuthUser,
    ipAddress?: string
  ): Promise<RiskProfile> {
    const profile = await this.getRiskProfileById(id);
    const prev = { ...profile };

    profile.riskScore = input.riskScore;
    profile.riskTier = input.riskTier;
    profile.isOverridden = true;
    profile.overriddenBy = user.id;
    profile.overrideReason = input.overrideReason;
    profile.updatedAt = new Date();

    const updated = await this.repo.saveRiskProfile(profile);

    await auditLogService.log({
      userId: user.id,
      action: 'OVERRIDE_RISK_PROFILE',
      objectType: 'RISK_PROFILE',
      objectId: id,
      previousValue: prev,
      newValue: updated,
      reason: input.overrideReason,
      ipAddress,
    });

    return updated;
  }
}
