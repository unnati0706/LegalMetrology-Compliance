import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ConfidenceMeter } from './ConfidenceMeter.js';
import { ViolationCard } from './ViolationCard.js';
import { ComplianceResultTable } from './ComplianceResultTable.js';
import { CheckResult, Violation } from '../../shared/types/index.js';
import { apiClient } from '../../shared/api/client.js';

export const ResultsPage: React.FC = () => {
  const { id = 'insp-sample-01' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [score, setScore] = useState<number>(75);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await apiClient.getComplianceResults(id);
        setChecks(data.checks);
        setViolations(data.violations);
        setScore(data.overallScore);
      } catch (err) {
        console.error('Failed to load compliance results', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [id]);

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
              Inspection Compliance Findings & Violations
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
              F14 Results Engine
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Automated statutory evaluation based on Legal Metrology (Packaged Commodities) Rules, 2011.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => navigate(`/inspections/${id}/evidence`)}
            className="btn btn-secondary"
          >
            Inspect Evidence Highlighting (F15)
          </button>
          <button 
            onClick={() => navigate(`/inspections/${id}/manual-review`)}
            className="btn btn-primary"
          >
            Review Queue (F22) →
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading compliance results...
        </div>
      ) : (
        <>
          <ConfidenceMeter 
            score={score}
            title="Legal Metrology Compliance Score"
            subtitle={`${checks.filter(c => c.status === 'PASS').length} of ${checks.length} statutory checks passed`}
          />

          {violations.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span 
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--danger-500, #ef4444)'
                  }} 
                />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--danger-900, #7f1d1d)' }}>
                  Detected Statutory Violations ({violations.length})
                </h2>
              </div>
              {violations.map(v => (
                <ViolationCard 
                  key={v.id} 
                  violation={v}
                  onInspectEvidence={() => navigate(`/inspections/${id}/evidence`)}
                  onOverride={() => navigate(`/inspections/${id}/manual-review`)}
                />
              ))}
            </div>
          )}

          <ComplianceResultTable 
            checks={checks}
            onInspectCheck={() => navigate(`/inspections/${id}/evidence`)}
          />
        </>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
        <button 
          onClick={() => navigate(`/inspections/${id}/rules`)}
          className="btn btn-secondary"
        >
          ← Back to Rules Matrix (F13)
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => navigate(`/inspections/${id}/evidence`)}
            className="btn btn-secondary"
          >
            View Evidence Highlighting (F15)
          </button>
          <button 
            onClick={() => navigate(`/inspections/${id}/finalize`)}
            className="btn btn-primary"
          >
            Finalize Inspection (F24) →
          </button>
        </div>
      </div>
    </div>
  );
};
