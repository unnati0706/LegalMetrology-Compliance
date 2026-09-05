import React, { useState } from 'react';
import { Camera, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { FramingOverlayGuide } from '../f10/FramingOverlayGuide';
import { QualityScoreBadge } from '../f10/QualityScoreBadge';
import { BlurGlareWarning } from '../f10/BlurGlareWarning';

interface CameraCaptureProps {
  currentSide: string;
  onCapture: (capturedData: { side: string; url: string; size: string; qualityScore: number }) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ currentSide, onCapture }) => {
  const [isSimulatingCapture, setIsSimulatingCapture] = useState(false);
  const [lastQuality, setLastQuality] = useState<number | null>(null);

  // Mock capture action
  const handleSnap = () => {
    setIsSimulatingCapture(true);
    setTimeout(() => {
      setIsSimulatingCapture(false);
      const score = Math.floor(Math.random() * 15 + 85); // 85 - 100
      setLastQuality(score);

      const sampleImages: Record<string, string> = {
        'PDP (Front)': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=60',
        'Back Panel': 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&auto=format&fit=crop&q=60',
        'Top Cap / Lid': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=60',
      };

      onCapture({
        side: currentSide,
        url: sampleImages[currentSide] || 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&auto=format&fit=crop&q=60',
        size: '3.4 MB',
        qualityScore: score
      });
    }, 600);
  };

  return (
    <div
      className="card"
      style={{
        background: '#0f172a',
        borderRadius: '16px',
        padding: '1.5rem',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Viewfinder simulator */}
      <div
        style={{
          position: 'relative',
          height: '320px',
          background: '#1e293b',
          borderRadius: '12px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <FramingOverlayGuide sideLabel={currentSide} />

        <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', color: '#fbbf24', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
          <ShieldCheck size={13} /> Simulated Viewfinder (Demo Stream)
        </div>

        <img
          src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=60"
          alt="Camera Live Viewfinder"
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
        />
      </div>

      {/* Real-time CV metrics & warnings */}
      <div style={{ marginTop: '1rem' }}>
        <BlurGlareWarning hasBlur={false} hasGlare={false} skewAngle={1.2} />
      </div>

      {/* Trigger button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
        <button
          type="button"
          onClick={handleSnap}
          disabled={isSimulatingCapture}
          className="btn btn-primary"
          style={{
            borderRadius: '999px',
            padding: '0.875rem 2rem',
            fontSize: '1rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 0 20px rgba(79, 70, 229, 0.6)'
          }}
        >
          {isSimulatingCapture ? (
            <>
              <RefreshCw size={18} className="spin" /> Capturing & Analyzing Frame...
            </>
          ) : (
            <>
              <Camera size={20} /> Capture {currentSide}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
