import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DateDeclarationCard } from './DateDeclarationCard.js';
import { PlacementAnalysisPanel } from './PlacementAnalysisPanel.js';
import { ReadabilityFontSizePanel } from './ReadabilityFontSizePanel.js';
import { DateDeclarationDetails, ReadabilityMetrics } from '../../shared/types/index.js';

const sampleDate: DateDeclarationDetails = {
  dateType: 'MFG',
  declaredDateString: '08/2026',
  month: 8,
  year: 2026,
  isFutureDate: false,
  isFormatCompliant: true,
  status: 'COMPLIANT'
};

const samplePlacementItems = [
  { field: 'Net Quantity', declaredSide: 'PDP', statutoryRequiredSide: 'PDP', isCompliant: true },
  { field: 'MRP Declaration', declaredSide: 'BACK', statutoryRequiredSide: 'ANY PANEL', isCompliant: true },
  { field: 'Unit Sale Price', declaredSide: 'BACK', statutoryRequiredSide: 'ANY PANEL', isCompliant: true },
  { field: 'Manufacturer Address', declaredSide: 'BACK', statutoryRequiredSide: 'ANY PANEL', isCompliant: true }
];

const sampleMetrics: ReadabilityMetrics = {
  numeralHeightMm: 4.2,
  requiredMinHeightMm: 4.0,
  isHeightCompliant: true,
  pdpAreaCm2: 320,
  contrastRatio: 9.4,
  isContrastCompliant: true,
  lightingGlareScore: 92
};

export const DatesReadabilityPage: React.FC = () => {
  const { id = 'insp-sample-01' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [dateData] = useState<DateDeclarationDetails>(sampleDate);
  const [placementData] = useState(samplePlacementItems);
  const [metricsData] = useState<ReadabilityMetrics>(sampleMetrics);

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
              Dates, Placement & Font Size Readability
            </h1>
            <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-700, #1d4ed8)', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
              F19 Optical & Dimension Metrics
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Computer vision evaluation of Principal Display Panel (PDP) placement, Table 1 numeral heights, and date stamps.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate(`/inspections/${id}/explain`)} className="btn btn-primary">
            Explain Findings & "Ask Why" (F20) →
          </button>
        </div>
      </div>

      <DateDeclarationCard data={dateData} />
      <ReadabilityFontSizePanel metrics={metricsData} />
      <PlacementAnalysisPanel items={placementData} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
        <button onClick={() => navigate(`/inspections/${id}/entity-care`)} className="btn btn-secondary">
          ← Back to Entity & Consumer Care (F18)
        </button>
        <button onClick={() => navigate(`/inspections/${id}/explain`)} className="btn btn-primary">
          Proceed to Explainable Findings (F20) →
        </button>
      </div>
    </div>
  );
};
