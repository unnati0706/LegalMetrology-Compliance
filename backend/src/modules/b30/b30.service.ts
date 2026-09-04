import crypto from 'crypto';
import { B30Repository } from './b30.repository.js';
import { AuditService } from '../../shared/audit/index.js';
import { ApiError } from '../../shared/errors/index.js';
import { Report, ReportFormat, ReportContentSummary } from '../../shared/types/index.js';
import { StorageAdapter, MockStorageAdapter } from '../../shared/adapters/index.js';

export class B30Service {
  constructor(
    private repo: B30Repository = new B30Repository(),
    private storage: StorageAdapter = new MockStorageAdapter()
  ) {}

  public async listReportVersions(inspectionId: string, page: number = 1, limit: number = 10) {
    const list = this.repo.findReportsByInspectionId(inspectionId);
    const total = list.length;
    const startIndex = (page - 1) * limit;
    const items = list.slice(startIndex, startIndex + limit);

    return { items, total };
  }

  public async getReportVersionById(id: string): Promise<Report> {
    const report = this.repo.findReportById(id);
    if (!report) {
      throw ApiError.notFound('30_NOT_FOUND', `Report version ${id} not found`);
    }

    const downloadUrl = await this.storage.getSignedUrl(report.storageKey);
    return {
      ...report,
      downloadUrl,
    };
  }

  public async createAmendedVersion(
    input: {
      inspectionId: string;
      previousReportId: string;
      amendmentReason: string;
      format: ReportFormat;
      isMajorVersion?: boolean;
    },
    userId: string
  ): Promise<Report> {
    const previous = this.repo.findReportById(input.previousReportId);
    if (!previous || previous.inspectionId !== input.inspectionId) {
      throw ApiError.notFound('30_NOT_FOUND', `Previous report ${input.previousReportId} not found for inspection ${input.inspectionId}`);
    }

    // Mark previous report as AMENDED
    this.repo.updateReport(previous.id, { status: 'AMENDED' });

    // Calculate next version string (e.g. v1.0 -> v1.1 or v2.0)
    const match = previous.reportVersion.match(/^v(\d+)\.(\d+)$/);
    let major = 1;
    let minor = 0;
    if (match) {
      major = parseInt(match[1], 10);
      minor = parseInt(match[2], 10);
    }

    let nextVersion = '';
    if (input.isMajorVersion) {
      nextVersion = `v${major + 1}.0`;
    } else {
      nextVersion = `v${major}.${minor + 1}`;
    }

    const inspection = this.repo.findInspectionById(input.inspectionId);
    const inspector = inspection ? this.repo.findUserById(inspection.inspectorId) : undefined;
    const declarations = this.repo.findDeclarationsByInspectionId(input.inspectionId);
    const checkResults = this.repo.findCheckResultsByInspectionId(input.inspectionId);
    const violations = this.repo.findViolationsByInspectionId(input.inspectionId);
    const evidenceList = this.repo.findEvidenceByInspectionId(input.inspectionId);

    const passedCount = checkResults.filter(c => c.status === 'PASS').length;
    const flaggedCount = checkResults.filter(c => c.status === 'FLAG').length;
    const manualReviewCount = checkResults.filter(c => c.status === 'MANUAL_REVIEW').length;
    const criticalCount = violations.filter(v => v.severity === 'CRITICAL').length;

    let overallDisposition: 'COMPLIANT' | 'NON_COMPLIANT' | 'REQUIRES_REINSPECTION' = 'COMPLIANT';
    if (manualReviewCount > 0) {
      overallDisposition = 'REQUIRES_REINSPECTION';
    } else if (violations.length > 0) {
      overallDisposition = 'NON_COMPLIANT';
    }

    const contentSummary: ReportContentSummary = {
      inspectionId: input.inspectionId,
      productName: inspection?.productName || 'Product',
      category: inspection?.category || 'Category',
      brand: inspection?.brand,
      inspectorName: inspector?.name || 'Authorized Inspector',
      inspectionDate: inspection?.createdAt.toISOString() || new Date().toISOString(),
      ruleVersion: inspection?.ruleVersion || 'PCR-2011-v2.0',
      totalDeclarationsChecked: declarations.length || checkResults.length,
      passedChecksCount: passedCount,
      flaggedChecksCount: flaggedCount,
      manualReviewsCount: manualReviewCount,
      violationsCount: violations.length,
      criticalViolationsCount: criticalCount,
      overallDisposition,
      violations: violations.map(v => ({
        ruleCode: v.ruleCode,
        legalReference: v.legalReference,
        severity: v.severity,
        explanation: v.explanation,
        packageSide: v.packageSide,
      })),
      evidenceSnapshots: evidenceList.map(e => ({
        evidenceId: e.id,
        packageSide: e.packageSide,
        imageUrl: e.imageUrl,
      })),
    };

    const checksum = crypto
      .createHash('sha256')
      .update(JSON.stringify(contentSummary))
      .digest('hex');

    const storageKey = `reports/${input.inspectionId}/report-${nextVersion}-${Date.now()}.${input.format.toLowerCase()}`;
    const downloadUrl = await this.storage.getSignedUrl(storageKey);

    const amendedReport = this.repo.saveReport({
      inspectionId: input.inspectionId,
      reportVersion: nextVersion,
      format: input.format,
      status: 'GENERATED',
      downloadUrl,
      storageKey,
      fileSizeBytes: 1024 * (input.format === 'PDF' ? 260 : 30),
      verificationChecksum: checksum,
      contentSummary,
      generatedBy: userId,
      previousReportId: previous.id,
      amendmentReason: input.amendmentReason,
    });

    await AuditService.log({
      userId,
      action: 'B30_REPORT_AMENDED',
      objectType: 'Report',
      objectId: amendedReport.id,
      previousValue: { reportVersion: previous.reportVersion, reportId: previous.id },
      newValue: { reportVersion: nextVersion, checksum, amendmentReason: input.amendmentReason },
      reason: input.amendmentReason,
    });

    return amendedReport;
  }

  public async compareVersions(id1: string, id2: string) {
    const r1 = this.repo.findReportById(id1);
    const r2 = this.repo.findReportById(id2);

    if (!r1 || !r2) {
      throw ApiError.notFound('30_NOT_FOUND', `One or both reports (${id1}, ${id2}) not found for version comparison`);
    }

    const s1 = r1.contentSummary;
    const s2 = r2.contentSummary;

    const diff = {
      baseVersion: {
        id: r1.id,
        version: r1.reportVersion,
        createdAt: r1.createdAt,
        disposition: s1.overallDisposition,
        violationsCount: s1.violationsCount,
        checksum: r1.verificationChecksum,
      },
      targetVersion: {
        id: r2.id,
        version: r2.reportVersion,
        createdAt: r2.createdAt,
        disposition: s2.overallDisposition,
        violationsCount: s2.violationsCount,
        checksum: r2.verificationChecksum,
      },
      hasContentChanged: r1.verificationChecksum !== r2.verificationChecksum,
      violationsDifference: s2.violationsCount - s1.violationsCount,
      passedChecksDifference: s2.passedChecksCount - s1.passedChecksCount,
      amendmentReason: r2.amendmentReason || null,
    };

    return diff;
  }

  public async updateReportVersionMeta(
    id: string,
    updates: {
      status?: 'GENERATED' | 'AMENDED' | 'ARCHIVED';
      notes?: string;
    },
    userId: string
  ): Promise<Report> {
    const existing = this.repo.findReportById(id);
    if (!existing) {
      throw ApiError.notFound('30_NOT_FOUND', `Report ${id} not found`);
    }

    const updated = this.repo.updateReport(id, {
      status: updates.status || existing.status,
      amendmentReason: updates.notes || existing.amendmentReason,
    });

    await AuditService.log({
      userId,
      action: 'B30_REPORT_META_UPDATED',
      objectType: 'Report',
      objectId: id,
      previousValue: { status: existing.status },
      newValue: updates,
      reason: updates.notes,
    });

    return updated!;
  }
}
