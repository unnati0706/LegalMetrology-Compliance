import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../shared/api/client';
import { ManufacturerProduct, RemediationItem } from '../../shared/types';
import { SelfScanTrigger } from './SelfScanTrigger';
import { RemediationChecklist } from './RemediationChecklist';
import { ArrowLeft, GitCompare, Package, CheckCircle2, AlertTriangle, ShieldCheck, AlertCircle } from 'lucide-react';

export const PreComplianceScanPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ManufacturerProduct | null>(null);
  const [remediations, setRemediations] = useState<RemediationItem[]>([]);
  const [selectedArtworkId, setSelectedArtworkId] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const prodId = id || 'prod-001';
        const prod = await apiClient.getProductById(prodId);
        setProduct(prod);
        setSelectedArtworkId(prod.artworks[0]?.id || '');

        const rems = await apiClient.getRemediationItems(prodId);
        setRemediations(rems);
      } catch (err: any) {
        setError(err.message || 'Failed to load product pre-compliance details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleRunScan = async (artworkId: string) => {
    if (!product) return;
    setIsScanning(true);
    setScanError(null);
    setScanSuccess(null);
    try {
      const result = await apiClient.runPreComplianceScan(product.id, artworkId);
      setRemediations(result.remediations);
      setProduct(prev => prev ? {
        ...prev,
        complianceStatus: result.status,
        lastScanScore: result.score
      } : null);
      setScanSuccess(`Pre-compliance scan completed! Score: ${result.score}% (${result.status})`);
    } catch (err: any) {
      const msg = err.message || 'Error executing OCR pre-compliance scan';
      setScanError(`Scan failed: ${msg}`);
      alert(`Scan failed: ${msg}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleToggleResolved = async (itemId: string) => {
    if (!product) return;
    try {
      const updated = await apiClient.toggleRemediationItemResolved(product.id, itemId);
      setRemediations(prev => prev.map(item => item.id === itemId ? updated : item));
    } catch (err: any) {
      alert(`Failed to update item: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '2rem auto' }} />
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading Pre-Compliance Scan Engine...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="card" style={{ padding: '2rem', textAlign: 'center', borderColor: '#fecaca', background: '#fef2f2' }}>
          <AlertTriangle size={36} color="#dc2626" style={{ margin: '0 auto 0.5rem' }} />
          <h3 style={{ color: '#991b1b', margin: 0 }}>Error Loading Product</h3>
          <p style={{ color: '#7f1d1d', marginTop: '0.5rem' }}>{error || 'Product not found'}</p>
          <Link to="/manufacturer/products" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
            Return to Product Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '1.5rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Back button & Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <button
            onClick={() => navigate('/manufacturer/products')}
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}
          >
            <ArrowLeft size={16} /> Back to Library
          </button>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={26} color="var(--color-primary)" />
            Pre-Compliance Verification & Remediation
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            <span><Package size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {product.name}</span>
            <span>•</span>
            <span>SKU: {product.sku}</span>
            <span>•</span>
            <span>Current Artwork: <strong>{product.currentArtworkVersion}</strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link
            to={`/manufacturer/products/${product.id}/rescan`}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <GitCompare size={16} />
            Before/After Rescan View
          </Link>
        </div>
      </div>

      {/* Success / Error Banners */}
      {scanSuccess && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 1rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', marginBottom: '1.25rem', fontSize: '0.9375rem', fontWeight: 500 }}>
          <CheckCircle2 size={20} color="#059669" />
          {scanSuccess}
        </div>
      )}

      {scanError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', marginBottom: '1.25rem', fontSize: '0.9375rem', fontWeight: 500 }}>
          <AlertCircle size={20} color="#dc2626" />
          {scanError}
        </div>
      )}

      {/* Trigger & Scan Selector */}
      <SelfScanTrigger
        artworks={product.artworks}
        selectedArtworkId={selectedArtworkId}
        onSelectArtwork={setSelectedArtworkId}
        onRunScan={handleRunScan}
        isScanning={isScanning}
        lastScore={product.lastScanScore}
      />

      {/* Remediation Action Checklist */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>
            Mandatory Statutory Remediation Checklist
          </h2>
        </div>

        <RemediationChecklist
          items={remediations}
          onToggleResolved={handleToggleResolved}
        />
      </div>
    </div>
  );
};
