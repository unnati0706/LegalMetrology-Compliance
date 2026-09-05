import React, { useState, useEffect } from 'react';
import { apiClient } from '../../shared/api/client.js';
import { ManufacturerKPIs, ManufacturerProduct } from '../../shared/types/index.js';
import { ManufacturerKPICards } from './ManufacturerKPICards.js';
import { ProductComplianceSummary } from './ProductComplianceSummary.js';
import { Building2, RefreshCw, AlertCircle, PlusCircle, Scan, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ManufacturerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<ManufacturerKPIs | null>(null);
  const [products, setProducts] = useState<ManufacturerProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDashboard = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [kpiRes, prodRes] = await Promise.all([
        apiClient.getManufacturerKPIs(),
        apiClient.getManufacturerProducts()
      ]);
      setKpis(kpiRes);
      setProducts(prodRes);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load manufacturer dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.25) 0%, rgba(15, 23, 42, 0.8) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a5b4fc', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <Building2 size={16} /> Manufacturer Pre-Compliance Portal
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.25rem 0', color: '#ffffff' }}>
            Priya Foods Ltd • Self-Compliance Command
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '0.875rem', margin: 0, maxWidth: '650px' }}>
            Manufacturer pre-print readiness dashboard — high-level compliance scorecards, critical packaging warnings, and active remediation action items under Legal Metrology Rules, 2011.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={loadDashboard}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} />
          </button>

          <button
            type="button"
            onClick={() => navigate('/manufacturer/products')}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <PlusCircle size={15} />
            <span>Upload New Packaging Artwork</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.875rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
          <button type="button" onClick={loadDashboard} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="skeleton" style={{ height: '110px', borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-md)' }} />
        </div>
      ) : (
        <>
          {kpis && <ManufacturerKPICards kpis={kpis} />}
          <ProductComplianceSummary products={products} />
        </>
      )}
    </div>
  );
};
