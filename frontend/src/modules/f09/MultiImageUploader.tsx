import React, { useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface MultiImageUploaderProps {
  currentSide: string;
  onUpload: (photo: { side: string; url: string; size: string; qualityScore: number }) => void;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({ currentSide, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      onUpload({
        side: currentSide,
        url,
        size: sizeMb,
        qualityScore: 92
      });
    }
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      style={{
        border: '2px dashed var(--color-border)',
        borderRadius: '12px',
        padding: '1.5rem',
        textAlign: 'center',
        background: 'var(--color-surface)',
        cursor: 'pointer',
        marginBottom: '1rem',
        transition: 'all 0.15s ease'
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFiles}
        style={{ display: 'none' }}
      />
      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', color: 'var(--color-primary)' }}>
        <Upload size={18} />
      </div>
      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
        Or upload pre-captured image for {currentSide}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
        JPEG, PNG, WEBP (Max 10MB)
      </div>
    </div>
  );
};
