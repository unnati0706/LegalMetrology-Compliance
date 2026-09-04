import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../shared/api/client';
import { ManufacturerProduct } from '../../shared/types';
import { ProductComplianceHistoryTimeline } from './ProductComplianceHistoryTimeline';
import { ArrowLeft, ShieldCheck, History, GitCompare } from 'lucide-react';

export const ProductComplianceHistoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ManufacturerProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const prodId = id || 'prod-001';
        const prod = await apiClient.getProductById(prodId);
        setProduct(prod);
      } catch (err: any) {
        setError(err.message || 'Failed to load product history');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '2rem auto' }} />
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading Compliance Audit History...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3>Unable to load product history</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
          <Link to="/manufacturer/products" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
            Back to Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '1.5rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <button
            onClick={() => navigate(`/manufacturer/products/${product.id}/scan`)}
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}
          >
            <ArrowLeft size={16} /> Back to Pre-Scan
          </button>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={24} color="var(--color-primary)" />
            Statutory Compliance Audit Trail
          </h1>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            Product: <strong>{product.name}</strong> • SKU: {product.sku}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link
            to={`/manufacturer/products/${product.id}/rescan`}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <GitCompare size={16} />
            View Rescan Diff
          </Link>
        </div>
      </div>

      <ProductComplianceHistoryTimeline
        artworks={product.artworks}
      />
    </div>
  );
};
