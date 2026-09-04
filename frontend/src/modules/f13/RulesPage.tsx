import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ApplicableRuleList } from './ApplicableRuleList.js';
import { RuleVersionBadge } from './RuleVersionBadge.js';
import { ApplicableRule } from '../../shared/types/index.js';
import { apiClient } from '../../shared/api/client.js';

export const RulesPage: React.FC = () => {
  const { id = 'insp-sample-01' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [rules, setRules] = useState<ApplicableRule[]>([]);
  const [category, setCategory] = useState<string>('ALL');
  const [productCategory, setProductCategory] = useState<string>('General Pre-Packaged Commodities');
  const [versionInfo, setVersionInfo] = useState({
    version: 'PCR-2011-v2.0 (Amended 2022)',
    gazetteNotification: 'G.S.R. 779(E) dated 2nd November 2021',
    effectiveDate: '01/01/2022'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRules = async () => {
      setLoading(true);
      try {
        const data = await apiClient.getApplicableRules(id);
        setRules(data.rules);
        setProductCategory(data.category);
        setVersionInfo({
          version: data.activeRuleVersion,
          gazetteNotification: data.gazetteNotification,
          effectiveDate: '01/01/2022'
        });
      } catch (err) {
        console.error('Failed to load rules', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, [id]);

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
              Rule Applicability & Category Matrix
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
              F13 Rule Engine
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Active statutory framework configured for: <strong>{productCategory}</strong>
          </p>
        </div>

        <RuleVersionBadge 
          version={versionInfo.version}
          gazetteNotification={versionInfo.gazetteNotification}
          effectiveDate={versionInfo.effectiveDate}
        />
      </div>

      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading applicable rules matrix...
        </div>
      ) : (
        <ApplicableRuleList 
          rules={rules}
          selectedCategory={category}
          onSelectCategory={setCategory}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
        <button 
          onClick={() => navigate(`/inspections/${id}/declarations`)}
          className="btn btn-secondary"
        >
          ← Back to Declarations (F12)
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => navigate(`/inspections/${id}/results`)}
            className="btn btn-primary"
          >
            Run Compliance Rule Engine (F14) →
          </button>
        </div>
      </div>
    </div>
  );
};
