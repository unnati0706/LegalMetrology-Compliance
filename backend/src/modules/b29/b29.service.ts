import crypto from 'crypto';
import { B29Repository } from './b29.repository.js';
import { AuditService } from '../../shared/audit/index.js';
import { ApiError } from '../../shared/errors/index.js';
import { Report, ReportFormat, ReportContentSummary } from '../../shared/types/index.js';
import { StorageAdapter, MockStorageAdapter } from '../../shared/adapters/index.js';

export class B29Service {
  constructor(
    private repo: B29Repository = new B29Repository(),
    private storage: StorageAdapter = new MockStorageAdapter()
  ) {}

  public async generateReport(
    input: {
      inspectionId: string;
      format: ReportFormat;
      notes?: string;
    },
    userId: string
  ): Promise<Report> {
    const inspection = this.repo.findInspectionById(input.inspectionId);
    if (!inspection) {
      throw ApiError.notFound('29_NOT_FOUND', `Inspection ${input.inspectionId} not found`);
    }

    const inspector = this.repo.findUserById(inspection.inspectorId);
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
      inspectionId: inspection.id,
      productName: inspection.productName,
      category: inspection.category,
      brand: inspection.brand,
      inspectorName: inspector?.name || 'Authorized Inspector',
      inspectionDate: inspection.createdAt.toISOString(),
      ruleVersion: inspection.ruleVersion,
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

    // Calculate deterministic checksum
    const checksum = crypto
      .createHash('sha256')
      .update(JSON.stringify(contentSummary))
      .digest('hex');

    const storageKey = `reports/${inspection.id}/report-v1.0-${Date.now()}.${input.format.toLowerCase()}`;
    const downloadUrl = await this.storage.getSignedUrl(storageKey);

    const report = this.repo.saveReport({
      inspectionId: input.inspectionId,
      reportVersion: 'v1.0',
      format: input.format,
      status: 'GENERATED',
      downloadUrl,
      storageKey,
      fileSizeBytes: 1024 * (input.format === 'PDF' ? 250 : 25),
      verificationChecksum: checksum,
      contentSummary,
      generatedBy: userId,
      amendmentReason: input.notes,
    });

    await AuditService.log({
      userId,
      action: 'B29_REPORT_GENERATED',
      objectType: 'Report',
      objectId: report.id,
      newValue: {
        format: report.format,
        reportVersion: report.reportVersion,
        disposition: overallDisposition,
        checksum,
      },
      reason: input.notes,
    });

    return report;
  }

  public async getReportById(id: string): Promise<Report> {
    const report = this.repo.findReportById(id);
    if (!report) {
      throw ApiError.notFound('29_NOT_FOUND', `Report ${id} not found`);
    }

    const freshSignedUrl = await this.storage.getSignedUrl(report.storageKey);
    return {
      ...report,
      downloadUrl: freshSignedUrl,
    };
  }

  public async listReports(query: {
    inspectionId?: string;
    format?: string;
    status?: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
  }) {
    return this.repo.findReports(query);
  }

  public async updateReport(
    id: string,
    updates: {
      status?: 'GENERATED' | 'AMENDED' | 'ARCHIVED';
      notes?: string;
    },
    userId: string
  ): Promise<Report> {
    const existing = this.repo.findReportById(id);
    if (!existing) {
      throw ApiError.notFound('29_NOT_FOUND', `Report ${id} not found`);
    }

    const updated = this.repo.updateReport(id, {
      status: updates.status || existing.status,
      amendmentReason: updates.notes || existing.amendmentReason,
    });

    await AuditService.log({
      userId,
      action: 'B29_REPORT_UPDATED',
      objectType: 'Report',
      objectId: id,
      previousValue: { status: existing.status },
      newValue: updates,
      reason: updates.notes,
    });

    return updated!;
  }
}
