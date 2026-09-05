import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CompletenessChecklist } from './CompletenessChecklist.js';
import { CompletenessItem } from '../../shared/types/index.js';

const initialItems: CompletenessItem[] = [
  {
    field: 'mrp',
    label: 'Maximum Retail Price (MRP)',
    legalClause: 'Rule 6(1)(e)',
    isRequired: true,
    status: 'PRESENT',
    extractedValue: '₹140.00 (Incl. of all taxes)',
    formatCompliant: true,
    formatRemarks: 'Includes ₹ symbol and tax inclusion text.'
  },
  {
    field: 'unit_sale_price',
    label: 'Unit Sale Price (USP)',
    legalClause: 'Rule 6(1)(e) Proviso',
    isRequired: true,
    status: 'PRESENT',
    extractedValue: '₹0.28 / g',
    formatCompliant: true,
    formatRemarks: 'Rounded to two decimals per gram.'
  },
  {
    field: 'net_quantity',
    label: 'Net Quantity Declaration',
    legalClause: 'Rule 6(1)(h) & Sched II',
    isRequired: true,
    status: 'PRESENT',
    extractedValue: '500 g',
    formatCompliant: true,
    formatRemarks: 'Standard SI metric unit (g).'
  },
  {
    field: 'mfg_identity',
    label: 'Manufacturer / Packer Name & Postal Address',
    legalClause: 'Rule 6(1)(a)/(aa)',
    isRequired: true,
    status: 'PRESENT',
    extractedValue: 'Priya Foods Ltd, Sector 4, Pune - 411028',
    formatCompliant: true,
    formatRemarks: 'Complete address with 6-digit PIN.'
  },
  {
    field: 'date_of_mfg',
    label: 'Month & Year of Manufacture',
    legalClause: 'Rule 6(1)(d)',
    isRequired: true,
    status: 'PRESENT',
    extractedValue: '08/2026',
    formatCompliant: true,
    formatRemarks: 'MM/YYYY format valid.'
  },
  {
    field: 'consumer_care',
    label: 'Consumer Care Contact Details',
    legalClause: 'Rule 6(1)(n)',
    isRequired: true,
    status: 'PRESENT',
    extractedValue: 'care@priyafoods.in, 1800-200-1122',
    formatCompliant: true,
    formatRemarks: 'Includes toll-free phone and email.'
  },
  {
    field: 'country_of_origin',
    label: 'Country of Origin (For Imported Goods)',
    legalClause: 'Rule 6(1)(j)',
    isRequired: false,
    status: 'PRESENT',
    extractedValue: 'Made in India',
    formatCompliant: true,
    formatRemarks: 'Explicit country of origin declared.'
  }
];

export const CompletenessPage: React.FC = () => {
  const { id = 'insp-sample-01' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [items, setItems] = useState<CompletenessItem[]>(initialItems);

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
              Declaration Completeness & Format Audit
            </h1>
            <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-700, #1d4ed8)', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
              Completeness Engine
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Automated verification of mandatory statutory fields and syntax formats required under Rule 6(1) of PCR 2011.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate(`/inspections/${id}/mrp-quantity`)} className="btn btn-primary">
            Inspect MRP & Quantity →
          </button>
        </div>
      </div>

      <CompletenessChecklist items={items} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
        <button onClick={() => navigate(`/inspections/${id}/results`)} className="btn btn-secondary">
          ← Back to Compliance Results
        </button>
        <button onClick={() => navigate(`/inspections/${id}/mrp-quantity`)} className="btn btn-primary">
          Proceed to MRP & Net Quantity Details →
        </button>
      </div>
    </div>
  );
};
