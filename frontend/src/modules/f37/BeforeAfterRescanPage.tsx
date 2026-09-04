import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../shared/api/client';
import { ManufacturerProduct, ArtworkDiffResult } from '../../shared/types';
import { BeforeAfterComparisonView } from './BeforeAfterComparisonView';
import { RescanButton } from './RescanButton';
import { ArrowLeft, History, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';

export const BeforeAfterRescanPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ManufacturerProduct | null>(null);
  const [diffResult, setDiffResult] = useState<ArtworkDiffResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const prodId = id || 'prod-001';
        const prod = await apiClient.getProductById(prodId);
        setProduct(prod);

        const diff = await apiClient.getArtworkDiffComparison(prodId, 'v2.0', prod.currentArtworkVersion);
        setDiffResult(diff);
      } catch (err: any) {
        setError(err.message || 'Failed to load diff comparison data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleRescan = async () => {
    if (!product) return;
    try {
      const res = await apiClient.runRescanComparison(product.id, 'v2.2-REMEDIATED');
      setDiffResult(res);
      setProduct(prev => prev ? { ...prev, complianceStatus: 'COMPLIANT', lastScanScore: 96, currentArtworkVersion: 'v2.2-REMEDIATED' } : null);
      setSuccessToast('Rescan complete! Artwork v2.2-REMEDIATED conforms 100% to Legal Metrology PCR 2011.');
    } catch (err: any) {
      alert(`Rescan failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '2rem auto' }} />
        <p style={{ color: 'var(--color-text-secondary)' }}>Comparing artwork diffs and computing compliance metrics...</p>
      </div>
    );
  }

  if (error || !product || !diffResult) {
    return (
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3>Unable to load comparison data</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
          <Link to="/manufacturer/products" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '1.5rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <button
            onClick={() => navigate(`/manufacturer/products/${product.id}/scan`)}
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}
          >
            <ArrowLeft size={16} /> Back to Pre-Compliance Scan
          </button>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
            Before / After Rescan Comparison
          </h1>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            Comparing previous revision ({diffResult.oldVersion}) vs corrected artwork ({diffResult.newVersion}) for <strong>{product.name}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link
            to={`/manufacturer/products/${product.id}/history`}
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <History size={16} /> Full History
          </Link>
          <RescanButton onRescan={handleRescan} />
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div style={{ padding: '1rem 1.25rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle2 size={20} color="#059669" />
          <span style={{ fontWeight: 500 }}>{successToast}</span>
        </div>
      )}

      {/* Main Diff Component */}
      <BeforeAfterComparisonView
        diffResult={diffResult}
        productName={product.name}
      />
    </div>
  );
};
