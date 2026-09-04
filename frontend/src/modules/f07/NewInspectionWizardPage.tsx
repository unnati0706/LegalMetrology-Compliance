import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WizardStepper } from './WizardStepper';
import { CategorySelector } from './CategorySelector';
import { LocationPicker, LocationData } from './LocationPicker';
import { ProductMetadataForm } from './ProductMetadataForm';
import { WizardSummaryStep } from './WizardSummaryStep';
import { ArrowLeft, ArrowRight, Camera, Check } from 'lucide-react';

export const NewInspectionWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const [category, setCategory] = useState({ id: 'cat-spices', name: 'Spices & Condiments' });
  const [location, setLocation] = useState<LocationData>({
    state: 'Maharashtra',
    district: 'Pune Urban',
    premisesName: 'Apex Wholesale Hub',
    premisesType: 'SUPERMARKET',
    gpsCoordinates: '18.5204° N, 73.8567° E'
  });
  const [productMetadata, setProductMetadata] = useState({
    brandName: 'Priya Foods',
    productName: 'Premium Red Chilli Powder',
    declaredNetQuantity: '500 g',
    declaredMrp: '₹140.00',
    batchNumber: 'BATCH-2026-PF01',
    packageType: 'Flexible Foil Pouch'
  });

  const steps = [
    { id: 1, title: 'Category', subtitle: 'Select Commodity' },
    { id: 2, title: 'Location', subtitle: 'Premises & GPS' },
    { id: 3, title: 'Metadata', subtitle: 'Product Specs' },
    { id: 4, title: 'Review', subtitle: 'Launch Capture' },
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Create new inspection session and navigate to image capture
      const generatedId = `insp-${Date.now().toString(36)}`;
      navigate(`/inspections/${generatedId}/capture`);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', padding: '1rem 0' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
          Create New Statutory Inspection
        </h1>
        <p style={{ margin: '0.2rem 0 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Step {currentStep} of 4 — Legal Metrology Act, 2009 & Packaged Commodities Rules, 2011
        </p>
      </div>

      <WizardStepper
        currentStep={currentStep}
        steps={steps}
        onStepClick={(s) => setCurrentStep(s)}
      />

      <div className="card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '2rem', marginBottom: '1.5rem' }}>
        {currentStep === 1 && (
          <CategorySelector
            selectedCategoryId={category.id}
            onSelectCategory={(id, name) => setCategory({ id, name })}
          />
        )}

        {currentStep === 2 && (
          <LocationPicker
            location={location}
            onChange={(loc) => setLocation(prev => ({ ...prev, ...loc }))}
          />
        )}

        {currentStep === 3 && (
          <ProductMetadataForm
            metadata={productMetadata}
            onChange={(data) => setProductMetadata(prev => ({ ...prev, ...data }))}
          />
        )}

        {currentStep === 4 && (
          <WizardSummaryStep
            categoryName={category.name}
            metadata={productMetadata}
            location={location}
          />
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={handlePrev}
          className="btn btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}
        >
          <ArrowLeft size={16} /> {currentStep === 1 ? 'Cancel' : 'Previous Step'}
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9375rem', padding: '0.625rem 1.5rem' }}
        >
          {currentStep === 4 ? (
            <>
              <Camera size={18} /> Launch Multi-Side Camera Capture
            </>
          ) : (
            <>
              Next Step <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
