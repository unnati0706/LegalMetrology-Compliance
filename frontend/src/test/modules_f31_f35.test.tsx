import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../shared/auth/AuthContext.js';

// F31 Components
import { RiskHeatLayer } from '../modules/f31/RiskHeatLayer.js';
import { InspectionMapView } from '../modules/f31/InspectionMapView.js';

// F32 Components
import { FollowUpStatusTag } from '../modules/f32/FollowUpStatusTag.js';
import { AssignmentSelector } from '../modules/f32/AssignmentSelector.js';
import { CaseList } from '../modules/f32/CaseList.js';
import { CaseDetailPanel } from '../modules/f32/CaseDetailPanel.js';

// F33 Components
import { DataSufficiencyBadge } from '../modules/f33/DataSufficiencyBadge.js';
import { RiskScoreCard } from '../modules/f33/RiskScoreCard.js';
import { RiskFactorBreakdown } from '../modules/f33/RiskFactorBreakdown.js';
import { InspectNextQueueList } from '../modules/f33/InspectNextQueueList.js';

// F34 Components
import { ManufacturerKPICards } from '../modules/f34/ManufacturerKPICards.js';
import { ProductComplianceSummary } from '../modules/f34/ProductComplianceSummary.js';

// F35 Components
import { ProductLibraryGrid } from '../modules/f35/ProductLibraryGrid.js';
import { ArtworkUploadPanel } from '../modules/f35/ArtworkUploadPanel.js';
import { ArtworkVersionList } from '../modules/f35/ArtworkVersionList.js';

import { 
  GeoRiskLocation, 
  EnforcementCase, 
  InspectNextItem, 
  ManufacturerKPIs, 
  ManufacturerProduct, 
  ArtworkVersion 
} from '../shared/types/index.js';

describe('Frontend Modules F31 - F35 Component Suite', () => {
  /* ============================================================
     F31: Geographic Risk Visualization Tests
     ============================================================ */
  describe('F31: Geographic Risk Visualization', () => {
    const sampleLocations: GeoRiskLocation[] = [
      {
        id: 'geo-pune',
        name: 'Pune Industrial Area',
        state: 'Maharashtra',
        district: 'Pune',
        lat: 18.5204,
        lng: 73.8567,
        totalInspections: 48,
        violationsCount: 14,
        complianceRate: 71,
        riskLevel: 'MEDIUM',
        riskScore: 62,
        recentFlaggedBrand: 'Priya Foods',
      },
      {
        id: 'geo-delhi',
        name: 'Okhla Industrial Estate',
        state: 'Delhi',
        district: 'Central Delhi',
        lat: 28.6139,
        lng: 77.2090,
        totalInspections: 62,
        violationsCount: 28,
        complianceRate: 55,
        riskLevel: 'HIGH',
        riskScore: 84,
        recentFlaggedBrand: 'Royal Beverages',
      }
    ];

    it('renders RiskHeatLayer and triggers layer toggles', () => {
      const handleToggleHighRisk = vi.fn();
      const handleToggleClusters = vi.fn();
      const handleSelectState = vi.fn();

      render(
        <RiskHeatLayer
          showHighRiskOnly={false}
          onToggleHighRisk={handleToggleHighRisk}
          showClusters={false}
          onToggleClusters={handleToggleClusters}
          activeState="ALL"
          onSelectState={handleSelectState}
          availableStates={['Maharashtra', 'Delhi']}
        />
      );

      expect(screen.getByText(/Geographic Risk Layers/i)).toBeInTheDocument();
      const highRiskBtn = screen.getByRole('button', { name: /High Risk Zones \(Show\)/i });
      fireEvent.click(highRiskBtn);
      expect(handleToggleHighRisk).toHaveBeenCalledWith(true);
    });

    it('renders InspectionMapView with district cards and risk scores', () => {
      render(<InspectionMapView locations={sampleLocations} />);

      expect(screen.getByText('Pune')).toBeInTheDocument();
      expect(screen.getByText('Central Delhi')).toBeInTheDocument();
      expect(screen.getAllByText('62/100').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('84/100')).toBeInTheDocument();
    });
  });

  /* ============================================================
     F32: Cases, Follow-Ups & Assignment Workflow Tests
     ============================================================ */
  describe('F32: Cases, Follow-Ups & Assignment Workflow', () => {
    const sampleCase: EnforcementCase = {
      id: 'case-101',
      caseNumber: 'CASE/2026/DL/0084',
      inspectionId: 'insp-02',
      title: 'Non-declaration of MRP & Missing Date of Mfg',
      manufacturerName: 'Royal Beverages Bottling Plant',
      category: 'Packaged Drinking Water',
      status: 'HEARING_SCHEDULED',
      priority: 'HIGH',
      assignedInspectorId: 'usr-inspector-01',
      assignedInspectorName: 'Inspector Amit Patel',
      deadline: new Date().toISOString(),
      statutorySection: 'Section 36(1)',
      noticesIssuedCount: 2,
      notesCount: 3,
      latestNote: 'Compounding hearing scheduled.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('renders FollowUpStatusTag with appropriate milestone text', () => {
      render(<FollowUpStatusTag status="HEARING_SCHEDULED" />);
      expect(screen.getByText('Hearing Scheduled')).toBeInTheDocument();
    });

    it('renders AssignmentSelector and allows reassignment submission', () => {
      const handleAssign = vi.fn();
      render(
        <AssignmentSelector
          currentInspectorId="usr-inspector-01"
          currentPriority="HIGH"
          onAssign={handleAssign}
        />
      );

      const updateBtn = screen.getByRole('button', { name: /Update Assignment/i });
      fireEvent.click(updateBtn);
      expect(handleAssign).toHaveBeenCalledWith('usr-inspector-01', expect.stringContaining('Amit Patel'), 'HIGH');
    });

    it('renders CaseList and invokes selection callback', () => {
      const handleSelect = vi.fn();
      render(
        <CaseList
          cases={[sampleCase]}
          onSelectCase={handleSelect}
        />
      );

      expect(screen.getByText('CASE/2026/DL/0084')).toBeInTheDocument();
      expect(screen.getByText('Non-declaration of MRP & Missing Date of Mfg')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Non-declaration of MRP & Missing Date of Mfg'));
      expect(handleSelect).toHaveBeenCalledWith(sampleCase);
    });

    it('renders CaseDetailPanel with statutory details and milestone advancement', async () => {
      const handleUpdateStatus = vi.fn().mockResolvedValue(undefined);
      const handleAssign = vi.fn().mockResolvedValue(undefined);

      render(
        <AuthProvider>
          <CaseDetailPanel
            caseItem={sampleCase}
            onUpdateStatus={handleUpdateStatus}
            onAssign={handleAssign}
          />
        </AuthProvider>
      );
      expect(screen.getByText(/Advance Enforcement Milestone/i)).toBeInTheDocument();
      const advanceBtn = screen.getByRole('button', { name: /Update Case Milestone/i });
      fireEvent.click(advanceBtn);

      await waitFor(() => {
        expect(handleUpdateStatus).toHaveBeenCalled();
      });
    });
  });

  /* ============================================================
     F33: Inspect-Next Queue Tests
     ============================================================ */
  describe('F33: Inspect-Next Queue', () => {
    const sampleQueueItem: InspectNextItem = {
      id: 'queue-01',
      productName: 'Royal Aqua Mineral Water 1L',
      manufacturerName: 'Royal Beverages Bottling Plant',
      category: 'Packaged Drinking Water',
      location: 'Okhla Industrial Area, Delhi',
      riskScore: 89,
      riskBand: 'HIGH',
      confidence: 0.94,
      dataSufficiency: 'SUFFICIENT',
      historicalAuditsCount: 14,
      riskFactors: [
        { factor: 'Habitual Recidivism', impactScore: 38, direction: 'INCREASE', description: '4 previous compounding penalties' },
        { factor: 'Category Non-Compliance Baseline', impactScore: 24, direction: 'INCREASE', description: 'High regional defect rate' }
      ],
      suggestedAction: 'Schedule Field Inspection & Physical Verification by Authorized Officer',
      priorityRank: 1,
    };

    it('renders DataSufficiencyBadge with audit depth count', () => {
      render(<DataSufficiencyBadge sufficiency="SUFFICIENT" auditsCount={14} />);
      expect(screen.getByText('Sufficient Data (14 Audits)')).toBeInTheDocument();
    });

    it('renders RiskScoreCard with predictive score and suggested action', () => {
      render(<RiskScoreCard item={sampleQueueItem} />);

      expect(screen.getByText('89')).toBeInTheDocument();
      expect(screen.getByText('Royal Aqua Mineral Water 1L')).toBeInTheDocument();
      expect(screen.getByText(/Schedule Field Inspection/i)).toBeInTheDocument();
    });

    it('renders RiskFactorBreakdown with explainable AI impacts', () => {
      render(<RiskFactorBreakdown factors={sampleQueueItem.riskFactors} />);

      expect(screen.getByText('Habitual Recidivism')).toBeInTheDocument();
      expect(screen.getByText('+38 pts')).toBeInTheDocument();
      expect(screen.getByText('Category Non-Compliance Baseline')).toBeInTheDocument();
    });

    it('renders InspectNextQueueList and triggers dispatch action', () => {
      const handleSelect = vi.fn();
      const handleDispatch = vi.fn();

      render(
        <AuthProvider>
          <InspectNextQueueList
            queue={[sampleQueueItem]}
            onSelectItem={handleSelect}
            onDispatchInspection={handleDispatch}
          />
        </AuthProvider>
      );

      expect(screen.getByText('#1 PRIORITY')).toBeInTheDocument();
      const dispatchBtn = screen.getByRole('button', { name: /Assign Inspection/i });
      fireEvent.click(dispatchBtn);
      expect(handleDispatch).toHaveBeenCalledWith(sampleQueueItem);
    });
  });

  /* ============================================================
     F34: Manufacturer Dashboard Tests
     ============================================================ */
  describe('F34: Manufacturer Dashboard', () => {
    const sampleKpis: ManufacturerKPIs = {
      totalProducts: 12,
      compliantProducts: 9,
      flaggedProducts: 3,
      overallComplianceRate: 75,
      pendingRemediations: 4,
      activeArtworks: 18,
      lastSelfScanDate: new Date().toISOString(),
    };

    const sampleProducts: ManufacturerProduct[] = [
      {
        id: 'prod-001',
        sku: 'SKU-PF-CHILLI',
        name: 'Priya Chilli Powder 500g',
        brand: 'Priya Foods',
        category: 'Spices & Condiments',
        netQuantity: '500 g',
        mrp: '₹140.00',
        packagingType: 'Pouch',
        currentArtworkVersion: 'v2.1',
        complianceStatus: 'FLAGGED',
        artworks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    it('renders ManufacturerKPICards with readiness index and counts', () => {
      render(<ManufacturerKPICards kpis={sampleKpis} />);

      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('18')).toBeInTheDocument();
    });

    it('renders ProductComplianceSummary with status tags', () => {
      render(
        <BrowserRouter>
          <ProductComplianceSummary products={sampleProducts} />
        </BrowserRouter>
      );

      expect(screen.getByText('Priya Chilli Powder 500g')).toBeInTheDocument();
      expect(screen.getByText('NEEDS REMEDIATION')).toBeInTheDocument();
    });
  });

  /* ============================================================
     F35: Manufacturer Product Library & Artwork Management Tests
     ============================================================ */
  describe('F35: Manufacturer Product Library & Artwork Management', () => {
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

    const sampleProduct: ManufacturerProduct = {
      id: 'prod-001',
      sku: 'SKU-PF-CHILLI-500G',
      name: 'Priya Foods Premium Chilli Powder 500g',
      brand: 'Priya Foods',
      category: 'Spices & Condiments',
      netQuantity: '500 g',
      mrp: '₹140.00',
      packagingType: 'Stand-up Pouch',
      currentArtworkVersion: 'v2.1',
      complianceStatus: 'FLAGGED',
      artworks: [sampleArtwork],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('renders ProductLibraryGrid with SKU badge and MRP', () => {
      const handleSelect = vi.fn();
      render(
        <ProductLibraryGrid
          products={[sampleProduct]}
          onSelectProduct={handleSelect}
        />
      );

      expect(screen.getByText('SKU-PF-CHILLI-500G')).toBeInTheDocument();
      expect(screen.getByText('Priya Foods Premium Chilli Powder 500g')).toBeInTheDocument();
      expect(screen.getByText('₹140.00')).toBeInTheDocument();
    });

    it('renders ArtworkUploadPanel and allows form submission', async () => {
      const handleUpload = vi.fn().mockResolvedValue(undefined);
      render(
        <ArtworkUploadPanel
          productId="prod-001"
          onUpload={handleUpload}
        />
      );

      const submitBtn = screen.getByRole('button', { name: /Upload & Queue for AI Self-Scan/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(handleUpload).toHaveBeenCalled();
      });
    });

    it('renders ArtworkVersionList with versions and change summaries', () => {
      render(<ArtworkVersionList artworks={[sampleArtwork]} />);

      expect(screen.getByText(/Packaging Artwork Version History \(1\)/i)).toBeInTheDocument();
      expect(screen.getByText('v2.1')).toBeInTheDocument();
      expect(screen.getByText('Adjusted unit sale price font area.')).toBeInTheDocument();
    });
  });
});
