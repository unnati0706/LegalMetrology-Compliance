import React from 'react';
import { ManufacturerProduct } from '../../shared/types/index.js';
import { ShieldCheck, AlertCircle, Clock, ArrowUpRight, Scan, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProductComplianceSummaryProps {
  products: ManufacturerProduct[];
}

export const ProductComplianceSummary: React.FC<ProductComplianceSummaryProps> = ({ products }) => {
  const navigate = useNavigate();

  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
            Pre-Market Compliance Status & Remediation Summary
          </h3>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Self-screening verification against Legal Metrology (Packaged Commodities) Rules, 2011
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/manufacturer/products')}
          className="btn btn-secondary"
          style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
        >
          <span>View Full Catalog</span>
          <ArrowUpRight size={13} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {products.map((p) => {
          const isCompliant = p.complianceStatus === 'COMPLIANT';
          const isFlagged = p.complianceStatus === 'FLAGGED';

          return (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                gap: '1rem',
                flexWrap: 'wrap'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  {p.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  SKU: {p.sku} • {p.netQuantity} • MRP: {p.mrp} • Current Artwork: <strong>{p.currentArtworkVersion}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: isCompliant ? 'rgba(34, 197, 94, 0.15)' : isFlagged ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: isCompliant ? '#4ade80' : isFlagged ? '#f87171' : '#fbbf24'
                }}>
                  {isCompliant ? <ShieldCheck size={13} /> : isFlagged ? <AlertCircle size={13} /> : <Clock size={13} />}
                  <span>{isCompliant ? 'COMPLIANT' : isFlagged ? 'NEEDS REMEDIATION' : 'PENDING SCAN'}</span>
                </span>

                <button
                  type="button"
                  onClick={() => navigate(`/manufacturer/products/${p.id}`)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                >
                  Manage Artwork
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
