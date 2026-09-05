import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DeclarationTable } from './DeclarationTable.js';
import { Declaration } from '../../shared/types/index.js';
import { apiClient } from '../../shared/api/client.js';

export const DeclarationsPage: React.FC = () => {
  const { id = 'insp-sample-01' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVerifyingAll, setIsVerifyingAll] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeclarations = async () => {
      setLoading(true);
      try {
        const data = await apiClient.getDeclarations(id);
        setDeclarations(data);
      } catch (err) {
        console.error('Failed to load declarations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeclarations();
  }, [id]);

  const handleUpdateDeclaration = async (decId: string, newValue: string) => {
    try {
      const updated = await apiClient.updateDeclaration(decId, { value: newValue });
      setDeclarations(prev => prev.map(d => d.id === decId ? { ...d, value: newValue, status: 'CORRECTED' } : d));
      setSuccessMessage('Declaration updated successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to update declaration', err);
    }
  };

  const handleVerifyAll = async () => {
    setIsVerifyingAll(true);
    try {
      const updated = await apiClient.verifyAllDeclarations(id);
      setDeclarations(updated);
      setSuccessMessage('All declarations marked as verified.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to verify declarations', err);
    } finally {
      setIsVerifyingAll(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
              Review AI-Extracted Declarations
            </h1>
            <span 
              style={{ 
                fontSize: '0.8rem', 
                backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                color: 'var(--primary-700, #1d4ed8)', 
                padding: '3px 8px', 
                borderRadius: '6px', 
                fontWeight: 600 
              }}
            >
              F12 Inspection Review
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Inspect and verify OCR extracted fields against package imagery before running deterministic rule engine.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={handleVerifyAll}
            disabled={isVerifyingAll || loading}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            ✓ {isVerifyingAll ? 'Verifying...' : 'Verify All Fields'}
          </button>
          <button 
            onClick={() => navigate(`/inspections/${id}/rules`)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            Proceed to Rules Check →
          </button>
        </div>
      </div>

      {successMessage && (
        <div 
          style={{ 
            padding: '0.75rem 1rem', 
            borderRadius: '8px', 
            backgroundColor: 'rgba(16, 185, 129, 0.12)', 
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: 'var(--success-700, #047857)',
            marginBottom: '1rem',
            fontWeight: 500,
            fontSize: '0.9rem'
          }}
        >
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading extracted declarations...
        </div>
      ) : (
        <DeclarationTable 
          declarations={declarations}
          onUpdateDeclaration={handleUpdateDeclaration}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
        <button 
          onClick={() => navigate(`/inspections/${id}/processing`)}
          className="btn btn-secondary"
        >
          ← Back to Processing Pipeline
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => navigate(`/inspections/${id}/evidence`)}
            className="btn btn-secondary"
          >
            Inspect Bounding Boxes Canvas (F15)
          </button>
          <button 
            onClick={() => navigate(`/inspections/${id}/rules`)}
            className="btn btn-primary"
          >
            Check Applicable Rules (F13) →
          </button>
        </div>
      </div>
    </div>
  );
};
