import React from 'react';
import { Flame, Layers, Eye, ShieldCheck, AlertOctagon } from 'lucide-react';

interface RiskHeatLayerProps {
  showHighRiskOnly: boolean;
  onToggleHighRisk: (val: boolean) => void;
  showClusters: boolean;
  onToggleClusters: (val: boolean) => void;
  activeState: string;
  onSelectState: (state: string) => void;
  availableStates: string[];
}

export const RiskHeatLayer: React.FC<RiskHeatLayerProps> = ({
  showHighRiskOnly,
  onToggleHighRisk,
  showClusters,
  onToggleClusters,
  activeState,
  onSelectState,
  availableStates,
}) => {
  return (
    <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem' }}>
          <Layers size={16} color="var(--color-primary-light)" />
          <span>GeoSurveillance Layers</span>
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>GIS Heat Engine</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        {/* State Filter */}
        <select
          value={activeState}
          onChange={(e) => onSelectState(e.target.value)}
          className="form-input"
          style={{ width: 'auto', fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
          aria-label="Filter by state jurisdiction"
        >
          <option value="ALL">All States / National Grid</option>
          {availableStates.map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>

        {/* High Risk Toggle */}
        <button
          type="button"
          onClick={() => onToggleHighRisk(!showHighRiskOnly)}
          className={showHighRiskOnly ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{
            fontSize: '0.75rem',
            padding: '0.35rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <Flame size={13} color={showHighRiskOnly ? '#ffffff' : '#f87171'} />
          <span>High Risk Zones ({showHighRiskOnly ? 'Active' : 'Show'})</span>
        </button>

        {/* Cluster Toggle */}
        <button
          type="button"
          onClick={() => onToggleClusters(!showClusters)}
          className={showClusters ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{
            fontSize: '0.75rem',
            padding: '0.35rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <AlertOctagon size={13} color={showClusters ? '#ffffff' : '#fbbf24'} />
          <span>Recidivism Hotspots</span>
        </button>
      </div>
    </div>
  );
};
