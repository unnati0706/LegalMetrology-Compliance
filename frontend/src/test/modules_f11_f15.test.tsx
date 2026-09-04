import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// F11
import { ProcessingTimeline } from '../modules/f11/ProcessingTimeline.js';
import { ProgressStepIndicator } from '../modules/f11/ProgressStepIndicator.js';
import { ProcessingFailureRetry } from '../modules/f11/ProcessingFailureRetry.js';

// F12
import { DeclarationTable } from '../modules/f12/DeclarationTable.js';
import { ConfidenceBadge } from '../modules/f12/ConfidenceBadge.js';
import { EditableDeclarationField } from '../modules/f12/EditableDeclarationField.js';

// F13
import { RuleVersionBadge } from '../modules/f13/RuleVersionBadge.js';
import { RuleLegalReferenceLink } from '../modules/f13/RuleLegalReferenceLink.js';
import { ApplicableRuleList } from '../modules/f13/ApplicableRuleList.js';

// F14
import { SeverityTag } from '../modules/f14/SeverityTag.js';
import { ConfidenceMeter } from '../modules/f14/ConfidenceMeter.js';
import { ViolationCard } from '../modules/f14/ViolationCard.js';
import { ComplianceResultTable } from '../modules/f14/ComplianceResultTable.js';

// F15
import { BoundingBoxOverlay } from '../modules/f15/BoundingBoxOverlay.js';
import { ImageAnnotationCanvas } from '../modules/f15/ImageAnnotationCanvas.js';

import { Declaration, CheckResult, EvidenceItem, ApplicableRule, Violation } from '../shared/types/index.js';

describe('Frontend Modules F11 - F15 Comprehensive Component Tests', () => {
  // Sample test data
  const sampleStages = [
    { id: 'stage-1', name: 'Image Dewarp', status: 'COMPLETED' as const, durationMs: 400 },
    { id: 'stage-2', name: 'OCR Extraction', status: 'IN_PROGRESS' as const }
  ];

  const sampleDeclaration: Declaration = {
    id: 'dec-01',
    inspectionId: 'insp-01',
    field: 'mrp',
    value: '₹140.00 (Incl. of all taxes)',
    confidence: 0.95,
    status: 'DETECTED',
    packageSide: 'BACK',
    boundingBox: { ymin: 0.1, xmin: 0.1, ymax: 0.3, xmax: 0.4 }
  };

  const sampleRules: ApplicableRule[] = [
    {
      id: 'rule-01',
      ruleCode: 'PCR-2011-R06-MRP',
      title: 'MRP Declaration & Taxes',
      category: 'General Pre-Packaged Commodities',
      legalReference: 'Rule 6(1)(e)',
      description: 'The maximum retail price inclusive of all taxes.',
      isMandatory: true,
      version: 'PCR-2011-v2.0',
      effectiveDate: '2022-01-01',
      penalClause: 'Section 36(1) of Legal Metrology Act, 2009'
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
      boundingBox: { ymin: 0.1, xmin: 0.1, ymax: 0.3, xmax: 0.4 }
    }
  ];

  const sampleViolation: Violation = {
    id: 'viol-01',
    inspectionId: 'insp-01',
    ruleCode: 'PCR-2011-R07-FONT-SIZE',
    legalReference: 'Rule 7 & Table 1',
    violationType: 'Minimum Font Height Violation',
    severity: 'MAJOR',
    explanation: 'Numeral height on PDP is below 4.0mm requirement.',
    packageSide: 'PDP',
    status: 'OPEN'
  };

  const sampleEvidence: EvidenceItem[] = [
    {
      id: 'ev-01',
      inspectionId: 'insp-01',
      packageSide: 'BACK',
      imageUrl: 'https://example.com/back.jpg',
      qualityScore: 95
    }
  ];

  // F11 Tests
  describe('F11: OCR / Extraction Processing & Progress Status', () => {
    it('renders processing timeline stages correctly', () => {
      render(<ProcessingTimeline stages={sampleStages} currentStageId="stage-2" />);
      expect(screen.getByText('Multi-Stage Extraction Pipeline')).toBeInTheDocument();
      expect(screen.getByText('Image Dewarp')).toBeInTheDocument();
      expect(screen.getByText('OCR Extraction')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('renders progress percentage indicator', () => {
      render(<ProgressStepIndicator progressPercent={85} activeStageName="OCR Extraction" estimatedRemainingSec={2} />);
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('OCR Extraction')).toBeInTheDocument();
      expect(screen.getByText('~2s remaining')).toBeInTheDocument();
    });

    it('handles retry and fallback clicks in ProcessingFailureRetry', () => {
      const mockRetry = vi.fn();
      const mockFallback = vi.fn();
      render(<ProcessingFailureRetry onRetry={mockRetry} onManualReviewFallback={mockFallback} />);
      
      fireEvent.click(screen.getByText('Retry Pipeline'));
      expect(mockRetry).toHaveBeenCalled();

      fireEvent.click(screen.getByText('Skip to Manual Entry'));
      expect(mockFallback).toHaveBeenCalled();
    });
  });

  // F12 Tests
  describe('F12: Extracted Declaration Review & OCR Correction', () => {
    it('renders confidence badges correctly according to thresholds', () => {
      const { rerender } = render(<ConfidenceBadge confidence={0.95} />);
      expect(screen.getByText(/95%/)).toBeInTheDocument();
      expect(screen.getByText(/High/)).toBeInTheDocument();

      rerender(<ConfidenceBadge confidence={0.65} />);
      expect(screen.getByText(/65%/)).toBeInTheDocument();
      expect(screen.getByText(/Low/)).toBeInTheDocument();
    });

    it('allows in-place editing of declaration field and saving', async () => {
      const mockSave = vi.fn();
      render(<EditableDeclarationField declaration={sampleDeclaration} onSave={mockSave} />);
      
      expect(screen.getByText('₹140.00 (Incl. of all taxes)')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Edit'));
      const input = screen.getByDisplayValue('₹140.00 (Incl. of all taxes)');
      fireEvent.change(input, { target: { value: '₹150.00 (Incl. of all taxes)' } });
      fireEvent.click(screen.getByText('Save'));

      expect(mockSave).toHaveBeenCalledWith('dec-01', '₹150.00 (Incl. of all taxes)');
    });

    it('renders declaration table with fields and status', () => {
      const mockUpdate = vi.fn();
      render(<DeclarationTable declarations={[sampleDeclaration]} onUpdateDeclaration={mockUpdate} />);
      expect(screen.getByText('Maximum Retail Price (MRP)')).toBeInTheDocument();
      expect(screen.getByText('DETECTED')).toBeInTheDocument();
    });
  });

  // F13 Tests
  describe('F13: Rule Applicability & Category-Aware Rule Display', () => {
    it('renders version badge with notification details', () => {
      render(<RuleVersionBadge version="PCR-2011-v2.0 (Amended 2022)" />);
      expect(screen.getByText('PCR-2011-v2.0 (Amended 2022)')).toBeInTheDocument();
    });

    it('opens statutory reference modal on click', () => {
      render(
        <RuleLegalReferenceLink 
          legalReference="Rule 6(1)(e)" 
          ruleCode="PCR-2011-R06-MRP"
          description="MRP must be declared"
          penalClause="Section 36(1)"
        />
      );

      fireEvent.click(screen.getByText(/Rule 6\(1\)\(e\)/));
      expect(screen.getByText('Statutory Authority & Clause')).toBeInTheDocument();
      expect(screen.getByText('Section 36(1)')).toBeInTheDocument();
    });

    it('filters rule list based on search', () => {
      render(<ApplicableRuleList rules={sampleRules} />);
      expect(screen.getByText('MRP Declaration & Taxes')).toBeInTheDocument();
      
      const searchInput = screen.getByPlaceholderText(/Search rules/i);
      fireEvent.change(searchInput, { target: { value: 'NonExistentRule' } });
      expect(screen.getByText(/No rules match the selected filter/i)).toBeInTheDocument();
    });
  });

  // F14 Tests
  describe('F14: Compliance Results, Violations & Confidence', () => {
    it('renders severity tag with appropriate text', () => {
      render(<SeverityTag severity="MAJOR" />);
      expect(screen.getByText('MAJOR')).toBeInTheDocument();
    });

    it('renders confidence meter with score gauge', () => {
      render(<ConfidenceMeter score={88} title="Inspection Score" />);
      expect(screen.getByText('88%')).toBeInTheDocument();
      expect(screen.getByText('Inspection Score')).toBeInTheDocument();
      expect(screen.getByText('HIGH FIDELITY')).toBeInTheDocument();
    });

    it('renders violation card with legal explanation', () => {
      render(<ViolationCard violation={sampleViolation} />);
      expect(screen.getByText('Minimum Font Height Violation')).toBeInTheDocument();
      expect(screen.getByText(/Numeral height on PDP is below 4.0mm requirement/)).toBeInTheDocument();
    });

    it('renders compliance result table with filter buttons', () => {
      render(<ComplianceResultTable checks={sampleChecks} />);
      expect(screen.getByText('MRP Declaration')).toBeInTheDocument();
      expect(screen.getAllByText('PASS').length).toBeGreaterThan(0);
    });
  });

  // F15 Tests
  describe('F15: Evidence Highlighting & Bounding Boxes', () => {
    it('renders bounding box overlay with dimensions and label', () => {
      render(
        <div style={{ position: 'relative', width: '200px', height: '200px' }}>
          <BoundingBoxOverlay 
            boundingBox={{ ymin: 0.1, xmin: 0.1, ymax: 0.5, xmax: 0.5 }}
            label="MRP"
            status="PASS"
          />
        </div>
      );
      expect(screen.getByText(/MRP/)).toBeInTheDocument();
    });

    it('renders image annotation canvas and panels', () => {
      render(
        <ImageAnnotationCanvas 
          evidence={sampleEvidence}
          declarations={[sampleDeclaration]}
          checks={sampleChecks}
        />
      );
      expect(screen.getByText('BACK Panel')).toBeInTheDocument();
      expect(screen.getByText('Quality Score:')).toBeInTheDocument();
    });
  });
});
