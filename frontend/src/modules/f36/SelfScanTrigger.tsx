import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, RefreshCw, CheckCircle2, AlertCircle, Camera, RotateCcw, X, Eye, Check } from 'lucide-react';
import { ArtworkVersion } from '../../shared/types';
import { formatDateIST } from '../../shared/utils/dateUtils.js';

export interface SideImagesMap {
  front?: string;
  back?: string;
  top?: string;
  bottom?: string;
}

interface SelfScanTriggerProps {
  artworks: ArtworkVersion[];
  selectedArtworkId?: string;
  onSelectArtwork: (artworkId: string) => void;
  onRunScan: (artworkId: string, capturedImageBase64?: string, sideImages?: SideImagesMap) => Promise<void>;
  isScanning: boolean;
  lastScore?: number;
}

const CAPTURE_STEPS: { key: keyof SideImagesMap; title: string; subtitle: string; icon: string }[] = [
  { key: 'front', title: '1. Front View (PDP)', subtitle: 'Capture Principal Display Panel with Product Name & Net Qty', icon: '📸' },
  { key: 'back', title: '2. Back Panel', subtitle: 'Capture Mandatory Declarations, MRP, Mfg Name & Consumer Care', icon: '📝' },
  { key: 'top', title: '3. Top Panel', subtitle: 'Capture Date Stamp, Batch No (BN), PKD & Expiry Date (EXP)', icon: '🏷️' },
  { key: 'bottom', title: '4. Bottom Panel', subtitle: 'Capture Barcode & Country of Origin Declarations', icon: '🌐' }
];

export const SelfScanTrigger: React.FC<SelfScanTriggerProps> = ({
  artworks,
  selectedArtworkId,
  onSelectArtwork,
  onRunScan,
  isScanning,
  lastScore
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    selectedArtworkId || (artworks[0]?.id || '')
  );
  const [showModal, setShowModal] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [sideImages, setSideImages] = useState<SideImagesMap>({});
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSimulatedMode, setIsSimulatedMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onSelectArtwork(id);
  };

  const startCamera = async () => {
    setCameraError(null);
    setIsSimulatedMode(false);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } else {
        setCameraError('Camera hardware access is unavailable in this environment.');
        setIsSimulatedMode(true);
      }
    } catch (err: any) {
      console.error('[Camera] Access error:', err);
      setCameraError('Live web camera stream not active. Switching to Guided Label Viewfinder Mode.');
      setIsSimulatedMode(true);
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
  };

  const handleOpenScanModal = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setShowModal(true);
    setCurrentStepIdx(0);
    setSideImages({});
  };

  useEffect(() => {
    if (showModal) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [showModal]);

  const generateSimulatedSvgSide = (sideKey: keyof SideImagesMap): string => {
    let content = '';
    if (sideKey === 'front') {
      content = `
        <text x="40" y="70" fill="#38bdf8" font-family="sans-serif" font-size="22" font-weight="bold">FRONT VIEW (PDP)</text>
        <text x="40" y="130" fill="#f8fafc" font-family="sans-serif" font-size="18" font-weight="bold">Priya Foods Premium Chilli Powder</text>
        <text x="40" y="170" fill="#cbd5e1" font-family="sans-serif" font-size="16">Net Quantity: 500 g</text>
        <text x="40" y="210" fill="#38bdf8" font-family="sans-serif" font-size="14">Category: Spices & Condiments</text>
        <rect x="40" y="250" width="200" height="40" fill="#020617" rx="6" stroke="#38bdf8" />
        <text x="60" y="275" fill="#10b981" font-family="sans-serif" font-size="14" font-weight="bold">100% PURE & NATURAL</text>
      `;
    } else if (sideKey === 'back') {
      content = `
        <text x="40" y="60" fill="#38bdf8" font-family="sans-serif" font-size="20" font-weight="bold">BACK PANEL STATUTORY DECLARATIONS</text>
        <text x="40" y="100" fill="#f8fafc" font-family="sans-serif" font-size="14">MRP: ₹ 135.00 (Incl. of all taxes)</text>
        <text x="40" y="130" fill="#cbd5e1" font-family="sans-serif" font-size="14">Unit Sale Price: ₹ 0.27 / g</text>
        <text x="40" y="160" fill="#cbd5e1" font-family="sans-serif" font-size="14">Manufacturer: Priya Foods Ltd, Sector 4, Pune - 411028</text>
        <text x="40" y="190" fill="#cbd5e1" font-family="sans-serif" font-size="14">Consumer Care: care@priyafoods.in / 1800-200-1122</text>
        <text x="40" y="220" fill="#cbd5e1" font-family="sans-serif" font-size="14">FSSAI Lic No: 11521034000123</text>
      `;
    } else if (sideKey === 'top') {
      content = `
        <text x="40" y="60" fill="#38bdf8" font-family="sans-serif" font-size="20" font-weight="bold">TOP PANEL (BATCH & DATES)</text>
        <text x="40" y="110" fill="#fbbf24" font-family="sans-serif" font-size="16" font-weight="bold">BATCH / CODE: W60808 B3</text>
        <text x="40" y="150" fill="#f8fafc" font-family="sans-serif" font-size="16">PACKED DATE (PKD): 08/08/2026</text>
        <text x="40" y="190" fill="#f8fafc" font-family="sans-serif" font-size="16">EXPIRY DATE (EXP): 05/05/2027</text>
        <text x="40" y="230" fill="#cbd5e1" font-family="sans-serif" font-size="14">BEST BEFORE 9 MONTHS FROM PACKAGING</text>
      `;
    } else {
      content = `
        <text x="40" y="60" fill="#38bdf8" font-family="sans-serif" font-size="20" font-weight="bold">BOTTOM PANEL (BARCODE & ORIGIN)</text>
        <text x="40" y="110" fill="#f8fafc" font-family="sans-serif" font-size="16">COUNTRY OF ORIGIN: INDIA</text>
        <rect x="40" y="140" width="280" height="80" fill="#ffffff" rx="4"/>
        <text x="50" y="190" fill="#000000" font-family="monospace" font-size="24" font-weight="bold">||||| | |||| || |||</text>
        <text x="60" y="210" fill="#000000" font-family="monospace" font-size="12">8 901234 567890</text>
      `;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="350" viewBox="0 0 600 350"><rect width="600" height="350" fill="#0f172a"/><rect x="15" y="15" width="570" height="320" fill="#1e293b" rx="8" stroke="#38bdf8" stroke-width="2"/>${content}<text x="40" y="305" fill="#38bdf8" font-family="sans-serif" font-size="12">LEGAL METROLOGY PCR 2011 COMPLIANT AUDIT</text></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  const handleCaptureCurrentSide = () => {
    const stepConfig = CAPTURE_STEPS[currentStepIdx];
    let capturedDataUri = '';

    if (isSimulatedMode || !videoRef.current || !canvasRef.current) {
      capturedDataUri = generateSimulatedSvgSide(stepConfig.key);
    } else {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        capturedDataUri = canvas.toDataURL('image/jpeg', 0.9);
      } else {
        capturedDataUri = generateSimulatedSvgSide(stepConfig.key);
      }
    }

    setSideImages(prev => {
      const updated = { ...prev, [stepConfig.key]: capturedDataUri };
      return updated;
    });

    if (currentStepIdx < 3) {
      setCurrentStepIdx(prev => prev + 1);
    }
  };

  const handleRetakeSpecificSide = (stepIndex: number) => {
    setCurrentStepIdx(stepIndex);
  };

  const handleCloseModal = () => {
    stopCamera();
    setShowModal(false);
    setSideImages({});
    setCurrentStepIdx(0);
    setCameraError(null);
    setIsSimulatedMode(false);
  };

  const handleSubmitAllSides = async () => {
    const mainImage = sideImages.front || sideImages.back || sideImages.top || sideImages.bottom;
    if (!mainImage) return;

    setIsSubmitting(true);
    try {
      console.log('[OCR] Submitting all 4 captured packaging sides for compliance scan...', sideImages);
      handleCloseModal();
      if (onRunScan) {
        await onRunScan(selectedId, mainImage, sideImages);
      }
    } catch (err: any) {
      console.error('[OCR] Live camera submission failed:', err);
      alert(`Failed to submit 4-side capture for OCR scan: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentArtwork = artworks.find(a => a.id === selectedId) || artworks[0];
  const allFourCaptured = Boolean(sideImages.front && sideImages.back && sideImages.top && sideImages.bottom);

  return (
    <div className="card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Sparkles size={20} color="var(--color-primary)" />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>AI Pre-Compliance Self-Scan</h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Guided 4-side packaging scan (Front, Back, Top, Bottom) against statutory Legal Metrology PCR 2011 rules.
          </p>
        </div>

        {lastScore !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', background: lastScore >= 90 ? '#ecfdf5' : '#fef2f2', borderRadius: '8px', border: `1px solid ${lastScore >= 90 ? '#a7f3d0' : '#fecaca'}` }}>
            {lastScore >= 90 ? <CheckCircle2 size={20} color="#059669" /> : <AlertCircle size={20} color="#dc2626" />}
            <div>
              <div style={{ fontSize: '0.75rem', color: lastScore >= 90 ? '#065f46' : '#991b1b', fontWeight: 500 }}>Previous Scan Score</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: lastScore >= 90 ? '#047857' : '#b91c1c' }}>{lastScore}%</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem', alignItems: 'center' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>
            Select Artwork Version:
          </label>
          <select
            value={selectedId}
            onChange={(e) => handleSelect(e.target.value)}
            disabled={isScanning}
            className="input-select"
            style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-background)', fontSize: '0.875rem' }}
          >
            {artworks.map(a => (
              <option key={a.id} value={a.id}>
                {a.version} - {a.packageSide} ({a.status})
              </option>
            ))}
          </select>
        </div>

        {currentArtwork && (
          <div style={{ padding: '0.625rem 0.875rem', background: 'var(--color-background)', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.8125rem' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Specs: </span>
            <strong>{currentArtwork.dimensions}</strong> | {currentArtwork.dpi} DPI
            <div style={{ color: 'var(--color-text-secondary)', marginTop: '0.2rem', fontSize: '0.75rem' }}>
              Uploaded: {formatDateIST(currentArtwork.uploadedAt)}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleOpenScanModal}
            disabled={isScanning}
            className="btn btn-primary"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: isScanning ? 'not-allowed' : 'pointer'
            }}
          >
            {isScanning ? (
              <>
                <RefreshCw size={18} className="spin" />
                Scanning...
              </>
            ) : (
              <>
                <Camera size={18} />
                📸 Live 4-Side Camera Scan
              </>
            )}
          </button>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (evt) => {
                const base64 = evt.target?.result as string;
                if (base64 && onRunScan) {
                  onRunScan(selectedId, base64, { front: base64 });
                }
              };
              reader.readAsDataURL(file);
            }}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Hidden Canvas element for canvas drawing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* 4-Side Camera Guided Scan Modal */}
      {showModal && (
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
            maxWidth: '650px',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Guided Packaging Inspection (4 Sides)
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Camera size={22} color="var(--color-primary)" />
                  4-Side Live Packaging Photo Capture
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: 'var(--color-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Stepper Header Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {CAPTURES_MAP_LIST(sideImages, currentStepIdx, handleRetakeSpecificSide)}
            </div>

            {/* Current Side Instructions Banner */}
            {!allFourCaptured && (
              <div style={{ padding: '0.75rem 1rem', background: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '8px', marginBottom: '1rem', color: '#0369a1', fontSize: '0.875rem' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>{CAPTURE_STEPS[currentStepIdx].icon}</span>
                  <span>{CAPTURE_STEPS[currentStepIdx].title}</span>
                </div>
                <div>{CAPTURE_STEPS[currentStepIdx].subtitle}</div>
              </div>
            )}

            {/* Live Camera Stream / Viewfinder Box */}
            {!allFourCaptured && (
              <div style={{ position: 'relative', background: '#0f172a', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.25rem', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isSimulatedMode ? (
                  <img
                    src={generateSimulatedSvgSide(CAPTURE_STEPS[currentStepIdx].key)}
                    alt="Simulated Viewfinder"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}

                {/* Packaging Overlay Frame */}
                <div style={{
                  position: 'absolute',
                  top: '12%',
                  left: '12%',
                  right: '12%',
                  bottom: '12%',
                  border: '2px dashed #38bdf8',
                  borderRadius: '8px',
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                }}>
                  Align {CAPTURE_STEPS[currentStepIdx].title} Inside Box
                </div>
              </div>
            )}

            {/* All 4 Sides Captured Summary Display */}
            {allFourCaptured && (
              <div style={{ padding: '1rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 700, color: '#065f46', fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={20} color="#059669" />
                  All 4 Packaging Sides Captured Successfully!
                </div>
                <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#047857' }}>
                  Front (PDP), Back Declarations, Top Date Stamp, and Bottom Barcode photos are captured and ready for combined OCR rule analysis.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                  {CAPTURE_STEPS.map(step => (
                    <div key={step.key} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#065f46', marginBottom: '0.25rem' }}>
                        {step.title.split('. ')[1]}
                      </div>
                      <img
                        src={sideImages[step.key]}
                        alt={step.title}
                        style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #a7f3d0' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Control Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
              <button
                onClick={handleCloseModal}
                className="btn btn-outline"
                disabled={isSubmitting}
              >
                Cancel
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {!allFourCaptured && (
                  <button
                    onClick={handleCaptureCurrentSide}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
                  >
                    <Camera size={18} />
                    Capture {CAPTURE_STEPS[currentStepIdx].title.split('. ')[1]} ({currentStepIdx + 1}/4)
                  </button>
                )}

                {allFourCaptured && (
                  <button
                    onClick={handleSubmitAllSides}
                    className="btn btn-primary"
                    disabled={isSubmitting}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, padding: '0.75rem 1.25rem' }}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={18} className="spin" />
                        Analyzing All 4 Sides...
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        ⚡ Submit All 4 Sides for Inspection
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CAPTURES_MAP_LIST = (sideImages: SideImagesMap, currentStepIdx: number, onRetake: (idx: number) => void) => {
  return CAPTURE_STEPS.map((step, idx) => {
    const isCaptured = Boolean(sideImages[step.key]);
    const isCurrent = idx === currentStepIdx;

    return (
      <div
        key={step.key}
        onClick={() => isCaptured && onRetake(idx)}
        style={{
          padding: '0.5rem',
          borderRadius: '6px',
          background: isCurrent ? '#38bdf8' : isCaptured ? '#10b981' : '#f1f5f9',
          color: isCurrent || isCaptured ? '#ffffff' : '#64748b',
          textAlign: 'center',
          fontSize: '0.75rem',
          fontWeight: 700,
          cursor: isCaptured ? 'pointer' : 'default',
          border: isCurrent ? '2px solid #0284c7' : '1px solid transparent'
        }}
      >
        <div>{step.icon} {step.title.split('. ')[1]}</div>
        <div style={{ fontSize: '0.65rem', marginTop: '0.1rem' }}>
          {isCaptured ? '✓ Captured' : isCurrent ? '● Active' : 'Waiting'}
        </div>
      </div>
    );
  });
};
