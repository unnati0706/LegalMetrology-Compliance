import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiClient, evaluateRealComplianceFromDeclarations } from '../../shared/api/client';
import { ManufacturerProduct, RemediationItem } from '../../shared/types';
import { SelfScanTrigger, SideImagesMap } from './SelfScanTrigger';
import { RemediationChecklist } from './RemediationChecklist';
import { ArrowLeft, GitCompare, Package, CheckCircle2, AlertTriangle, ShieldCheck, AlertCircle, Edit3, Save, Trash2, FileText, ExternalLink, Sparkles, UploadCloud, Camera, Eye, X } from 'lucide-react';

interface SavedScanRecord {
  id: string;
  scannedAt: string;
  scannedImage?: string;
  sideImages?: SideImagesMap;
  declarations: Record<string, string>;
  score: number;
  status: 'COMPLIANT' | 'FLAGGED';
  remediations: RemediationItem[];
}

const formatDeclarationKey = (key: string): string => {
  const map: Record<string, string> = {
    commodityName: 'PRODUCT / COMMODITY NAME',
    batchNo: 'BATCH / CODE',
    mfgDate: 'PACKED DATE (PKD/MFD)',
    expiryDate: 'EXPIRY DATE (EXP)',
    mrp: 'MAXIMUM RETAIL PRICE (MRP)',
    netQuantity: 'NET QUANTITY',
    unitSalePrice: 'UNIT SALE PRICE (USP)',
    manufacturerName: 'MANUFACTURER NAME & ADDRESS',
    consumerCare: 'CONSUMER CARE HELPLINE',
    countryOfOrigin: 'COUNTRY OF ORIGIN'
  };
  if (map[key]) return map[key];
  return key.replace(/([A-Z])/g, ' $1').toUpperCase().trim();
};

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
  const [showManualEditor, setShowManualEditor] = useState(false);

  const [viewingRecord, setViewingRecord] = useState<SavedScanRecord | null>(null);

  const [scanDetails, setScanDetails] = useState<{
    score: number;
    status: 'COMPLIANT' | 'FLAGGED';
    extractedDeclarations: Record<string, string>;
    ocrResult?: any;
    scannedImage?: string;
    sideImages?: SideImagesMap;
    scannedAt: string;
  } | null>(null);

  const [scanHistory, setScanHistory] = useState<SavedScanRecord[]>([]);

  const [manualDeclarations, setManualDeclarations] = useState<Record<string, string>>({
    commodityName: '',
    batchNo: '',
    mfgDate: '',
    expiryDate: '',
    mrp: '',
    netQuantity: '',
    unitSalePrice: '',
    manufacturerName: '',
    consumerCare: '',
    countryOfOrigin: ''
  });

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

        // Load saved scan history from LocalStorage
        const savedHistoryStr = localStorage.getItem(`lmc_scan_history_${prodId}`);
        if (savedHistoryStr) {
          try {
            const parsed = JSON.parse(savedHistoryStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setScanHistory(parsed);
              const latest = parsed[0];
              setScanDetails({
                score: latest.score,
                status: latest.status,
                extractedDeclarations: latest.declarations,
                scannedImage: latest.scannedImage,
                scannedAt: latest.scannedAt
              });
              setManualDeclarations(latest.declarations);
            } else {
              setScanHistory([]);
              setScanDetails(null);
            }
          } catch (e) {
            console.error('Failed to parse scan history:', e);
            setScanHistory([]);
            setScanDetails(null);
          }
        } else {
          setScanHistory([]);
          setScanDetails(null);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load product pre-compliance details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const saveToHistory = (newDetails: {
    score: number;
    status: 'COMPLIANT' | 'FLAGGED';
    declarations: Record<string, string>;
    scannedImage?: string;
    sideImages?: SideImagesMap;
    remediations: RemediationItem[];
  }) => {
    if (!product) return;
    const newRecord: SavedScanRecord = {
      id: `HIST-${Date.now()}`,
      scannedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      scannedImage: newDetails.scannedImage,
      sideImages: newDetails.sideImages,
      declarations: newDetails.declarations,
      score: newDetails.score,
      status: newDetails.status,
      remediations: newDetails.remediations
    };

    setScanHistory(prev => {
      const updated = [newRecord, ...prev];
      localStorage.setItem(`lmc_scan_history_${product.id}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteHistoryRecord = (recordId: string) => {
    if (!product) return;
    if (window.confirm('Are you sure you want to delete this scan record from history?')) {
      setScanHistory(prev => {
        const updated = prev.filter(r => r.id !== recordId);
        localStorage.setItem(`lmc_scan_history_${product.id}`, JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleRunScan = async (artworkId: string, capturedImageBase64?: string, sideImages?: SideImagesMap) => {
    if (!product) return;
    setIsScanning(true);
    setScanError(null);
    setScanSuccess(null);
    try {
      const result = await apiClient.runPreComplianceScan(product.id, artworkId, capturedImageBase64);
      setRemediations(result.remediations);
      setProduct(prev => prev ? {
        ...prev,
        complianceStatus: result.status,
        lastScanScore: result.score
      } : null);

      if (result.extractedDeclarations) {
        const imgToUse = capturedImageBase64 || product.artworks.find(a => a.id === artworkId)?.imageUrl || scanDetails?.scannedImage;
        const newDetails = {
          score: result.score,
          status: result.status,
          extractedDeclarations: result.extractedDeclarations,
          ocrResult: result.ocrResult,
          scannedImage: imgToUse,
          sideImages: sideImages || { front: imgToUse },
          scannedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        setScanDetails(newDetails);
        setManualDeclarations(result.extractedDeclarations);

        // Auto-save scan to history
        saveToHistory({
          score: result.score,
          status: result.status,
          declarations: result.extractedDeclarations,
          scannedImage: imgToUse,
          sideImages: sideImages || { front: imgToUse },
          remediations: result.remediations
        });
      }

      setScanSuccess(`Pre-compliance scan completed! Score: ${result.score}% (${result.status})`);
    } catch (err: any) {
      const msg = err.message || 'Error executing OCR pre-compliance scan';
      setScanError(`Scan failed: ${msg}`);
      alert(`Scan failed: ${msg}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualReevaluate = () => {
    if (!product) return;
    const evaluated = evaluateRealComplianceFromDeclarations(manualDeclarations);
    setRemediations(evaluated.remediations);
    setProduct(prev => prev ? {
      ...prev,
      complianceStatus: evaluated.status,
      lastScanScore: evaluated.score
    } : null);

    const newDetails = {
      score: evaluated.score,
      status: evaluated.status,
      extractedDeclarations: manualDeclarations,
      ocrResult: scanDetails?.ocrResult,
      scannedImage: scanDetails?.scannedImage,
      scannedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setScanDetails(newDetails);

    // Save manual evaluation to history
    saveToHistory({
      score: evaluated.score,
      status: evaluated.status,
      declarations: manualDeclarations,
      scannedImage: scanDetails?.scannedImage,
      remediations: evaluated.remediations
    });

    setScanSuccess(`Re-evaluated with real manual data & saved to history! Score: ${evaluated.score}% (${evaluated.status})`);
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

  const renderBadgeValue = (val?: string) => {
    if (!val || val === 'Not Detected' || val.includes('MISSING')) {
      return (
        <span style={{
          display: 'inline-block',
          padding: '0.2rem 0.5rem',
          borderRadius: '4px',
          background: '#fee2e2',
          color: '#dc2626',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginTop: '0.2rem'
        }}>
          Not Detected
        </span>
      );
    }
    return (
      <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '0.2rem', color: 'var(--color-text-primary)' }}>
        {val}
      </div>
    );
  };

  return (
    <div className="container" style={{ padding: '1.5rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Back button & Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
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

      {/* Packaged Commodity Photo Upload & Inspection Hub (When no scan has been run yet) */}
      {!scanDetails && (
        <div className="card" style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '2.5rem 2rem',
          marginBottom: '2rem',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          border: '1px solid #334155'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(56, 189, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            border: '1px solid rgba(56, 189, 248, 0.3)'
          }}>
            <Package size={36} color="#38bdf8" />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f8fafc' }}>
            Packaged Commodity Statutory Inspection Hub
          </h2>
          <p style={{ maxWidth: '650px', margin: '0 auto 1.5rem', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.5' }}>
            Under the Legal Metrology (Packaged Commodities) Rules 2011, all pre-packaged goods must display Mandatory Statutory Declarations. Upload or capture real packaging photos (Front PDP, Back Declaration Panel, Price/Batch stamp) to run live OCR extraction and compliance verification.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                if (fileInput) fileInput.click();
              }}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.5rem', fontWeight: 600, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <UploadCloud size={18} />
              📁 Upload Packaged Item Photo
            </button>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #334155', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', textAlign: 'left' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.2rem' }}>1. Upload Packaging Photo</div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Submit a clear photograph of your packaged commodity label or box.</div>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.2rem' }}>2. AI OCR Extraction</div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Extract Name, MRP, Net Qty, PKD, EXP, Batch & Manufacturer details.</div>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.2rem' }}>3. Statutory Legal Audit</div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Automated PCR Rule verification (Pass / Flagged) & Audit History.</div>
            </div>
          </div>
        </div>
      )}

      {/* Extracted Product Details & Declarations Panel */}
      {scanDetails && (
        <div className="card" style={{
          background: 'var(--color-surface, #ffffff)',
          border: `1px solid ${scanDetails.status === 'COMPLIANT' ? '#a7f3d0' : '#fecaca'}`,
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldCheck size={24} color={scanDetails.status === 'COMPLIANT' ? '#059669' : '#dc2626'} />
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                  Extracted Statutory Product Declarations & OCR Details
                </h2>
              </div>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                Verification results extracted via AI Optical Character Recognition (OCR) Engine at {scanDetails.scannedAt}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => setShowManualEditor(!showManualEditor)}
                className="btn btn-outline btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
              >
                <Edit3 size={15} />
                {showManualEditor ? 'Hide Manual Data Editor' : '✏️ Edit / Manual Input Real Data'}
              </button>

              <span style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '20px',
                fontWeight: 700,
                fontSize: '0.875rem',
                background: scanDetails.status === 'COMPLIANT' ? '#d1fae5' : '#fee2e2',
                color: scanDetails.status === 'COMPLIANT' ? '#065f46' : '#991b1b',
                border: `1px solid ${scanDetails.status === 'COMPLIANT' ? '#a7f3d0' : '#fecaca'}`
              }}>
                {scanDetails.score}% - {scanDetails.status}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: scanDetails.scannedImage ? '240px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
            {scanDetails.scannedImage && (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>
                  Scanned Label Image Preview:
                </div>
                <img
                  src={scanDetails.scannedImage}
                  alt="Scanned Product Label"
                  style={{ width: '100%', maxHeight: '240px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--color-border)', background: '#0f172a' }}
                />
              </div>
            )}

            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '0.85rem', background: 'var(--color-background)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                    📦 Product / Commodity Name
                  </div>
                  {renderBadgeValue(scanDetails.extractedDeclarations.commodityName)}
                </div>

                <div style={{ padding: '0.85rem', background: 'var(--color-background)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                    🏷️ Batch / Code
                  </div>
                  {renderBadgeValue(scanDetails.extractedDeclarations.batchNo)}
                </div>

                <div style={{ padding: '0.85rem', background: 'var(--color-background)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                    📅 Packed Date (PKD / MFD)
                  </div>
                  {renderBadgeValue(scanDetails.extractedDeclarations.mfgDate)}
                </div>

                <div style={{ padding: '0.85rem', background: 'var(--color-background)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                    ⏳ Expiry Date / Use By (EXP)
                  </div>
                  {renderBadgeValue(scanDetails.extractedDeclarations.expiryDate)}
                </div>

                <div style={{ padding: '0.85rem', background: 'var(--color-background)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                    💰 Maximum Retail Price (MRP)
                  </div>
                  {renderBadgeValue(scanDetails.extractedDeclarations.mrp)}
                </div>

                <div style={{ padding: '0.85rem', background: 'var(--color-background)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                    ⚖️ Net Quantity
                  </div>
                  {renderBadgeValue(scanDetails.extractedDeclarations.netQuantity)}
                </div>

                <div style={{ padding: '0.85rem', background: 'var(--color-background)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                    🏷️ Unit Sale Price (USP)
                  </div>
                  {renderBadgeValue(scanDetails.extractedDeclarations.unitSalePrice)}
                </div>

                <div style={{ padding: '0.85rem', background: 'var(--color-background)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                    🏭 Manufacturer Name & Address
                  </div>
                  {renderBadgeValue(scanDetails.extractedDeclarations.manufacturerName)}
                </div>

                <div style={{ padding: '0.85rem', background: 'var(--color-background)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                    📞 Consumer Care Helpline / Cell
                  </div>
                  {renderBadgeValue(scanDetails.extractedDeclarations.consumerCare)}
                </div>

                <div style={{ padding: '0.85rem', background: 'var(--color-background)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                    🌐 Country of Origin
                  </div>
                  {renderBadgeValue(scanDetails.extractedDeclarations.countryOfOrigin)}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Manual Data Entry Editor Form */}
          {showManualEditor && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px border-dashed var(--color-border)', background: 'var(--color-background)', padding: '1.25rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
                  <Edit3 size={18} />
                  Manually Input / Edit Real Product Statutory Data
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Type real values below to update workflow rules</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem' }}>Product / Commodity Name</label>
                  <input
                    type="text"
                    value={manualDeclarations.commodityName}
                    onChange={(e) => setManualDeclarations({ ...manualDeclarations, commodityName: e.target.value })}
                    placeholder="e.g. Priya Foods Chilli Powder 500g"
                    style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem' }}>Batch / Code (BN)</label>
                  <input
                    type="text"
                    value={manualDeclarations.batchNo}
                    onChange={(e) => setManualDeclarations({ ...manualDeclarations, batchNo: e.target.value })}
                    placeholder="e.g. KFF1941 A"
                    style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem' }}>Packed Date (PKD / MFD)</label>
                  <input
                    type="text"
                    value={manualDeclarations.mfgDate}
                    onChange={(e) => setManualDeclarations({ ...manualDeclarations, mfgDate: e.target.value })}
                    placeholder="e.g. 13/JUL/2026"
                    style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem' }}>Expiry Date / Use By (EXP)</label>
                  <input
                    type="text"
                    value={manualDeclarations.expiryDate}
                    onChange={(e) => setManualDeclarations({ ...manualDeclarations, expiryDate: e.target.value })}
                    placeholder="e.g. 09/APR/2027"
                    style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem' }}>Maximum Retail Price (MRP)</label>
                  <input
                    type="text"
                    value={manualDeclarations.mrp}
                    onChange={(e) => setManualDeclarations({ ...manualDeclarations, mrp: e.target.value })}
                    placeholder="e.g. ₹135.00 (Incl. of all taxes)"
                    style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem' }}>Net Quantity</label>
                  <input
                    type="text"
                    value={manualDeclarations.netQuantity}
                    onChange={(e) => setManualDeclarations({ ...manualDeclarations, netQuantity: e.target.value })}
                    placeholder="e.g. 500 g"
                    style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem' }}>Unit Sale Price (USP)</label>
                  <input
                    type="text"
                    value={manualDeclarations.unitSalePrice}
                    onChange={(e) => setManualDeclarations({ ...manualDeclarations, unitSalePrice: e.target.value })}
                    placeholder="e.g. ₹0.27 / g"
                    style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem' }}>Manufacturer Name & Address</label>
                  <input
                    type="text"
                    value={manualDeclarations.manufacturerName}
                    onChange={(e) => setManualDeclarations({ ...manualDeclarations, manufacturerName: e.target.value })}
                    placeholder="e.g. Priya Foods Ltd, Pune"
                    style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem' }}>Consumer Care Helpline / Cell</label>
                  <input
                    type="text"
                    value={manualDeclarations.consumerCare}
                    onChange={(e) => setManualDeclarations({ ...manualDeclarations, consumerCare: e.target.value })}
                    placeholder="e.g. care@priyafoods.in / 1800-200-1122"
                    style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem' }}>Country of Origin</label>
                  <input
                    type="text"
                    value={manualDeclarations.countryOfOrigin}
                    onChange={(e) => setManualDeclarations({ ...manualDeclarations, countryOfOrigin: e.target.value })}
                    placeholder="e.g. India"
                    style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  onClick={handleManualReevaluate}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
                >
                  <Save size={16} />
                  ⚡ Save & Re-evaluate Statutory Compliance with Real Data
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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

      {/* Saved Scanned Label History & Audit Records Gallery (With Delete Option) */}
      <div id="saved-history" style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '2px dashed var(--color-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📜 Saved Product Label Scans & Inspection History
            </h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              User audit history of uploaded photographs, OCR extraction records, and compliance evaluation results.
            </p>
          </div>

          <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0.3rem 0.75rem', borderRadius: '20px', background: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
            {scanHistory.length} Saved Records
          </span>
        </div>

        {scanHistory.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            No saved scan records in history yet. Upload or capture a label photo above to add to history.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {scanHistory.map(record => (
              <div
                key={record.id}
                className="card"
                style={{
                  background: 'var(--color-surface, #ffffff)',
                  border: `1px solid ${record.status === 'COMPLIANT' ? '#a7f3d0' : '#fecaca'}`,
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                      ID: {record.id} • {record.scannedAt}
                    </div>

                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: record.status === 'COMPLIANT' ? '#d1fae5' : '#fee2e2',
                      color: record.status === 'COMPLIANT' ? '#065f46' : '#991b1b'
                    }}>
                      {record.score}% {record.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', marginBottom: '0.85rem' }}>
                    {record.scannedImage && (
                      <img
                        src={record.scannedImage}
                        alt="Label Scan"
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                      />
                    )}

                    <div style={{ fontSize: '0.8125rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.2rem' }}>
                        {record.declarations.commodityName || 'Packaged Commodity'}
                      </div>
                      <div style={{ color: 'var(--color-text-secondary)' }}>
                        MRP: <strong>{record.declarations.mrp || 'Not Detected'}</strong>
                      </div>
                      <div style={{ color: 'var(--color-text-secondary)' }}>
                        PKD: {record.declarations.mfgDate} | EXP: {record.declarations.expiryDate}
                      </div>
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>
                        Batch: {record.declarations.batchNo}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)', marginTop: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <button
                    onClick={() => setViewingRecord(record)}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                  >
                    <Eye size={14} /> 👁️ View All 4 Angle Photos
                  </button>

                  <button
                    onClick={() => {
                      setScanDetails({
                        score: record.score,
                        status: record.status,
                        extractedDeclarations: record.declarations,
                        scannedImage: record.scannedImage,
                        sideImages: record.sideImages,
                        scannedAt: record.scannedAt
                      });
                      setRemediations(record.remediations);
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <Sparkles size={14} /> Load Details
                  </button>

                  <button
                    onClick={() => handleDeleteHistoryRecord(record.id)}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', borderColor: '#fecaca', color: '#dc2626' }}
                  >
                    <Trash2 size={14} /> Delete Record
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4-Angle Packaging Photo Audit Modal */}
      {viewingRecord && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--color-surface, #ffffff)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '850px',
            padding: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                  Statutory Compliance Evidence Audit
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Eye size={22} color="var(--color-primary)" />
                  4-Angle Packaging Photos & Declaration Breakdown
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.1rem' }}>
                  Record ID: <strong>{viewingRecord.id}</strong> | Scanned at: {viewingRecord.scannedAt}
                </div>
              </div>

              <button
                onClick={() => setViewingRecord(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: 'var(--color-text-secondary)' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* 4 Photos Grid */}
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
              📸 All 4 Captured Packaging Angle Photos (Front, Back, Top, Bottom):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.5rem', background: 'var(--color-background)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.3rem' }}>
                  📸 1. Front View (PDP)
                </div>
                <img
                  src={viewingRecord.sideImages?.front || viewingRecord.scannedImage}
                  alt="Front View"
                  style={{ width: '100%', height: '140px', objectFit: 'contain', borderRadius: '4px', background: '#0f172a' }}
                />
              </div>

              <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.5rem', background: 'var(--color-background)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.3rem' }}>
                  📝 2. Back Panel (Declarations)
                </div>
                <img
                  src={viewingRecord.sideImages?.back || viewingRecord.scannedImage}
                  alt="Back Panel"
                  style={{ width: '100%', height: '140px', objectFit: 'contain', borderRadius: '4px', background: '#0f172a' }}
                />
              </div>

              <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.5rem', background: 'var(--color-background)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.3rem' }}>
                  🏷️ 3. Top Panel (Batch/Dates)
                </div>
                <img
                  src={viewingRecord.sideImages?.top || viewingRecord.scannedImage}
                  alt="Top Panel"
                  style={{ width: '100%', height: '140px', objectFit: 'contain', borderRadius: '4px', background: '#0f172a' }}
                />
              </div>

              <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.5rem', background: 'var(--color-background)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.3rem' }}>
                  🌐 4. Bottom Panel (Barcode/Origin)
                </div>
                <img
                  src={viewingRecord.sideImages?.bottom || viewingRecord.scannedImage}
                  alt="Bottom Panel"
                  style={{ width: '100%', height: '140px', objectFit: 'contain', borderRadius: '4px', background: '#0f172a' }}
                />
              </div>
            </div>

            {/* Extracted Statutory Declarations Table */}
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
              📋 Extracted Statutory Legal Metrology Declarations:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {Object.entries(viewingRecord.declarations).map(([k, v]) => (
                <div key={k} style={{ padding: '0.6rem 0.75rem', background: 'var(--color-background)', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.8rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                    {formatDeclarationKey(k)}
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '0.1rem' }}>
                    {v || 'Not Detected'}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
              <button
                onClick={() => setViewingRecord(null)}
                className="btn btn-primary"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
