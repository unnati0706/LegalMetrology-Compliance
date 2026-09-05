import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CameraCapture } from './CameraCapture';
import { MultiImageUploader } from './MultiImageUploader';
import { ImageSideTagger, PACKAGE_SIDES } from './ImageSideTagger';
import { UploadProgressList, CapturedPhoto } from './UploadProgressList';
import { ArrowLeft, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const ImageCapturePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const inspectionId = id || 'insp-new-01';
  const [currentSide, setCurrentSide] = useState<string>('PDP (Front)');
  const [photos, setPhotos] = useState<CapturedPhoto[]>([
    {
      id: 'p-1',
      side: 'PDP (Front)',
      url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=60',
      size: '3.8 MB',
      qualityScore: 94,
      timestamp: new Date().toISOString()
    }
  ]);

  const handleCapture = (data: { side: string; url: string; size: string; qualityScore: number }) => {
    const newPhoto: CapturedPhoto = {
      id: `p-${Date.now()}`,
      ...data,
      timestamp: new Date().toISOString()
    };
    setPhotos(prev => [newPhoto, ...prev.filter(p => p.side !== data.side)]);

    // Automatically advance to the next recommended side tag
    const currentIndex = PACKAGE_SIDES.indexOf(currentSide);
    if (currentIndex >= 0 && currentIndex < PACKAGE_SIDES.length - 1) {
      setCurrentSide(PACKAGE_SIDES[currentIndex + 1]);
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const handleProceedToProcessing = () => {
    navigate(`/inspections/${inspectionId}/heatmap`);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <button
            onClick={() => navigate('/inspections/new')}
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}
          >
            <ArrowLeft size={16} /> Back to Metadata
          </button>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
            Multi-Side Visual Evidence Capture
          </h1>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
            Inspection Session ID: <strong>#{inspectionId}</strong>
          </div>
        </div>

        <button
          onClick={handleProceedToProcessing}
          disabled={photos.length === 0}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.625rem 1.25rem', fontWeight: 700 }}
        >
          <Sparkles size={18} />
          <span>Run AI OCR & Rule Evaluation ({photos.length} Faces)</span>
        </button>
      </div>

      {/* Side Tag Selection Bar */}
      <ImageSideTagger
        currentSide={currentSide}
        onSelectSide={setCurrentSide}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        {/* Camera Viewfinder */}
        <div>
          <CameraCapture
            currentSide={currentSide}
            onCapture={handleCapture}
          />
        </div>

        {/* Upload Alternatives & Captured List */}
        <div>
          <MultiImageUploader
            currentSide={currentSide}
            onUpload={handleCapture}
          />

          <div className="card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 600 }}>
              Captured Evidence Roll ({photos.length})
            </h3>
            <UploadProgressList
              photos={photos}
              onRemovePhoto={handleRemovePhoto}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
