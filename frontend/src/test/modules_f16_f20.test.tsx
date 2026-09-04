import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// F16
import { FormatValidationBadge } from '../modules/f16/FormatValidationBadge.js';
import { CompletenessChecklist } from '../modules/f16/CompletenessChecklist.js';

// F17
import { MRPValidationCard } from '../modules/f17/MRPValidationCard.js';
import { NetQuantityValidationCard } from '../modules/f17/NetQuantityValidationCard.js';

// F18
import { EntityDeclarationCard } from '../modules/f18/EntityDeclarationCard.js';
import { ConsumerCareCard } from '../modules/f18/ConsumerCareCard.js';

// F19
import { DateDeclarationCard } from '../modules/f19/DateDeclarationCard.js';
import { PlacementAnalysisPanel } from '../modules/f19/PlacementAnalysisPanel.js';
import { ReadabilityFontSizePanel } from '../modules/f19/ReadabilityFontSizePanel.js';

// F20
import { LegalReferenceTooltip } from '../modules/f20/LegalReferenceTooltip.js';
import { ExplanationDrawer } from '../modules/f20/ExplanationDrawer.js';
import { AskWhyPanel } from '../modules/f20/AskWhyPanel.js';

import {
  CompletenessItem,
  MRPValidationResult,
  NetQuantityValidationResult,
  EntityDeclarationDetails,
  ConsumerCareDetails,
  DateDeclarationDetails,
  ReadabilityMetrics,
  ExplainableRuleFinding
} from '../shared/types/index.js';

describe('Frontend Modules F16 - F20 Comprehensive Component Tests', () => {
  // F16 Tests
  describe('F16: Declaration Completeness & Format Validation Display', () => {
    it('renders format validation badge for valid and invalid states', () => {
      const { rerender } = render(<FormatValidationBadge isValid={true} />);
      expect(screen.getByText('✓ Valid Format')).toBeInTheDocument();

      rerender(<FormatValidationBadge isValid={false} />);
      expect(screen.getByText('✕ Format Error')).toBeInTheDocument();
    });

    it('renders completeness checklist with present and missing items', () => {
      const sampleItems: CompletenessItem[] = [
        {
          field: 'mrp',
          label: 'Maximum Retail Price (MRP)',
          legalClause: 'Rule 6(1)(e)',
          isRequired: true,
          status: 'PRESENT',
          extractedValue: '₹140.00',
          formatCompliant: true
        },
        {
          field: 'country_of_origin',
          label: 'Country of Origin',
          legalClause: 'Rule 6(1)(j)',
          isRequired: true,
          status: 'MISSING',
          formatCompliant: false
        }
      ];

      render(<CompletenessChecklist items={sampleItems} />);
      expect(screen.getByText('Maximum Retail Price (MRP)')).toBeInTheDocument();
      expect(screen.getByText('Country of Origin')).toBeInTheDocument();
      expect(screen.getByText('PRESENT')).toBeInTheDocument();
      expect(screen.getByText('MISSING')).toBeInTheDocument();
    });
  });

  // F17 Tests
  describe('F17: MRP & Net Quantity Validation Display', () => {
    const sampleMRP: MRPValidationResult = {
      declaredMRP: '₹140.00 (Incl. of all taxes)',
      numericMRP: 140.0,
      hasTaxInclusionText: true,
      hasRupeeSymbol: true,
      declaredUSP: '₹0.28 / g',
      calculatedUSP: '₹0.28 / g',
      isUSPMandatory: true,
      isUSPCompliant: true,
      status: 'COMPLIANT',
      remarks: ['Valid rupee symbol and tax inclusion text']
    };

    const sampleQty: NetQuantityValidationResult = {
      declaredQuantity: '500 g',
      numericValue: 500,
      unit: 'g',
      isStandardUnit: true,
      isScheduleIICompliant: true,
      maxPermissibleErrorPercentage: 1.5,
      status: 'COMPLIANT',
      remarks: ['Standard metric SI unit']
    };

    it('renders MRP validation card with prices and USP comparison', () => {
      render(<MRPValidationCard data={sampleMRP} />);
      expect(screen.getByText('₹140.00 (Incl. of all taxes)')).toBeInTheDocument();
      expect(screen.getByText('₹0.28 / g')).toBeInTheDocument();
      expect(screen.getByText('✓ Tax inclusion declared')).toBeInTheDocument();
    });

    it('renders Net Quantity validation card with metric standard verification', () => {
      render(<NetQuantityValidationCard data={sampleQty} />);
      expect(screen.getByText('500 g')).toBeInTheDocument();
      expect(screen.getByText('MPE: ±1.5%')).toBeInTheDocument();
      expect(screen.getByText('✓ Standard SI Unit')).toBeInTheDocument();
    });
  });

  // F18 Tests
  describe('F18: Manufacturer/Packer/Importer & Consumer-Care Display', () => {
    const sampleEntity: EntityDeclarationDetails = {
      type: 'MANUFACTURER',
      legalName: 'Priya Foods Ltd',
      completeAddress: 'Sector 4, Industrial Area, Pune - 411028',
      hasPinCode: true,
      pinCode: '411028',
      countryOfOrigin: 'India',
      status: 'COMPLIANT',
      remarks: ['Complete postal address with valid PIN']
    };

    const sampleCare: ConsumerCareDetails = {
      officerNameOrDesignation: 'Manager, Consumer Grievance',
      contactNumber: '1800-200-1122',
      isTollFreeOrValidPhone: true,
      emailAddress: 'care@priyafoods.in',
      isEmailValid: true,
      postalAddress: 'Priya Foods Customer Cell, Pune - 411028',
      status: 'COMPLIANT',
      remarks: ['Toll-free customer care phone active']
    };

    it('renders entity declaration card with address and PIN', () => {
      render(<EntityDeclarationCard data={sampleEntity} />);
      expect(screen.getByText('Priya Foods Ltd')).toBeInTheDocument();
      expect(screen.getByText(/Sector 4, Industrial Area, Pune/)).toBeInTheDocument();
      expect(screen.getByText('✓ Valid 6-Digit PIN: 411028')).toBeInTheDocument();
    });

    it('renders consumer care card with helpline and email validation', () => {
      render(<ConsumerCareCard data={sampleCare} />);
      expect(screen.getByText('1800-200-1122')).toBeInTheDocument();
      expect(screen.getByText('care@priyafoods.in')).toBeInTheDocument();
      expect(screen.getByText('✓ Valid RFC 5322 Email')).toBeInTheDocument();
    });
  });

  // F19 Tests
  describe('F19: Date Declaration & Placement/Readability/Font-Size Display', () => {
    const sampleDate: DateDeclarationDetails = {
      dateType: 'MFG',
      declaredDateString: '08/2026',
      month: 8,
      year: 2026,
      isFutureDate: false,
      isFormatCompliant: true,
      status: 'COMPLIANT'
    };

    const sampleMetrics: ReadabilityMetrics = {
      numeralHeightMm: 4.2,
      requiredMinHeightMm: 4.0,
      isHeightCompliant: true,
      pdpAreaCm2: 320,
      contrastRatio: 9.4,
      isContrastCompliant: true,
      lightingGlareScore: 92
    };

    it('renders date declaration card and future date check', () => {
      render(<DateDeclarationCard data={sampleDate} />);
      expect(screen.getByText('08/2026')).toBeInTheDocument();
      expect(screen.getByText('✓ Compliant MM/YYYY format')).toBeInTheDocument();
      expect(screen.getByText('✓ Valid Historical / Current Date')).toBeInTheDocument();
    });

    it('renders placement analysis panel', () => {
      const placementItems = [
        { field: 'Net Quantity', declaredSide: 'PDP', statutoryRequiredSide: 'PDP', isCompliant: true }
      ];
      render(<PlacementAnalysisPanel items={placementItems} />);
      expect(screen.getByText('Net Quantity')).toBeInTheDocument();
      expect(screen.getByText('✓ On PDP')).toBeInTheDocument();
    });

    it('renders readability and font size metrics panel', () => {
      render(<ReadabilityFontSizePanel metrics={sampleMetrics} />);
      expect(screen.getByText('4.2 mm')).toBeInTheDocument();
      expect(screen.getByText('9.4:1')).toBeInTheDocument();
      expect(screen.getByText('320 cm²')).toBeInTheDocument();
    });
  });

  // F20 Tests
  describe('F20: Explainable Findings & "Ask Why?"', () => {
    const sampleFinding: ExplainableRuleFinding = {
      ruleCode: 'PCR-2011-R06-MRP',
      ruleTitle: 'MRP Declaration & Tax Inclusion',
      statutoryClause: 'Rule 6(1)(e)',
      verdict: 'PASS',
      verdictSummary: 'MRP is declared with mandatory Rupee symbol and tax inclusive phrase.',
      detailedLogic: [
        'Optical extraction detected valid ₹ symbol.',
        'Tax inclusion text verified.'
      ],
      statutoryText: 'The maximum retail price inclusive of all taxes.',
      compoundingPenalty: 'Section 36(1) penalty of ₹25,000 for first offence.',
      remediationAdvice: 'No action required.'
    };

    it('toggles legal reference tooltip on click', () => {
      render(
        <LegalReferenceTooltip
          statutoryClause="Rule 6(1)(e)"
          statutoryText="The maximum retail price inclusive of all taxes."
        />
      );

      fireEvent.click(screen.getByText('§ Rule 6(1)(e)'));
      expect(screen.getByText('The maximum retail price inclusive of all taxes.')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Dismiss'));
      expect(screen.queryByText('The maximum retail price inclusive of all taxes.')).not.toBeInTheDocument();
    });

    it('renders Ask Why reasoning panel with step-by-step logic trail', () => {
      const mockSelect = vi.fn();
      render(<AskWhyPanel findings={[sampleFinding]} onSelectFinding={mockSelect} />);
      expect(screen.getByText('"Ask Why?" AI & Deterministic Reasoning Engine')).toBeInTheDocument();
      expect(screen.getByText('Optical extraction detected valid ₹ symbol.')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Open Full Legal Drawer →'));
      expect(mockSelect).toHaveBeenCalledWith(sampleFinding);
    });

    it('renders explanation drawer with courtroom-ready statutory clause and penalty', () => {
      const mockClose = vi.fn();
      render(<ExplanationDrawer finding={sampleFinding} onClose={mockClose} />);
      expect(screen.getByText('Explainable Statutory Logic')).toBeInTheDocument();
      expect(screen.getByText('Section 36(1) penalty of ₹25,000 for first offence.')).toBeInTheDocument();

      fireEvent.click(screen.getByText('✕'));
      expect(mockClose).toHaveBeenCalled();
    });
  });
});
