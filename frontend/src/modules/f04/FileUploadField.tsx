import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface FileUploadFieldProps {
  label: string;
  onFileSelect: (file: File) => void;
  maxSizeBytes?: number; // default 10MB
  acceptedTypes?: string[];
  previewUrl?: string;
  error?: string;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label,
  onFileSelect,
  maxSizeBytes = 10 * 1024 * 1024,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  previewUrl,
  error
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(previewUrl || null);
  const [localError, setLocalError] = useState<string | null>(error || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setLocalError(null);

    if (!acceptedTypes.includes(file.type)) {
      setLocalError(`Unsupported file format (${file.type}). Allowed: JPG, PNG, WEBP.`);
      return;
    }

    if (file.size > maxSizeBytes) {
      setLocalError(`File exceeds maximum size of ${(maxSizeBytes / (1024 * 1024)).toFixed(0)}MB.`);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
        {label}
      </label>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? 'var(--color-primary)' : localError ? '#ef4444' : 'var(--color-border)'}`,
          borderRadius: '10px',
          padding: '1.5rem',
          textAlign: 'center',
          backgroundColor: dragOver ? 'rgba(79, 70, 229, 0.05)' : 'var(--color-background)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          position: 'relative'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />

        {localPreview ? (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={localPreview}
              alt="Uploaded Evidence Preview"
              style={{ maxHeight: '160px', maxWidth: '100%', borderRadius: '6px', objectFit: 'contain' }}
            />
            <button
              onClick={handleRemove}
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Remove image"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', color: 'var(--color-primary)', border: '1px solid var(--color-border)' }}>
              <Upload size={20} />
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>
              Click to browse or drag & drop packaging image
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
              JPEG, PNG, or WEBP up to 10MB
            </div>
          </div>
        )}
      </div>

      {(localError || error) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#dc2626', fontSize: '0.75rem', marginTop: '0.35rem' }}>
          <AlertCircle size={14} />
          <span>{localError || error}</span>
        </div>
      )}
    </div>
  );
};
