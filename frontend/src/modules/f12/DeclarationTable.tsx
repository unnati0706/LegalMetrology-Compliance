import React from 'react';
import { Declaration } from '../../shared/types/index.js';
import { ConfidenceBadge } from './ConfidenceBadge.js';
import { EditableDeclarationField } from './EditableDeclarationField.js';
import { SourceEvidenceThumbnail } from './SourceEvidenceThumbnail.js';

interface DeclarationTableProps {
  declarations: Declaration[];
  onUpdateDeclaration: (id: string, newValue: string) => Promise<void> | void;
  onSelectCrop?: (declaration: Declaration) => void;
}

const FIELD_LABELS: Record<string, string> = {
  mrp: 'Maximum Retail Price (MRP)',
  net_quantity: 'Net Quantity',
  unit_sale_price: 'Unit Sale Price (USP)',
  manufacturer_name_address: 'Manufacturer / Packer Name & Address',
  date_of_mfg: 'Month & Year of Manufacture',
  consumer_care: 'Consumer Care Contact',
  country_of_origin: 'Country of Origin',
  generic_name: 'Common / Generic Name of Commodity'
};

export const DeclarationTable: React.FC<DeclarationTableProps> = ({
  declarations,
  onUpdateDeclaration,
  onSelectCrop
}) => {
  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '1.5rem' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--surface-border, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>
          Extracted Mandatory Declarations ({declarations.length})
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Rule 6(1) PCR 2011 Compliance Set
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-subtle, #f8fafc)', borderBottom: '1px solid var(--surface-border, #e2e8f0)' }}>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Mandatory Field</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Extracted Value</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Confidence</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Source Crop</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {declarations.map((dec) => {
              const label = FIELD_LABELS[dec.field] || dec.field.replace(/_/g, ' ').toUpperCase();
              return (
                <tr 
                  key={dec.id} 
                  style={{ borderBottom: '1px solid var(--surface-border, #e2e8f0)', transition: 'background-color 0.15s ease' }}
                >
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)', width: '25%' }}>
                    {label}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', width: '35%' }}>
                    <EditableDeclarationField 
                      declaration={dec} 
                      onSave={onUpdateDeclaration} 
                    />
                  </td>
                  <td style={{ padding: '0.85rem 1rem', width: '15%' }}>
                    <ConfidenceBadge confidence={dec.confidence} />
                  </td>
                  <td style={{ padding: '0.85rem 1rem', width: '15%' }}>
                    <SourceEvidenceThumbnail 
                      packageSide={dec.packageSide}
                      boundingBox={dec.boundingBox}
                      fieldLabel={label}
                      onClick={() => onSelectCrop && onSelectCrop(dec)}
                    />
                  </td>
                  <td style={{ padding: '0.85rem 1rem', width: '10%' }}>
                    <span 
                      style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 600, 
                        padding: '2px 8px', 
                        borderRadius: '12px',
                        backgroundColor: dec.status === 'VERIFIED' ? 'rgba(16, 185, 129, 0.1)' :
                                         dec.status === 'CORRECTED' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: dec.status === 'VERIFIED' ? 'var(--success-700, #047857)' :
                               dec.status === 'CORRECTED' ? 'var(--primary-700, #1d4ed8)' : 'var(--warning-700, #b45309)'
                      }}
                    >
                      {dec.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
