import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MRPValidationCard } from './MRPValidationCard.js';
import { NetQuantityValidationCard } from './NetQuantityValidationCard.js';
import { MRPValidationResult, NetQuantityValidationResult } from '../../shared/types/index.js';

const sampleMRPData: MRPValidationResult = {
  declaredMRP: '₹140.00 (Incl. of all taxes)',
  numericMRP: 140.0,
  hasTaxInclusionText: true,
  hasRupeeSymbol: true,
  declaredUSP: '₹0.28 / g',
  calculatedUSP: '₹0.28 / g',
  isUSPMandatory: true,
  isUSPCompliant: true,
  status: 'COMPLIANT',
  remarks: [
    'MRP includes the mandatory Indian Rupee (₹) symbol preceding the numerals.',
    'Mandatory phrase "(Inclusive of all taxes)" or "(Incl. of all taxes)" is clearly legible.',
    'Commodity net weight exceeds 100g, triggering mandatory Unit Sale Price declaration under 2022 Amendment.',
    'Calculated Unit Sale Price (₹140 / 500g = ₹0.28/g) precisely matches declared packaging value.'
  ]
};

const sampleQtyData: NetQuantityValidationResult = {
  declaredQuantity: '500 g',
  numericValue: 500,
  unit: 'g',
  isStandardUnit: true,
  isScheduleIICompliant: true,
  maxPermissibleErrorPercentage: 1.5,
  status: 'COMPLIANT',
  remarks: [
    'Net quantity stated in standard SI metric mass unit (g) with space between numerals and symbol.',
    'Standard commodity packaging size conforms to Second Schedule prescribed weight brackets.',
    'Allowable Maximum Permissible Error (MPE) under Fifth Schedule is ±1.5% (±7.5g).'
  ]
};

export const MRPQuantityValidationPage: React.FC = () => {
  const { id = 'insp-sample-01' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [mrpData] = useState<MRPValidationResult>(sampleMRPData);
  const [qtyData] = useState<NetQuantityValidationResult>(sampleQtyData);

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
              MRP & Net Quantity Deep Validation
            </h1>
            <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-700, #1d4ed8)', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
              F17 Price & Metric Engine
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Mathematical and statutory verification of Unit Sale Price, Rupee currency symbols, SI units, and Schedule II standard weights.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate(`/inspections/${id}/entity-care`)} className="btn btn-primary">
            Manufacturer & Consumer Care (F18) →
          </button>
        </div>
      </div>

      <MRPValidationCard data={mrpData} />
      <NetQuantityValidationCard data={qtyData} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
        <button onClick={() => navigate(`/inspections/${id}/completeness`)} className="btn btn-secondary">
          ← Back to Completeness Audit (F16)
        </button>
        <button onClick={() => navigate(`/inspections/${id}/entity-care`)} className="btn btn-primary">
          Proceed to Entity & Consumer Care (F18) →
        </button>
      </div>
    </div>
  );
};
