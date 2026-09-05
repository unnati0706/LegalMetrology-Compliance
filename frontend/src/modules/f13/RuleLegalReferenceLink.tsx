import React, { useState } from 'react';

interface RuleLegalReferenceLinkProps {
  legalReference: string;
  ruleCode: string;
  description?: string;
  penalClause?: string;
}

export const RuleLegalReferenceLink: React.FC<RuleLegalReferenceLinkProps> = ({
  legalReference,
  ruleCode,
  description,
  penalClause
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          color: 'var(--primary-600, #2563eb)',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
          textDecoration: 'underline',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}
        title="View exact statutory text and penal clause"
      >
        <span>§</span> {legalReference}
      </button>

      {showModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setShowModal(false)}
        >
          <div 
            className="card" 
            style={{ 
              maxWidth: '560px', 
              width: '100%', 
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span 
                  style={{ 
                    fontSize: '0.75rem', 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                    color: 'var(--primary-700, #1d4ed8)', 
                    fontWeight: 700 
                  }}
                >
                  {ruleCode}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Statutory Authority & Clause</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 0.5rem 0' }}>
                Legal Reference
              </h4>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                {legalReference}
              </p>
            </div>

            {description && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 0.5rem 0' }}>
                  Statutory Requirement
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, backgroundColor: 'var(--surface-subtle, #f8fafc)', padding: '0.75rem', borderRadius: '6px' }}>
                  {description}
                </p>
              </div>
            )}

            {penalClause && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--danger-600, #dc2626)', margin: '0 0 0.5rem 0' }}>
                  Prescribed Compounding / Penalty Clause
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--danger-700, #b91c1c)', backgroundColor: 'var(--danger-50, #fef2f2)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--danger-200, #fecaca)' }}>
                  {penalClause}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowModal(false)}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem' }}
              >
                Close Reference
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
