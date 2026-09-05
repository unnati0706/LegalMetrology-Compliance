import React from 'react';
import { InspectNextItem } from '../../shared/types/index.js';
import { DataSufficiencyBadge } from './DataSufficiencyBadge.js';
import { ShieldAlert, AlertTriangle, Sparkles, TrendingUp, CheckCircle } from 'lucide-react';

interface RiskScoreCardProps {
  item: InspectNextItem;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ item }) => {
  const isHigh = item.riskBand === 'HIGH';
  const isMed = item.riskBand === 'MEDIUM';

  return (
    <div
      className="card"
      style={{
        padding: '1.25rem',
        backgroundColor: isHigh ? 'rgba(239, 68, 68, 0.04)' : 'var(--bg-surface)',
        border: `1px solid ${isHigh ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-color)'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={14} color="var(--color-primary-light)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Predictive Enforcement Prioritization
            </span>
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.25rem 0', color: 'var(--text-primary)' }}>
            {item.productName}
          </h3>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {item.manufacturerName} • {item.location}
          </div>
        </div>

        {/* Big Circular Risk Meter */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: isHigh ? 'rgba(239, 68, 68, 0.15)' : isMed ? 'rgba(245, 158, 11, 0.15)' : 'rgba(34, 197, 94, 0.15)',
          border: `2px solid ${isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#22c55e'}`,
          flexShrink: 0
        }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: isHigh ? '#f87171' : isMed ? '#fbbf24' : '#4ade80' }}>
            {item.riskScore}
          </span>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700 }}>RISK</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', fontSize: '0.75rem' }}>
        <DataSufficiencyBadge sufficiency={item.dataSufficiency} auditsCount={item.historicalAuditsCount} />
        
        <span style={{
          padding: '0.15rem 0.45rem',
          borderRadius: '4px',
          backgroundColor: 'rgba(99, 102, 241, 0.12)',
          color: '#a5b4fc',
          fontWeight: 600
        }}>
          Model Confidence: {Math.round(item.confidence * 100)}%
        </span>

        <span style={{
          padding: '0.15rem 0.45rem',
          borderRadius: '4px',
          backgroundColor: isHigh ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
          color: isHigh ? '#f87171' : '#fbbf24',
          fontWeight: 700
        }}>
          Priority Rank #{item.priorityRank}
        </span>
      </div>

      <div style={{
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--bg-surface-elevated)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        fontSize: '0.8rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <TrendingUp size={16} color="var(--color-primary-light)" />
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Action: </span>
          <strong style={{ color: 'var(--text-primary)' }}>{item.suggestedAction}</strong>
        </div>
      </div>
    </div>
  );
};
