import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../shared/auth/AuthContext.js';

// F36 Components
import { SelfScanTrigger } from '../modules/f36/SelfScanTrigger.js';
import { IssueDetailCard } from '../modules/f36/IssueDetailCard.js';
import { RemediationChecklist } from '../modules/f36/RemediationChecklist.js';

// F37 Components
import { BeforeAfterComparisonView } from '../modules/f37/BeforeAfterComparisonView.js';
import { RescanButton } from '../modules/f37/RescanButton.js';
import { ProductComplianceHistoryTimeline } from '../modules/f37/ProductComplianceHistoryTimeline.js';

// F38 Components
import { SyncStatusIndicator } from '../modules/f38/SyncStatusIndicator.js';
import { ConflictResolutionModal } from '../modules/f38/ConflictResolutionModal.js';
import { OfflineQueueList } from '../modules/f38/OfflineQueueList.js';

// F39 Components
import { ExplainableEvidenceWalkthrough } from '../modules/f39/ExplainableEvidenceWalkthrough.js';
import { InspectionTimelineView } from '../modules/f39/InspectionTimelineView.js';

// F40 Components
import { ScanQualityCoachOverlay } from '../modules/f40/ScanQualityCoachOverlay.js';
import { SmartReportSummaryPanel } from '../modules/f40/SmartReportSummaryPanel.js';

import {
  ArtworkVersion,
  RemediationItem,
  ArtworkDiffResult,
  OfflineQueueItem,
  WalkthroughStep,
  TimelineEvent,
  ScanQualityMetrics,
  SmartReportNarrative
} from '../shared/types/index.js';

describe('Frontend Modules F36 - F40 Component Suite', () => {
  /* ============================================================
     F36: Manufacturer Pre-Compliance Scan & Remediation Checklist
     ============================================================ */
  describe('F36: Manufacturer Pre-Compliance Scan & Remediation Checklist', () => {
    const sampleArtwork: ArtworkVersion = {
      id: 'art-01',
      productId: 'prod-001',
      version: 'v2.1',
      status: 'NEEDS_REMEDIATION',
      imageUrl: 'https://example.com/artwork.jpg',
      packageSide: 'BACK',
      dimensions: '180 x 240 mm',
      dpi: 300,
      changeSummary: 'Adjusted unit sale price font area.',
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Packaging QA',
    };

    const sampleRemediation: RemediationItem = {
      id: 'rem-01',
      field: 'Unit Sale Price Font Height',
      severity: 'MAJOR',
      currentValue: 'Font height measured 2.1mm',
      suggestedFix: 'Increase font size to minimum 4.0mm per Table 1.',
      legalRef: 'Rule 6(1)(e) Second Proviso PCR 2011',
      status: 'FAIL',
      isResolved: false,
    };

    it('renders SelfScanTrigger and initiates scan callback', async () => {
      const handleSelectArtwork = vi.fn();
      const handleRunScan = vi.fn().mockResolvedValue(undefined);

      render(
        <SelfScanTrigger
          artworks={[sampleArtwork]}
          selectedArtworkId="art-01"
          onSelectArtwork={handleSelectArtwork}
          onRunScan={handleRunScan}
          isScanning={false}
          lastScore={82}
        />
      );

      expect(screen.getByText(/AI Pre-Compliance Self-Scan/i)).toBeInTheDocument();
      expect(screen.getByText('82%')).toBeInTheDocument();

      const scanBtn = screen.getByRole('button', { name: /Run Pre-Compliance Scan/i });
      fireEvent.click(scanBtn);
      expect(handleRunScan).toHaveBeenCalledWith('art-01');
    });

    it('renders IssueDetailCard and toggles fixed state', () => {
      const handleToggle = vi.fn();
      render(<IssueDetailCard item={sampleRemediation} onToggleResolved={handleToggle} />);

      expect(screen.getByText('Unit Sale Price Font Height')).toBeInTheDocument();
      expect(screen.getByText(/Major Discrepancy/i)).toBeInTheDocument();
      expect(screen.getByText(/Rule 6\(1\)\(e\) Second Proviso PCR 2011/i)).toBeInTheDocument();

      const fixBtn = screen.getByRole('button', { name: /Mark as Fixed/i });
      fireEvent.click(fixBtn);
      expect(handleToggle).toHaveBeenCalledWith('rem-01');
    });

    it('renders RemediationChecklist with progress tracking', () => {
      const handleToggle = vi.fn();
      render(<RemediationChecklist items={[sampleRemediation]} onToggleResolved={handleToggle} />);

      expect(screen.getByText(/0 of 1 Items Resolved/i)).toBeInTheDocument();
      expect(screen.getByText('Unit Sale Price Font Height')).toBeInTheDocument();
    });
  });

  /* ============================================================
     F37: Before/After Comparison & Rescan
     ============================================================ */
  describe('F37: Before/After Comparison & Rescan', () => {
    const sampleDiff: ArtworkDiffResult = {
      productId: 'prod-001',
      oldVersion: 'v2.0',
      newVersion: 'v2.1',
      oldScore: 68,
      newScore: 96,
      resolvedIssuesCount: 2,
      remainingIssuesCount: 0,
      rescanDate: new Date().toISOString(),
      changes: [
        {
          field: 'Unit Sale Price Font Area',
          before: '₹0.28 / g (Font height 2.2mm)',
          after: '₹0.28 / g (Font height 4.2mm - Table 1 Compliant)',
          status: 'RESOLVED',
          legalRule: 'Rule 6(1)(e) Second Proviso PCR 2011',
        },
      ],
    };

    it('renders BeforeAfterComparisonView with delta metrics and field diffs', () => {
      render(<BeforeAfterComparisonView diffResult={sampleDiff} productName="Chilli Powder" />);

      expect(screen.getByText('68%')).toBeInTheDocument();
      expect(screen.getByText('96%')).toBeInTheDocument();
      expect(screen.getByText('+28% Score Improvement')).toBeInTheDocument();
      expect(screen.getByText('Unit Sale Price Font Area')).toBeInTheDocument();
      expect(screen.getByText(/₹0.28 \/ g \(Font height 4.2mm - Table 1 Compliant\)/i)).toBeInTheDocument();
    });

    it('renders RescanButton and triggers rescan action', async () => {
      const handleRescan = vi.fn().mockResolvedValue(undefined);
      render(<RescanButton onRescan={handleRescan} />);

      const btn = screen.getByRole('button', { name: /Run Rescan & Verify Remediation/i });
      fireEvent.click(btn);
      await waitFor(() => {
        expect(handleRescan).toHaveBeenCalled();
      });
    });

    it('renders ProductComplianceHistoryTimeline with version history', () => {
      const sampleArtworks: ArtworkVersion[] = [
        {
          id: 'art-01',
          productId: 'prod-001',
          version: 'v2.1',
          status: 'APPROVED_FOR_PRINT',
          imageUrl: 'https://example.com/art.jpg',
          packageSide: 'PDP',
          dimensions: '180 x 240 mm',
          dpi: 300,
          changeSummary: 'Verified compliant with Table 1.',
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'QA Team',
        },
      ];

      render(<ProductComplianceHistoryTimeline artworks={sampleArtworks} />);
      expect(screen.getByText('Version v2.1')).toBeInTheDocument();
      expect(screen.getByText('Verified compliant with Table 1.')).toBeInTheDocument();
    });
  });

  /* ============================================================
     F38: Offline Inspection Queue & Sync Status
     ============================================================ */
  describe('F38: Offline Inspection Queue & Sync Status', () => {
    const sampleQueueItem: OfflineQueueItem = {
      id: 'off-01',
      inspectionId: 'insp-off-901',
      productName: 'Priya Foods Chilli Powder 500g',
      manufacturerName: 'Priya Foods Ltd',
      packageSidesCaptured: ['PDP', 'BACK'],
      evidenceCount: 2,
      localSize: '8.4 MB',
      capturedAt: new Date().toISOString(),
      syncStatus: 'PENDING_SYNC',
      hasConflict: false,
    };

    it('renders SyncStatusIndicator with connectivity status and sync trigger', () => {
      const handleSyncAll = vi.fn();
      render(
        <SyncStatusIndicator
          isOnline={true}
          pendingCount={3}
          isSyncing={false}
          onSyncAll={handleSyncAll}
        />
      );

      expect(screen.getByText(/Online - Live Cloud Sync Connected/i)).toBeInTheDocument();
      expect(screen.getByText(/3 offline inspection\(s\) queued/i)).toBeInTheDocument();

      const syncBtn = screen.getByRole('button', { name: /Sync All \(3\)/i });
      fireEvent.click(syncBtn);
      expect(handleSyncAll).toHaveBeenCalled();
    });

    it('renders OfflineQueueList with queued items and side tags', () => {
      const handleSyncSingle = vi.fn().mockResolvedValue(undefined);
      const handleOpenConflict = vi.fn();

      render(
        <OfflineQueueList
          items={[sampleQueueItem]}
          onSyncSingle={handleSyncSingle}
          onOpenConflict={handleOpenConflict}
        />
      );

      expect(screen.getByText('Priya Foods Chilli Powder 500g')).toBeInTheDocument();
      expect(screen.getByText('PDP')).toBeInTheDocument();
      expect(screen.getByText('BACK')).toBeInTheDocument();
      expect(screen.getByText(/8.4 MB/i)).toBeInTheDocument();
    });

    it('renders ConflictResolutionModal and handles strategy resolution', () => {
      const conflictItem: OfflineQueueItem = {
        ...sampleQueueItem,
        id: 'off-conflict',
        syncStatus: 'CONFLICT',
        hasConflict: true,
        conflictDetails: {
          serverVersionDate: new Date().toISOString(),
          serverInspector: 'Inspector Rajesh Sharma',
          fieldDifferences: ['Server has marked NON_COMPLIANT with Notice #DL-8821.'],
        },
      };

      const handleClose = vi.fn();
      const handleResolve = vi.fn();

      render(
        <ConflictResolutionModal
          item={conflictItem}
          isOpen={true}
          onClose={handleClose}
          onResolve={handleResolve}
        />
      );

      expect(screen.getByText(/Sync Conflict Detected/i)).toBeInTheDocument();
      expect(screen.getByText(/Server has marked NON_COMPLIANT/i)).toBeInTheDocument();

      const localWinsBtn = screen.getByRole('button', { name: /Keep Local Version & Force Push/i });
      fireEvent.click(localWinsBtn);
      expect(handleResolve).toHaveBeenCalledWith('off-conflict', 'LOCAL_WINS');
    });
  });

  /* ============================================================
     F39: Explainable Evidence Mode & Inspection Timeline
     ============================================================ */
  describe('F39: Explainable Evidence Mode & Inspection Timeline', () => {
    const sampleStep: WalkthroughStep = {
      stepNumber: 1,
      title: 'Step 1: Raw Field Capture & Hashing',
      subtitle: 'High-res image with SHA-256 seal.',
      evidenceUrl: 'https://example.com/evidence.jpg',
      extractedText: 'MRP Rs 140.00',
      ruleCode: 'PCR-2011-R06-MRP',
      verdict: 'PASS',
      explanation: 'Bounding polygon detected with high confidence.',
      legalClause: 'Rule 6(1)(e) PCR 2011',
    };

    const sampleTimelineEvent: TimelineEvent = {
      id: 'evt-01',
      inspectionId: 'insp-01',
      timestamp: new Date().toISOString(),
      actorName: 'Inspector Amit Patel',
      actorRole: 'INSPECTOR',
      eventType: 'CAPTURE',
      title: 'Field Visual Evidence Captured',
      description: 'Captured 3 package faces.',
      sha256Hash: '7d2a58b9f0c2e3914a8b8a92f8910a30b5e2849203a9856a911762cf12e09412',
    };

    it('renders ExplainableEvidenceWalkthrough with reasoning and legal clause', () => {
      render(
        <ExplainableEvidenceWalkthrough
          steps={[sampleStep]}
          inspectionId="insp-01"
        />
      );

      expect(screen.getByText('Step 1: Raw Field Capture & Hashing')).toBeInTheDocument();
      expect(screen.getByText(/"MRP Rs 140.00"/i)).toBeInTheDocument();
      expect(screen.getByText('Rule 6(1)(e) PCR 2011')).toBeInTheDocument();
    });

    it('renders InspectionTimelineView with cryptographic SHA-256 hashes', () => {
      render(
        <InspectionTimelineView
          events={[sampleTimelineEvent]}
          inspectionId="insp-01"
        />
      );

      expect(screen.getByText('Field Visual Evidence Captured')).toBeInTheDocument();
      expect(screen.getByText(/Inspector Amit Patel/i)).toBeInTheDocument();
      expect(screen.getByText(/SHA-256: 7d2a58b9f0c2e3914a8b8a92f8910a30b5e2849203a9856a911762cf12e09412/i)).toBeInTheDocument();
    });
  });

  /* ============================================================
     F40: Smart Report & Scan Quality Coach
     ============================================================ */
  describe('F40: Smart Report & Scan Quality Coach', () => {
    const sampleMetrics: ScanQualityMetrics = {
      overallQuality: 92,
      glareScore: 94,
      lightingScore: 90,
      skewAngle: 1.8,
      focusScore: 95,
      isCourtroomReady: true,
      coachingTips: ['Excellent lighting and sharp declaration focus.', 'Skew angle is optimal.'],
    };

    const sampleNarrative: SmartReportNarrative = {
      inspectionId: 'insp-01',
      productName: 'Priya Foods Premium Chilli Powder 500g',
      executiveSummary: 'Statutory compliance inspection conducted under Legal Metrology Act, 2009.',
      compoundingPenaltyEstimate: '₹10,000 - ₹25,000',
      keyFindings: ['MRP declaration prominently displayed.', 'Unit sale price font height is below 4.0mm.'],
      recommendedDirectives: ['Issue statutory compounding notice with 15-day rectification.'],
      legalRiskAssessment: 'Medium Risk - Non-deceptive typographical defect.',
      generatedAt: new Date().toISOString(),
    };

    it('renders ScanQualityCoachOverlay with courtroom admissibility check', () => {
      render(<ScanQualityCoachOverlay metrics={sampleMetrics} />);

      expect(screen.getByText('Field Scan Quality Coach')).toBeInTheDocument();
      expect(screen.getByText(/Courtroom Admissible Evidence/i)).toBeInTheDocument();
      expect(screen.getByText('92%')).toBeInTheDocument();
      expect(screen.getByText('Excellent lighting and sharp declaration focus.')).toBeInTheDocument();
    });

    it('renders SmartReportSummaryPanel with penalty estimate and directives', () => {
      render(<SmartReportSummaryPanel narrative={sampleNarrative} />);

      expect(screen.getByText(/AI Smart Report Narrative Synthesis/i)).toBeInTheDocument();
      expect(screen.getByText(/Compounding Estimate: ₹10,000 - ₹25,000/i)).toBeInTheDocument();
      expect(screen.getByText('MRP declaration prominently displayed.')).toBeInTheDocument();
      expect(screen.getByText('Issue statutory compounding notice with 15-day rectification.')).toBeInTheDocument();
    });
  });
});
