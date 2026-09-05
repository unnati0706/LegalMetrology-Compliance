import React from 'react';
import { EnforcementCase } from '../../shared/types/index.js';
import { FollowUpStatusTag } from './FollowUpStatusTag.js';
import { Briefcase, AlertCircle, Clock, Calendar, ArrowRight, User } from 'lucide-react';

interface CaseListProps {
  cases: EnforcementCase[];
  selectedCaseId?: string;
  onSelectCase: (caseItem: EnforcementCase) => void;
}

export const CaseList: React.FC<CaseListProps> = ({
  cases,
  selectedCaseId,
  onSelectCase,
}) => {
  if (cases.length === 0) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <Briefcase size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
        <h3>No enforcement cases found</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          All follow-ups resolved or no cases match the selected status criteria.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {cases.map((c) => {
        const isSelected = selectedCaseId === c.id;
        const isHigh = c.priority === 'HIGH';

        return (
          <div
            key={c.id}
            onClick={() => onSelectCase(c)}
            className="card"
            style={{
              padding: '1rem 1.25rem',
              cursor: 'pointer',
              border: `1px solid ${isSelected ? 'var(--color-primary-light)' : 'var(--border-color)'}`,
              backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.12)' : 'var(--bg-surface)',
              transition: 'all 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-light)', fontFamily: 'monospace' }}>
                    {c.caseNumber}
                  </span>
                  {isHigh && (
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '0.1rem 0.35rem',
                      borderRadius: '3px',
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      color: '#f87171'
                    }}>
                      HIGH PRIORITY
                    </span>
                  )}
                </div>
                <h4 style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {c.title}
                </h4>
              </div>

              <FollowUpStatusTag status={c.status} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div>
                <span>Mfg: <strong>{c.manufacturerName}</strong></span> • <span>Category: {c.category}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={12} />
                <span>Due: {new Date(c.deadline).toLocaleDateString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', marginTop: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}>
                <User size={12} />
                <span>Assigned: {c.assignedInspectorName}</span>
              </div>
              <div style={{ color: 'var(--color-primary-light)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <span>Inspect Dossier</span>
                <ArrowRight size={12} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
