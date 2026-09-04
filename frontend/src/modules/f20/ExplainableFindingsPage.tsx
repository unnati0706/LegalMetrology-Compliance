import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AskWhyPanel } from './AskWhyPanel.js';
import { ExplanationDrawer } from './ExplanationDrawer.js';
import { ExplainableRuleFinding } from '../../shared/types/index.js';

const sampleFindings: ExplainableRuleFinding[] = [
  {
    ruleCode: 'PCR-2011-R06-MRP',
    ruleTitle: 'Maximum Retail Price Declaration',
    statutoryClause: 'Rule 6(1)(e)',
    verdict: 'PASS',
    verdictSummary: 'MRP is declared with mandatory Rupee symbol and tax inclusive text.',
    detailedLogic: [
      'OCR extracted string "MRP Rs 140.00 (INCL OF ALL TAXES)" with 96% optical confidence.',
      'Regex matcher verified standard currency symbol and numerical value 140.00.',
      'Mandatory phrase "(Incl. of all taxes)" detected on back panel.'
    ],
    statutoryText: 'The maximum retail price at which the commodity in packaged form may be sold to the consumer, inclusive of all taxes.',
    compoundingPenalty: 'Section 36(1) penalty of ₹25,000 for first offence.',
    remediationAdvice: 'No remediation required. Compliant with 2011 Rules and 2022 amendments.'
  },
  {
    ruleCode: 'PCR-2011-R06-USP',
    ruleTitle: 'Unit Sale Price Verification',
    statutoryClause: 'Rule 6(1)(e) Proviso',
    verdict: 'MANUAL_REVIEW',
    verdictSummary: 'Optical OCR extraction confidence is 62%, requiring human verification.',
    detailedLogic: [
      'Net weight 500g exceeds 100g threshold, making Unit Sale Price statutory.',
      'OCR parsed "USP: Rs 0.28 per g", but character segmentation on digit "8" has blur.',
      'Deterministic recalculation (₹140 / 500g = ₹0.28/g) confirms mathematical validity.'
    ],
    statutoryText: 'Unit sale price in rupees rounded off to the nearest two decimal places per g or ml.',
    compoundingPenalty: 'Notice for clarification or compounding under Rule 32.',
    remediationAdvice: 'Inspector manual verification confirms value. Approve in review queue.'
  },
  {
    ruleCode: 'PCR-2011-R07-FONT-SIZE',
    ruleTitle: 'Minimum Numeral Font Height on PDP',
    statutoryClause: 'Rule 7 & Table 1',
    verdict: 'FLAG',
    verdictSummary: 'Measured numeral height is 2.8mm, below the 4.0mm statutory minimum for 500g packages.',
    detailedLogic: [
      'Package net weight of 500g falls into Table 1 bracket "Greater than 200g up to 1kg".',
      'Prescribed statutory minimum height of numeral is 4.0mm.',
      'Optical measurement on PDP evidence shows bounding height of 2.8mm (30% deficiency).'
    ],
    statutoryText: 'The height of any numeral in the net quantity declaration shall not be less than the minimum height specified in Table 1.',
    compoundingPenalty: 'Compounding notice under Rule 32 read with Section 36(1).',
    remediationAdvice: 'Issue formal notice to manufacturer requiring artwork revision for PDP numeral heights.'
  }
];

export const ExplainableFindingsPage: React.FC = () => {
  const { id = 'insp-sample-01' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [findings] = useState<ExplainableRuleFinding[]>(sampleFindings);
  const [selectedFinding, setSelectedFinding] = useState<ExplainableRuleFinding | null>(null);

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
              Explainable Inspection Findings ("Ask Why?")
            </h1>
            <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-700, #1d4ed8)', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
              F20 Explainability Studio
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Inspect step-by-step logic, courtroom-ready legal references, and contributing evidence for every rule verdict.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate(`/inspections/${id}/heatmap`)} className="btn btn-primary">
            Compliance Heatmap (F21) →
          </button>
        </div>
      </div>

      <AskWhyPanel 
        findings={findings}
        onSelectFinding={(f) => setSelectedFinding(f)}
      />

      <ExplanationDrawer 
        finding={selectedFinding}
        onClose={() => setSelectedFinding(null)}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
        <button onClick={() => navigate(`/inspections/${id}/dates-readability`)} className="btn btn-secondary">
          ← Back to Dates & Readability (F19)
        </button>
        <button onClick={() => navigate(`/inspections/${id}/heatmap`)} className="btn btn-primary">
          Proceed to Compliance Heatmap (F21) →
        </button>
      </div>
    </div>
  );
};
