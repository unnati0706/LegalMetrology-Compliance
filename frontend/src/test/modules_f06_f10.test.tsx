import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../shared/auth/AuthContext.js';
import { Inspection } from '../shared/types/index.js';

// F06 Components
import { DashboardKPICards } from '../modules/f06/DashboardKPICards.js';
import { RecentInspectionsList } from '../modules/f06/RecentInspectionsList.js';
import { PendingReviewWidget } from '../modules/f06/PendingReviewWidget.js';
import { QuickStartInspectionButton } from '../modules/f06/QuickStartInspectionButton.js';

// F07 Components
import { WizardStepper } from '../modules/f07/WizardStepper.js';
import { CategorySelector } from '../modules/f07/CategorySelector.js';
import { LocationPicker } from '../modules/f07/LocationPicker.js';
import { WizardSummaryStep } from '../modules/f07/WizardSummaryStep.js';

// F08 Components
import { CategoryAutocomplete } from '../modules/f08/CategoryAutocomplete.js';
import { ManufacturerLookup } from '../modules/f08/ManufacturerLookup.js';
import { PackageTypeSelect } from '../modules/f08/PackageTypeSelect.js';
import { ProductForm } from '../modules/f08/ProductForm.js';

// F09 Components
import { ImageSideTagger } from '../modules/f09/ImageSideTagger.js';
import { UploadProgressList } from '../modules/f09/UploadProgressList.js';
import { CameraCapture } from '../modules/f09/CameraCapture.js';
import { MultiImageUploader } from '../modules/f09/MultiImageUploader.js';

// F10 Components
import { QualityScoreBadge } from '../modules/f10/QualityScoreBadge.js';
import { BlurGlareWarning } from '../modules/f10/BlurGlareWarning.js';
import { RetakePrompt } from '../modules/f10/RetakePrompt.js';
import { FramingOverlayGuide } from '../modules/f10/FramingOverlayGuide.js';

describe('Frontend Modules F06 - F10 Component Suite', () => {
  /* ============================================================
     F06: Inspector Dashboard Tests
     ============================================================ */
  describe('F06: Inspector Dashboard', () => {
    const sampleKpis = {
      todayInspections: 8,
      compliantCount: 6,
      flaggedCount: 2,
      pendingReviews: 3,
      complianceRate: 75,
    };

    it('renders DashboardKPICards with daily inspection stats', () => {
      render(<DashboardKPICards kpis={sampleKpis} />);
      expect(screen.getByText("Today's Field Audits")).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('75% Field Compliance Rate')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders RecentInspectionsList and links', () => {
      const sampleList: Inspection[] = [
        {
          id: 'insp-101',
          inspectorId: 'usr-01',
          inspectorName: 'Amit Patel',
          productName: 'Priya Foods Chilli Powder',
          category: 'Spices & Condiments',
          manufacturerName: 'Priya Foods Ltd',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'COMPLETED',
          ruleVersion: 'PCR-2011-v2.0',
          declarationsCount: 5,
          violationsCount: 0,
          manualReviewCount: 0,
          overallDisposition: 'COMPLIANT'
        }
      ];

      render(
        <BrowserRouter>
          <RecentInspectionsList inspections={sampleList} />
        </BrowserRouter>
      );
      expect(screen.getByText('Priya Foods Chilli Powder')).toBeInTheDocument();
      expect(screen.getByText(/Compliant/i)).toBeInTheDocument();
    });

    it('renders PendingReviewWidget with count', () => {
      render(
        <BrowserRouter>
          <PendingReviewWidget pendingCount={4} />
        </BrowserRouter>
      );
      expect(screen.getByText(/Confidence Review Gate \(4 Pending\)/i)).toBeInTheDocument();
    });

    it('renders QuickStartInspectionButton', () => {
      render(
        <BrowserRouter>
          <QuickStartInspectionButton />
        </BrowserRouter>
      );
      expect(screen.getByRole('button', { name: /Start New Inspection/i })).toBeInTheDocument();
    });
  });

  /* ============================================================
     F07: New Inspection Wizard Tests
     ============================================================ */
  describe('F07: New Inspection Wizard', () => {
    const steps = [
      { id: 1, title: 'Category', subtitle: 'Select Commodity' },
      { id: 2, title: 'Location', subtitle: 'Premises & GPS' },
    ];

    it('renders WizardStepper with active and completed steps', () => {
      render(<WizardStepper currentStep={2} steps={steps} />);
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
    });

    it('renders CategorySelector and triggers selection', () => {
      const handleSelect = vi.fn();
      render(<CategorySelector selectedCategoryId="cat-spices" onSelectCategory={handleSelect} />);
      expect(screen.getByText('Spices & Condiments')).toBeInTheDocument();
      const waterCat = screen.getByText('Packaged Drinking Water');
      fireEvent.click(waterCat);
      expect(handleSelect).toHaveBeenCalledWith('cat-water', 'Packaged Drinking Water');
    });

    it('renders LocationPicker and allows state select', () => {
      const handleChange = vi.fn();
      render(
        <LocationPicker
          location={{ state: 'Maharashtra', district: 'Pune', premisesName: 'Store A', premisesType: 'SUPERMARKET' }}
          onChange={handleChange}
        />
      );
      expect(screen.getByDisplayValue('Pune')).toBeInTheDocument();
    });

    it('renders WizardSummaryStep with review data', () => {
      render(
        <WizardSummaryStep
          categoryName="Spices & Condiments"
          metadata={{ brandName: 'Priya Foods', productName: 'Chilli Powder', declaredNetQuantity: '500 g', declaredMrp: '₹140.00', packageType: 'Pouch' }}
          location={{ state: 'Maharashtra', district: 'Pune', premisesName: 'Apex Store', premisesType: 'SUPERMARKET' }}
        />
      );
      expect(screen.getByText('Priya Foods')).toBeInTheDocument();
      expect(screen.getByText('₹140.00')).toBeInTheDocument();
    });
  });

  /* ============================================================
     F08: Product & Category Metadata Entry Tests
     ============================================================ */
  describe('F08: Product & Category Metadata Entry', () => {
    it('renders CategoryAutocomplete with dropdown options', () => {
      const handleChange = vi.fn();
      render(<CategoryAutocomplete value="Spices" onChange={handleChange} />);
      expect(screen.getByPlaceholderText(/Search PCR 2011 category/i)).toBeInTheDocument();
    });

    it('renders ManufacturerLookup with registered list', () => {
      const handleChange = vi.fn();
      render(<ManufacturerLookup value="Priya" onChange={handleChange} />);
      expect(screen.getByPlaceholderText(/Lookup registered brand/i)).toBeInTheDocument();
    });

    it('renders PackageTypeSelect with format options', () => {
      const handleChange = vi.fn();
      render(<PackageTypeSelect value="Flexible Pouch" onChange={handleChange} />);
      expect(screen.getByText(/Packaging Format & Substrate/i)).toBeInTheDocument();
    });

    it('renders ProductForm and validates submit', async () => {
      const handleSubmit = vi.fn();
      render(<ProductForm onSubmit={handleSubmit} />);
      const submitBtn = screen.getByRole('button', { name: /Proceed to Multi-Side Camera Capture/i });
      fireEvent.click(submitBtn);
      // Fails initial empty name validation
      expect(screen.getByText(/Product name is mandatory/i)).toBeInTheDocument();
    });
  });

  /* ============================================================
     F09: Multi-Side Image Capture & Upload Tests
     ============================================================ */
  describe('F09: Multi-Side Image Capture & Upload', () => {
    it('renders ImageSideTagger and handles tag selection', () => {
      const handleSelect = vi.fn();
      render(<ImageSideTagger currentSide="PDP (Front)" onSelectSide={handleSelect} />);
      expect(screen.getByText('Back Panel')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Back Panel'));
      expect(handleSelect).toHaveBeenCalledWith('Back Panel');
    });

    it('renders UploadProgressList with captured photos and remove button', () => {
      const handleRemove = vi.fn();
      const samplePhotos = [
        {
          id: 'p-1',
          side: 'PDP (Front)',
          url: 'https://example.com/photo.jpg',
          size: '3.4 MB',
          qualityScore: 92,
          timestamp: new Date().toISOString()
        }
      ];

      render(<UploadProgressList photos={samplePhotos} onRemovePhoto={handleRemove} />);
      expect(screen.getByText('PDP (Front)')).toBeInTheDocument();
      expect(screen.getByText(/3.4 MB/i)).toBeInTheDocument();
    });

    it('renders CameraCapture with snap button', () => {
      const handleCapture = vi.fn();
      render(<CameraCapture currentSide="PDP (Front)" onCapture={handleCapture} />);
      expect(screen.getByRole('button', { name: /Capture PDP \(Front\)/i })).toBeInTheDocument();
    });

    it('renders MultiImageUploader with drag/drop area', () => {
      const handleUpload = vi.fn();
      render(<MultiImageUploader currentSide="PDP (Front)" onUpload={handleUpload} />);
      expect(screen.getByText(/Or upload pre-captured image for PDP \(Front\)/i)).toBeInTheDocument();
    });
  });

  /* ============================================================
     F10: Image Quality Guidance Tests
     ============================================================ */
  describe('F10: Image Quality Guidance', () => {
    it('renders QualityScoreBadge with color-coded score', () => {
      render(<QualityScoreBadge score={92} label="Sharpness" />);
      expect(screen.getByText('Sharpness: 92% Quality')).toBeInTheDocument();
    });

    it('renders BlurGlareWarning when glare or blur is detected', () => {
      render(<BlurGlareWarning hasBlur={true} hasGlare={true} skewAngle={4.5} />);
      expect(screen.getByText(/Image Evidentiary Warning/i)).toBeInTheDocument();
      expect(screen.getByText(/Reflection \/ specular glare detected/i)).toBeInTheDocument();
    });

    it('renders RetakePrompt with retry trigger', () => {
      const handleRetake = vi.fn();
      render(<RetakePrompt onRetake={handleRetake} />);
      expect(screen.getByText(/Retake Recommended/i)).toBeInTheDocument();
      const retakeBtn = screen.getByRole('button', { name: /Retake Photo/i });
      fireEvent.click(retakeBtn);
      expect(handleRetake).toHaveBeenCalled();
    });

    it('renders FramingOverlayGuide with alignment instruction', () => {
      render(<FramingOverlayGuide sideLabel="Back Panel" />);
      expect(screen.getByText(/Align Back Panel inside bounding box/i)).toBeInTheDocument();
    });
  });
});
