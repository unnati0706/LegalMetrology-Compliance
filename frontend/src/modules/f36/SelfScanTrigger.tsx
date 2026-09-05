import React, { useState, useRef, useEffect } from 'react';
import { Play, Sparkles, RefreshCw, CheckCircle2, AlertCircle, Camera, RotateCcw, UploadCloud, X, Eye } from 'lucide-react';
import axios from 'axios';
import { ArtworkVersion } from '../../shared/types';
import { BASE_URL } from '../../shared/api/client';
import { formatDateIST } from '../../shared/utils/dateUtils.js';

interface SelfScanTriggerProps {
  artworks: ArtworkVersion[];
  selectedArtworkId?: string;
  onSelectArtwork: (artworkId: string) => void;
  onRunScan: (artworkId: string) => Promise<void>;
  isScanning: boolean;
  lastScore?: number;
}

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
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSimulatedMode, setIsSimulatedMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onSelectArtwork(id);
  };

  const startCamera = async () => {
    setCameraError(null);
    setCapturedImage(null);
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
      setCameraError('Live web camera stream not active. Switching to Simulated Label Viewfinder (Demo Mode).');
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
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert('Scan Started!');
    }
    setShowModal(true);
    if (onRunScan) {
      onRunScan(selectedId);
    }
  };

  useEffect(() => {
    if (showModal && !capturedImage) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [showModal]);

  const handleCapturePhoto = () => {
    if (isSimulatedMode) {
      setCapturedImage('https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&auto=format&fit=crop&q=60');
      return;
    }

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleRetakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleCloseModal = () => {
    stopCamera();
    setShowModal(false);
    setCapturedImage(null);
    setCameraError(null);
    setIsSimulatedMode(false);
  };

  const handleSubmitCapturedImage = async () => {
    if (!capturedImage) return;
    setIsSubmitting(true);
    try {
      const activeOcrEndpoint = `${BASE_URL}/b14`;
      console.log(`[OCR] Submitting camera capture to ${activeOcrEndpoint}...`);
      const response = await axios.post(activeOcrEndpoint, {
        evidenceId: selectedId || 'EVID-CAMERA-CAP',
        imageSource: capturedImage,
      });
      console.log('[OCR] Live camera scan response received:', response.data);
      handleCloseModal();
      if (onRunScan) {
        await onRunScan(selectedId);
      }
    } catch (err) {
      console.error('[OCR] Live camera submission failed:', err);
      alert('Failed to submit camera capture to backend OCR service. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentArtwork = artworks.find(a => a.id === selectedId) || artworks[0];

  return (
    <div className="card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Sparkles size={20} color="var(--color-primary)" />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>AI Pre-Compliance Self-Scan</h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Run pre-release verification against statutory Legal Metrology PCR 2011 rules before printing.
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem', alignItems: 'center' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>
            Select Artwork Version for Scan:
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

        <div>
          <button
            onClick={handleOpenScanModal}
            disabled={isScanning}
            className="btn btn-primary"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              fontWeight: 600,
              fontSize: '0.9375rem',
              cursor: isScanning ? 'not-allowed' : 'pointer'
            }}
          >
            {isScanning ? (
              <>
                <RefreshCw size={18} className="spin" />
                Scanning Declarations...
              </>
            ) : (
              <>
                <Play size={18} />
                Run Pre-Compliance Scan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hidden Canvas for Frame Capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Live Camera Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--color-surface, #ffffff)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '560px',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Camera size={22} color="var(--color-primary)" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                  {isSimulatedMode ? 'Simulated Label Camera Feed (Demo)' : 'Live Camera Label Capture'}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: 'var(--color-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {capturedImage ? (
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                  Captured Label Photo Preview:
                </div>
                <img
                  src={capturedImage}
                  alt="Captured Label"
                  style={{ width: '100%', maxHeight: '320px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                />
              </div>
            ) : isSimulatedMode ? (
              <div style={{ position: 'relative', background: '#0f172a', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src="https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&auto=format&fit=crop&q=60"
                  alt="Simulated Label Viewfinder"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                />
                {/* Framing Box Guide */}
                <div style={{
                  position: 'absolute',
                  top: '15%',
                  left: '15%',
                  right: '15%',
                  bottom: '15%',
                  border: '2px dashed #fbbf24',
                  borderRadius: '8px',
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fbbf24',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  Align PDP Declarations Inside Frame
                </div>
                <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', padding: '0.2rem 0.6rem', borderRadius: '4px', color: '#fbbf24', fontSize: '0.7rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Eye size={12} /> Demo Simulated Mode
                </div>
              </div>
            ) : (
              <div style={{ position: 'relative', background: '#000', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem', textAlign: 'center' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '15%',
                  left: '15%',
                  right: '15%',
                  bottom: '15%',
                  border: '2px dashed #3b82f6',
                  borderRadius: '8px',
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  Align PDP Declarations Inside Frame
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              {!capturedImage && (
                <button
                  onClick={handleCapturePhoto}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
                >
                  <Camera size={18} />
                  Capture Photo
                </button>
              )}

              {capturedImage && (
                <>
                  <button
                    onClick={handleRetakePhoto}
                    className="btn btn-outline"
                    disabled={isSubmitting}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <RotateCcw size={18} />
                    Retake
                  </button>
                  <button
                    onClick={handleSubmitCapturedImage}
                    className="btn btn-primary"
                    disabled={isSubmitting}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={18} className="spin" />
                        Submitting OCR...
                      </>
                    ) : (
                      <>
                        <UploadCloud size={18} />
                        Submit for OCR Scan
                      </>
                    )}
                  </button>
                </>
              )}

              <button
                onClick={handleCloseModal}
                className="btn btn-outline"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
