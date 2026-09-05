import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../shared/auth/AuthContext.js';

// F26 Components
import { ReportPreview } from '../modules/f26/ReportPreview.js';
import { ReportGenerateButton } from '../modules/f26/ReportGenerateButton.js';
import { ReportDownloadLink } from '../modules/f26/ReportDownloadLink.js';
import { ReportEditableFieldsForm } from '../modules/f26/ReportEditableFieldsForm.js';

// F27 Components
import { EvidenceLockerGrid } from '../modules/f27/EvidenceLockerGrid.js';
import { ReportVersionList } from '../modules/f27/ReportVersionList.js';

// F28 Components
import { KPISummaryRow } from '../modules/f28/KPISummaryRow.js';
import { TrendSparkline } from '../modules/f28/TrendSparkline.js';
import { StatusDistributionChart } from '../modules/f28/StatusDistributionChart.js';

// F29 Components
import { ViolationTrendChart } from '../modules/f29/ViolationTrendChart.js';
import { ViolationDistributionChart } from '../modules/f29/ViolationDistributionChart.js';

// F30 Components
import { ManufacturerPatternTable } from '../modules/f30/ManufacturerPatternTable.js';
import { CategoryPatternChart } from '../modules/f30/CategoryPatternChart.js';
import { RepeatViolationBadge } from '../modules/f30/RepeatViolationBadge.js';

import { 
  Inspection, 
  CheckResult, 
  Declaration, 
  ReportRecord, 
  EvidenceLockerFile, 
  KPISummary, 
  TrendDataPoint, 
  ViolationTrendData, 
  RuleDistributionData, 
  ManufacturerPattern, 
  CategoryPattern 
} from '../shared/types/index.js';

describe('Frontend Modules F26 - F30 Component Suite', () => {
  const sampleInspection: Inspection = {
    id: 'insp-test-01',
    inspectorId: 'usr-01',
    inspectorName: 'Amit Patel',
    productName: 'Chilli Powder Premium 500g',
    category: 'Spices & Condiments',
    manufacturerName: 'Priya Foods Ltd',
    location: 'Pune Zone',
    status: 'FLAGGED',
    ruleVersion: 'PCR-2011-v2.0',
    declarationsCount: 2,
    violationsCount: 1,
    manualReviewCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sampleDeclarations: Declaration[] = [
    {
      id: 'd1',
      inspectionId: 'insp-test-01',
      field: 'mrp',
      value: '₹140.00',
      confidence: 0.95,
      status: 'VERIFIED',
      packageSide: 'BACK',
    }
  ];

  const sampleChecks: CheckResult[] = [
    {
      id: 'c1',
      inspectionId: 'insp-test-01',
      ruleCode: 'PCR-2011-R06-MRP',
      ruleTitle: 'MRP Declaration & Tax Inclusion',
      legalReference: 'Rule 6(1)(e)',
      status: 'PASS',
      confidence: 0.96,
      explanation: 'Compliant MRP statement verified.',
      packageSide: 'BACK',
    },
    {
      id: 'c2',
      inspectionId: 'insp-test-01',
      ruleCode: 'PCR-2011-R06-USP',
      ruleTitle: 'Unit Sale Price Verification',
      legalReference: 'Rule 6(1)(e) Proviso',
      status: 'FLAG',
      confidence: 0.85,
      explanation: 'Unit sale price missing on packages above 100g.',
      packageSide: 'BACK',
    }
  ];

  const sampleReport: ReportRecord = {
    id: 'rep-test-01',
    inspectionId: 'insp-test-01',
    productName: 'Chilli Powder Premium 500g',
    version: 'v1.0',
    format: 'PDF',
    fileUrl: '/reports/export-insp-test-01-v1.0.pdf',
    fileSize: '1.42 MB',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    generatedBy: 'Inspector Amit Patel',
    generatedAt: new Date().toISOString(),
    status: 'READY',
    summaryDisposition: 'NON_COMPLIANT',
    includeEvidenceThumbnails: true,
    legalNoticeHeader: true,
    officerRemarks: 'Violation detected under Rule 6(1)(e).',
  };

  /* ============================================================
     F26: Report Generation & Export Tests
     ============================================================ */
  describe('F26: Report Generation & Export', () => {
    it('renders ReportPreview with statutory header, product details, and SHA-256 badge', () => {
      render(
        <ReportPreview
          inspection={sampleInspection}
          checks={sampleChecks}
          declarations={sampleDeclarations}
          report={sampleReport}
        />
      );

      expect(screen.getByText(/Legal Metrology Statutory Compliance Report/i)).toBeInTheDocument();
      expect(screen.getByText('Chilli Powder Premium 500g')).toBeInTheDocument();
      expect(screen.getByText('Priya Foods Ltd')).toBeInTheDocument();
      expect(screen.getByText(/SHA-256 Tamper-Evident Digest/i)).toBeInTheDocument();
      expect(screen.getByText(/e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855/i)).toBeInTheDocument();
    });

    it('triggers report generation via ReportGenerateButton with format selection', async () => {
      const handleGen = vi.fn().mockResolvedValue(undefined);
      render(
        <ReportGenerateButton
          inspectionId="insp-test-01"
          onGenerate={handleGen}
        />
      );

      const generateBtn = screen.getByRole('button', { name: /Generate & Sign PDF/i });
      fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(handleGen).toHaveBeenCalledWith('PDF');
      });
    });

    it('renders ReportDownloadLink with file details and copy hash button', () => {
      render(<ReportDownloadLink report={sampleReport} />);

      expect(screen.getByText(/Chilli Powder Premium 500g \(v1.0\)/i)).toBeInTheDocument();
      expect(screen.getByText('1.42 MB')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Download PDF/i })).toBeInTheDocument();
    });

    it('allows customization in ReportEditableFieldsForm', () => {
      const handleChange = vi.fn();
      const options = {
        includeEvidenceThumbnails: true,
        legalNoticeHeader: true,
        officerRemarks: 'Initial test remark',
      };

      render(
        <ReportEditableFieldsForm
          options={options}
          onChange={handleChange}
        />
      );

      const textarea = screen.getByPlaceholderText(/Enter statutory directives/i);
      fireEvent.change(textarea, { target: { value: 'Updated remark' } });

      expect(handleChange).toHaveBeenCalledWith({
        ...options,
        officerRemarks: 'Updated remark',
      });
    });
  });

  /* ============================================================
     F27: Evidence Locker & Report History Tests
     ============================================================ */
  describe('F27: Evidence Locker & Report History', () => {
    const sampleFiles: EvidenceLockerFile[] = [
      {
        id: 'ev-01',
        inspectionId: 'insp-test-01',
        fileName: 'chilli_front.jpg',
        packageSide: 'PDP',
        imageUrl: 'https://example.com/chilli.jpg',
        qualityScore: 0.96,
        resolution: '4032x3024',
        fileSize: '4.2 MB',
        sha256Hash: '7d2a58b9f0c2e3914a8b8a92f8910a30b5e2849203a9856a911762cf12e09412',
        capturedAt: new Date().toISOString(),
        tags: ['PDP', 'High Resolution'],
      }
    ];

    it('renders EvidenceLockerGrid with resolution, tags, and quality score', () => {
      render(<EvidenceLockerGrid files={sampleFiles} />);

      expect(screen.getByText('chilli_front.jpg')).toBeInTheDocument();
      expect(screen.getByText('4032x3024')).toBeInTheDocument();
      expect(screen.getByText('Quality: 96%')).toBeInTheDocument();
      expect(screen.getAllByText('PDP').length).toBeGreaterThanOrEqual(1);
    });

    it('renders ReportVersionList with all report versions', () => {
      render(<ReportVersionList reports={[sampleReport]} />);

      expect(screen.getByText(/Statutory Report Archives & Versions \(1\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Chilli Powder Premium 500g \(v1.0\)/i)).toBeInTheDocument();
    });
  });

  /* ============================================================
     F28: Supervisor / Enforcement Dashboard Tests
     ============================================================ */
  describe('F28: Supervisor / Enforcement Dashboard', () => {
    const sampleKpis: KPISummary = {
      totalInspections: 100,
      compliantCount: 75,
      flaggedCount: 20,
      manualReviewCount: 5,
      complianceRate: 75,
      avgResolutionTimeHours: 1.8,
      period: 'Last 30 Days',
    };

    const sampleSparkline: TrendDataPoint[] = [
      { date: 'Mon', total: 10, compliant: 8, flagged: 1, manualReview: 1 },
      { date: 'Tue', total: 15, compliant: 12, flagged: 2, manualReview: 1 }
    ];

    it('renders KPISummaryRow with compliance rate and violation metrics', () => {
      render(<KPISummaryRow kpis={sampleKpis} />);

      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('1.8 hrs')).toBeInTheDocument();
    });

    it('renders TrendSparkline with daily volume and bars', () => {
      render(<TrendSparkline data={sampleSparkline} />);

      expect(screen.getByText(/Inspection Velocity & Daily Throughput/i)).toBeInTheDocument();
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Tue')).toBeInTheDocument();
    });

    it('renders StatusDistributionChart breakdown', () => {
      render(<StatusDistributionChart kpis={sampleKpis} />);

      expect(screen.getByText(/Case Status & Disposition Distribution/i)).toBeInTheDocument();
      expect(screen.getByText(/Compliant \(75%\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Flagged \/ Action \(20%\)/i)).toBeInTheDocument();
    });
  });

  /* ============================================================
     F29: Analytics: Violation Trends & Distribution Tests
     ============================================================ */
  describe('F29: Analytics: Violation Trends & Distribution', () => {
    const sampleTrends: ViolationTrendData[] = [
      { period: 'Week 1', mrpViolations: 4, netQtyViolations: 2, dateViolations: 1, mfgViolations: 3, consumerCareViolations: 1 }
    ];

    const sampleDistributions: RuleDistributionData[] = [
      { ruleCode: 'PCR-2011-R06-USP', ruleTitle: 'Unit Sale Price Missing', count: 24, percentage: 35, severity: 'MAJOR' },
      { ruleCode: 'PCR-2011-R06-MRP', ruleTitle: 'MRP Declaration Missing', count: 18, percentage: 26, severity: 'CRITICAL' }
    ];

    it('renders ViolationTrendChart with period aggregations', () => {
      render(<ViolationTrendChart data={sampleTrends} />);

      expect(screen.getByText(/Violation Incidence by Statutory Clause Over Time/i)).toBeInTheDocument();
      expect(screen.getByText('Week 1')).toBeInTheDocument();
    });

    it('renders ViolationDistributionChart with severity tags', () => {
      render(<ViolationDistributionChart data={sampleDistributions} />);

      expect(screen.getByText(/Statutory Rule Violation Distribution & Severity/i)).toBeInTheDocument();
      expect(screen.getByText('Unit Sale Price Missing')).toBeInTheDocument();
      expect(screen.getByText('MAJOR')).toBeInTheDocument();
      expect(screen.getByText('CRITICAL')).toBeInTheDocument();
    });
  });

  /* ============================================================
     F30: Manufacturer/Category Pattern Analytics Tests
     ============================================================ */
  describe('F30: Manufacturer/Category Pattern Analytics', () => {
    const samplePatterns: ManufacturerPattern[] = [
      {
        id: 'mfg-royal',
        name: 'Royal Beverages Bottling Plant',
        category: 'Packaged Drinking Water',
        totalInspections: 14,
        violationCount: 9,
        riskScore: 88,
        repeatCount: 4,
        topViolatedRules: ['PCR-2011-R06-MRP', 'PCR-2011-R06-DATE'],
        lastViolationDate: new Date().toISOString(),
        riskLevel: 'HIGH',
        escalationStatus: 'SHOW_CAUSE_PENDING',
      }
    ];

    const sampleCategories: CategoryPattern[] = [
      {
        category: 'Packaged Drinking Water',
        totalInspections: 34,
        violationsCount: 14,
        violationRate: 41.2,
        topViolation: 'Missing Batch / Date Code',
      }
    ];

    it('renders RepeatViolationBadge correctly for high recidivism', () => {
      render(<RepeatViolationBadge repeatCount={4} riskLevel="HIGH" />);
      expect(screen.getByText('4x Repeat Offender')).toBeInTheDocument();
    });

    it('renders CategoryPatternChart with rate and top defect', () => {
      render(<CategoryPatternChart categories={sampleCategories} />);

      expect(screen.getByText(/Category-Level Violation Density & Hotspots/i)).toBeInTheDocument();
      expect(screen.getByText('Packaged Drinking Water')).toBeInTheDocument();
      expect(screen.getByText('41.2%')).toBeInTheDocument();
      expect(screen.getByText('Missing Batch / Date Code')).toBeInTheDocument();
    });

    it('renders ManufacturerPatternTable with risk scores and actions', () => {
      const handleEscalate = vi.fn();
      render(
        <AuthProvider>
          <ManufacturerPatternTable
            patterns={samplePatterns}
            onEscalate={handleEscalate}
          />
        </AuthProvider>
      );

      expect(screen.getByText('Royal Beverages Bottling Plant')).toBeInTheDocument();
      expect(screen.getByText('88')).toBeInTheDocument();
      expect(screen.getByText('SHOW CAUSE PENDING')).toBeInTheDocument();
    });
  });
});
