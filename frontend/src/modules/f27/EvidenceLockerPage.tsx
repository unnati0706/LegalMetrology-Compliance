import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../shared/api/client.js';
import { EvidenceLockerFile, Inspection } from '../../shared/types/index.js';
import { EvidenceLockerGrid } from './EvidenceLockerGrid.js';
import { Archive, ArrowLeft, UploadCloud, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { RoleGate } from '../../shared/auth/RoleGate.js';

export const EvidenceLockerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [selectedInspectionId, setSelectedInspectionId] = useState<string>(id || 'insp-sample-01');
  const [files, setFiles] = useState<EvidenceLockerFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadToast, setUploadToast] = useState<string | null>(null);

  const loadData = async (targetId: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const allInsp = await apiClient.getInspections();
      setInspections(allInsp.items);

      const lockerFiles = await apiClient.getEvidenceLockerFiles(targetId);
      setFiles(lockerFiles);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load evidence locker');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const targetId = id || selectedInspectionId;
    setSelectedInspectionId(targetId);
    loadData(targetId);
  }, [id]);

  const handleSelectChange = (newId: string) => {
    setSelectedInspectionId(newId);
    navigate(`/inspections/${newId}/evidence-locker`);
  };

  const handleSimulateUpload = async () => {
    try {
      const newFile = await apiClient.uploadEvidenceLockerFile({
        inspectionId: selectedInspectionId,
        fileName: `field_capture_${Date.now().toString(36)}.jpg`,
        packageSide: 'PDP',
        tags: ['New Field Capture', 'Uncompressed', 'Timestamped'],
      });
      setFiles(prev => [newFile, ...prev]);
      setUploadToast(`Evidence item "${newFile.fileName}" encrypted and added to immutable locker.`);
      setTimeout(() => setUploadToast(null), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Upload failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button 
            type="button"
            onClick={() => navigate('/inspections')} 
            className="btn btn-secondary"
            style={{ marginBottom: '0.5rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
          >
            <ArrowLeft size={14} /> Back to Inspections
          </button>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Archive color="var(--color-primary-light)" />
            Evidence Locker & Asset Vault
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            Cryptographically sealed high-resolution image assets with SHA-256 integrity digests for judicial record.
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            value={selectedInspectionId}
            onChange={(e) => handleSelectChange(e.target.value)}
            className="form-input"
            style={{ width: 'auto', minWidth: '220px' }}
          >
            {inspections.map(i => (
              <option key={i.id} value={i.id}>
                {i.productName} ({i.id})
              </option>
            ))}
          </select>

          <RoleGate allowedRoles={['INSPECTOR', 'SUPERVISOR', 'ADMIN']}>
            <button
              type="button"
              onClick={handleSimulateUpload}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
            >
              <UploadCloud size={16} />
              <span>Capture / Upload Evidence</span>
            </button>
          </RoleGate>
        </div>
      </div>

      {uploadToast && (
        <div style={{
          backgroundColor: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#4ade80',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem'
        }}>
          <CheckCircle2 size={16} />
          <span>{uploadToast}</span>
        </div>
      )}

      {errorMessage && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.875rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
          <button 
            type="button"
            onClick={() => loadData(selectedInspectionId)} 
            className="btn btn-secondary" 
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {[1, 2, 3, 4].map(k => (
            <div key={k} className="skeleton" style={{ height: '260px', borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      ) : files.length > 0 ? (
        <EvidenceLockerGrid files={files} />
      ) : (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Archive size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>No evidence captured yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Use the camera capture flow in Inspection Scanner to archive package face evidence.
          </p>
        </div>
      )}
    </div>
  );
};
