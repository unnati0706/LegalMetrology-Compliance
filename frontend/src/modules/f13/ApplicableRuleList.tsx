import React, { useState } from 'react';
import { ApplicableRule } from '../../shared/types/index.js';
import { RuleLegalReferenceLink } from './RuleLegalReferenceLink.js';

interface ApplicableRuleListProps {
  rules: ApplicableRule[];
  selectedCategory?: string;
  onSelectCategory?: (cat: string) => void;
}

export const ApplicableRuleList: React.FC<ApplicableRuleListProps> = ({
  rules,
  selectedCategory = 'ALL',
  onSelectCategory
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['ALL', ...Array.from(new Set(rules.map(r => r.category)))];

  const filtered = rules.filter(r => {
    const matchesCat = selectedCategory === 'ALL' || r.category === selectedCategory;
    const matchesSearch = 
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.ruleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.legalReference.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '1.5rem' }}>
      <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--surface-border, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
            Active Legal Metrology Rule Matrix ({filtered.length} Rules)
          </h3>
          <input 
            type="text"
            placeholder="Search rules, codes, clauses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ width: '260px', padding: '6px 12px', fontSize: '0.85rem' }}
          />
        </div>

        {/* Category Pills */}
        {onSelectCategory && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontWeight: selectedCategory === cat ? 600 : 500,
                  backgroundColor: selectedCategory === cat ? 'var(--primary-600, #2563eb)' : 'var(--surface-subtle, #f1f5f9)',
                  color: selectedCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--surface-border, #e2e8f0)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat === 'ALL' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {filtered.map((rule) => (
          <div 
            key={rule.id}
            style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--surface-border, #e2e8f0)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              transition: 'background-color 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span 
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: 'var(--primary-700, #1d4ed8)',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}
                >
                  {rule.ruleCode}
                </span>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {rule.title}
                </h4>
              </div>

              <span 
                style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  backgroundColor: rule.isMandatory ? 'rgba(239, 68, 68, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                  color: rule.isMandatory ? 'var(--danger-700, #b91c1c)' : 'var(--text-muted)'
                }}
              >
                {rule.isMandatory ? 'MANDATORY' : 'OPTIONAL'}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {rule.description}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
              <RuleLegalReferenceLink 
                legalReference={rule.legalReference}
                ruleCode={rule.ruleCode}
                description={rule.description}
                penalClause={rule.penalClause}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Category: {rule.category}
              </span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No rules match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};
