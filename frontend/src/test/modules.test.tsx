import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../shared/auth/AuthContext.js';
import { ComplianceHeatmapGrid } from '../modules/f21/ComplianceHeatmapGrid.js';
import { ManualReviewList } from '../modules/f22/ManualReviewList.js';
import { NotesEditor } from '../modules/f23/NotesEditor.js';
import { DispositionSelector } from '../modules/f24/DispositionSelector.js';
import { InspectionSearchBar } from '../modules/f25/InspectionSearchBar.js';
import { InspectionListTable } from '../modules/f25/InspectionListTable.js';
import { CheckResult, Declaration, EvidenceItem, Inspection } from '../shared/types/index.js';

describe('Frontend Modules F21 - F25 Component Tests', () => {
  const sampleEvidence: EvidenceItem[] = [
    {
      id: 'ev-01',
      inspectionId: 'insp-01',
      packageSide: 'BACK',
      imageUrl: 'https://example.com/back.jpg',
      qualityScore: 95,
    },
    {
      id: 'ev-02',
      inspectionId: 'insp-01',
      packageSide: 'PDP',
      imageUrl: 'https://example.com/pdp.jpg',
      qualityScore: 92,
    }
  ];

  const sampleChecks: CheckResult[] = [
    {
      id: 'chk-01',
      inspectionId: 'insp-01',
      ruleCode: 'PCR-2011-R06-MRP',
      ruleTitle: 'MRP Declaration',
      legalReference: 'Rule 6(1)(e)',
      status: 'PASS',
      confidence: 0.95,
      explanation: 'Compliant MRP detected.',
      packageSide: 'BACK',
      boundingBox: { ymin: 0.2, xmin: 0.2, ymax: 0.4, xmax: 0.5 },
    },
    {
      id: 'chk-02',
      inspectionId: 'insp-01',
      ruleCode: 'PCR-2011-R06-USP',
      ruleTitle: 'Unit Sale Price',
      legalReference: 'Rule 6(1)(e)',
      status: 'MANUAL_REVIEW',
      confidence: 0.60,
      explanation: 'Low confidence USP extraction.',
      packageSide: 'BACK',
      boundingBox: { ymin: 0.5, xmin: 0.2, ymax: 0.7, xmax: 0.5 },
    }
  ];

  describe('F21: Compliance Heatmap', () => {
    it('renders side selector buttons and bounding box badges', () => {
      render(
        <ComplianceHeatmapGrid
          evidence={sampleEvidence}
          checks={sampleChecks}
          declarations={[]}
        />
      );

      expect(screen.getByText('BACK')).toBeInTheDocument();
      expect(screen.getByText('PDP')).toBeInTheDocument();
      expect(screen.getByText('PCR-2011-R06-MRP')).toBeInTheDocument();
      expect(screen.getByText('MRP Declaration')).toBeInTheDocument();
    });
  });

  describe('F22: Manual Review Queue', () => {
    it('renders manual review findings and triggers decision modal', async () => {
      const mockSubmit = vi.fn();
      render(
        <ManualReviewList
          items={[sampleChecks[1]]}
          onDecisionSubmitted={mockSubmit}
        />
      );

      expect(screen.getByText('Unit Sale Price')).toBeInTheDocument();
      expect(screen.getByText(/Confirm PASS/i)).toBeInTheDocument();
      expect(screen.getByText(/Confirm FLAG/i)).toBeInTheDocument();

      // Open confirm PASS modal
      fireEvent.click(screen.getByText(/Confirm PASS/i));
      expect(screen.getByText('Confirm Compliance (PASS)')).toBeInTheDocument();
      expect(screen.getByText(/Confirm & Mark PASS/i)).toBeInTheDocument();
    });
  });

  describe('F23: Inspector Notes & Annotation', () => {
    it('allows typing note, selecting preset tags, and submitting', async () => {
      const mockAddNote = vi.fn();
      render(<NotesEditor onAddNote={mockAddNote} />);

      const textarea = screen.getByPlaceholderText(/Type field inspection notes/i);
      fireEvent.change(textarea, { target: { value: 'Packaging batch seal verified.' } });

      const tagButton = screen.getByText('Physical Sample');
      fireEvent.click(tagButton);

      const submitBtn = screen.getByText('Post Observation');
      fireEvent.click(submitBtn);

      expect(mockAddNote).toHaveBeenCalledWith('Packaging batch seal verified.', ['Physical Sample']);
    });
  });

  describe('F24: Inspection Finalization & Disposition', () => {
    it('renders statutory disposition options and handles selection', () => {
      const mockChange = vi.fn();
      render(
        <DispositionSelector
          selectedDisposition="COMPLIANT"
          onChange={mockChange}
        />
      );

      expect(screen.getByText('Full Compliance (PASS)')).toBeInTheDocument();
      expect(screen.getByText('Non-Compliant (FLAGGED)')).toBeInTheDocument();
      expect(screen.getByText('Requires Re-Inspection')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Non-Compliant (FLAGGED)'));
      expect(mockChange).toHaveBeenCalledWith('NON_COMPLIANT');
    });
  });

  describe('F25: Inspection History & Search', () => {
    const sampleInspections: Inspection[] = [
      {
        id: 'insp-01',
        inspectorId: 'usr-01',
        inspectorName: 'Amit Patel',
        productName: 'Priya Foods Spices 500g',
        category: 'Spices & Condiments',
        manufacturerName: 'Priya Foods Ltd',
        status: 'MANUAL_REVIEW_REQUIRED',
        ruleVersion: 'PCR-2011-v2.0',
        declarationsCount: 5,
        violationsCount: 1,
        manualReviewCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    it('renders search bar and inspection list table', () => {
      const mockSelect = vi.fn();
      render(
        <InspectionListTable
          inspections={sampleInspections}
          onSelectInspection={mockSelect}
        />
      );

      expect(screen.getByText('Priya Foods Spices 500g')).toBeInTheDocument();
      expect(screen.getByText('Spices & Condiments')).toBeInTheDocument();
      expect(screen.getByText('REVIEW REQUIRED')).toBeInTheDocument();
    });
  });
});
