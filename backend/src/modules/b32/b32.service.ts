import { v4 as uuidv4 } from 'uuid';
import { B32Repository } from './b32.repository.js';
import { 
  PatternQuery, 
  TriggerScanInput, 
  UpdatePatternStatusInput 
} from './b32.schemas.js';
import { 
  ViolationPattern, 
  PatternType, 
  ViolationSeverity 
} from '../../shared/types/index.js';
import { AuthUser } from '../../shared/auth/index.js';
import { ApiError } from '../../shared/errors/index.js';
import { auditLogService } from '../../shared/audit/index.js';

export class B32Service {
  constructor(private repo: B32Repository = new B32Repository()) {}

  public async listPatterns(query: PatternQuery) {
    return this.repo.getPatterns(query);
  }

  public async getPatternById(id: string): Promise<ViolationPattern> {
    const pattern = await this.repo.findPatternById(id);
    if (!pattern) {
      throw ApiError.notFound('32_NOT_FOUND', `Violation pattern with ID '${id}' not found`);
    }
    return pattern;
  }

  public async triggerPatternScan(
    input: TriggerScanInput,
    user: AuthUser,
    ipAddress?: string
  ): Promise<{ detectedPatterns: ViolationPattern[]; scannedViolationsCount: number }> {
    const records = await this.repo.getAllViolationsWithInspections(input.lookbackDays);
    const scannedViolationsCount = records.length;

    // Group violations by Manufacturer and Category
    const mfgGroups: Map<string, { mfgName: string; violations: typeof records }> = new Map();
    const catGroups: Map<string, typeof records> = new Map();

    for (const r of records) {
      const mfgId = r.inspection.manufacturerId || 'UNKNOWN_MFG';
      const mfgName = r.inspection.brand || r.inspection.manufacturerId || 'Unknown Manufacturer';
      const cat = r.inspection.category || 'General';

      if (!mfgGroups.has(mfgId)) {
        mfgGroups.set(mfgId, { mfgName, violations: [] });
      }
      mfgGroups.get(mfgId)!.violations.push(r);

      if (!catGroups.has(cat)) {
        catGroups.set(cat, []);
      }
      catGroups.get(cat)!.push(r);
    }

    const detectedPatterns: ViolationPattern[] = [];

    // 1. Analyze Manufacturer Repeat Patterns
    for (const [mfgId, group] of mfgGroups.entries()) {
      if (input.entityId && input.entityId !== mfgId) continue;
      if (group.violations.length >= input.minOccurrencesThreshold) {
        const ruleCodes = Array.from(new Set(group.violations.map(v => v.violation.ruleCode)));
        const severities = group.violations.map(v => v.violation.severity);
        const hasCritical = severities.includes('CRITICAL');
        const highestSeverity: ViolationSeverity = hasCritical ? 'CRITICAL' : 'MAJOR';

        const patternCode = `PAT-MFG-${mfgId.slice(0, 8).toUpperCase()}`;
        const existing = await this.repo.findPatternByCode(patternCode);

        const patternType: PatternType = group.violations.length >= 4 
          ? 'CHRONIC_NON_COMPLIANT' 
          : 'ISOLATED_INCIDENT';

        const explanation = `Detected ${group.violations.length} repeat violations across rules [${ruleCodes.join(', ')}] for manufacturer '${group.mfgName}' within last ${input.lookbackDays} days.`;

        const pattern: ViolationPattern = existing ? {
          ...existing,
          occurrenceCount: group.violations.length,
          ruleCodes,
          severity: highestSeverity,
          explanation,
          lastSeenAt: new Date(),
          updatedAt: new Date(),
        } : {
          id: uuidv4(),
          patternCode,
          patternType,
          entityId: mfgId,
          entityType: 'MANUFACTURER',
          entityName: group.mfgName,
          ruleCodes,
          occurrenceCount: group.violations.length,
          severity: highestSeverity,
          confidence: 0.95,
          explanation,
          status: 'ACTIVE',
          firstSeenAt: group.violations[0].violation.createdAt,
          lastSeenAt: group.violations[group.violations.length - 1].violation.createdAt,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const saved = await this.repo.savePattern(pattern);
        detectedPatterns.push(saved);
      }
    }

    // 2. Analyze Category Wide Defects
    for (const [category, catViolations] of catGroups.entries()) {
      if (input.entityType && input.entityType !== 'CATEGORY') continue;
      if (catViolations.length >= Math.max(input.minOccurrencesThreshold * 2, 4)) {
        const patternCode = `PAT-CAT-${category.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase()}`;
        const existing = await this.repo.findPatternByCode(patternCode);
        const ruleCodes = Array.from(new Set(catViolations.map(v => v.violation.ruleCode)));

        const explanation = `Category-wide recurring compliance issues identified in '${category}' with ${catViolations.length} violations across rules [${ruleCodes.join(', ')}].`;

        const pattern: ViolationPattern = existing ? {
          ...existing,
          occurrenceCount: catViolations.length,
          ruleCodes,
          explanation,
          lastSeenAt: new Date(),
          updatedAt: new Date(),
        } : {
          id: uuidv4(),
          patternCode,
          patternType: 'CATEGORY_WIDE_DEFECT',
          entityId: category,
          entityType: 'CATEGORY',
          entityName: category,
          ruleCodes,
          occurrenceCount: catViolations.length,
          severity: 'MAJOR',
          confidence: 0.92,
          explanation,
          status: 'ACTIVE',
          firstSeenAt: catViolations[0].violation.createdAt,
          lastSeenAt: catViolations[catViolations.length - 1].violation.createdAt,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const saved = await this.repo.savePattern(pattern);
        detectedPatterns.push(saved);
      }
    }

    await auditLogService.log({
      userId: user.id,
      action: 'TRIGGER_PATTERN_SCAN',
      objectType: 'VIOLATION_PATTERN',
      objectId: 'BATCH_SCAN',
      newValue: { detectedCount: detectedPatterns.length, scannedViolationsCount },
      ipAddress,
    });

    return { detectedPatterns, scannedViolationsCount };
  }

  public async updatePatternStatus(
    id: string,
    input: UpdatePatternStatusInput,
    user: AuthUser,
    ipAddress?: string
  ): Promise<ViolationPattern> {
    const pattern = await this.getPatternById(id);
    const prev = { ...pattern };

    pattern.status = input.status;
    pattern.updatedAt = new Date();

    const updated = await this.repo.savePattern(pattern);

    await auditLogService.log({
      userId: user.id,
      action: 'UPDATE_PATTERN_STATUS',
      objectType: 'VIOLATION_PATTERN',
      objectId: id,
      previousValue: prev,
      newValue: updated,
      reason: input.resolutionNotes,
      ipAddress,
    });

    return updated;
  }
}
