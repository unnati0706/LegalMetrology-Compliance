import React from 'react';
import { InspectNextItem } from '../../shared/types/index.js';
import { DataSufficiencyBadge } from './DataSufficiencyBadge.js';
import { ShieldAlert, Send, ArrowRight, Layers, Flame, MapPin } from 'lucide-react';
import { RoleGate } from '../../shared/auth/RoleGate.js';

interface InspectNextQueueListProps {
  queue: InspectNextItem[];
  selectedItemId?: string;
  onSelectItem: (item: InspectNextItem) => void;
  onDispatchInspection: (item: InspectNextItem) => void;
}

export const InspectNextQueueList: React.FC<InspectNextQueueListProps> = ({
  queue,
  selectedItemId,
  onSelectItem,
  onDispatchInspection,
}) => {
  if (queue.length === 0) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <Flame size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
        <h3>Inspect-Next Queue Empty</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          No high-risk prioritized candidates detected for the selected filters.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {queue.map((item) => {
        const isSelected = selectedItemId === item.id;
        const isHigh = item.riskBand === 'HIGH';
        const isMed = item.riskBand === 'MEDIUM';

        return (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="card"
            style={{
              padding: '1rem 1.25rem',
              cursor: 'pointer',
              border: `1px solid ${isSelected ? 'var(--color-primary-light)' : 'var(--border-color)'}`,
              backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.12)' : 'var(--bg-surface)',
              transition: 'all 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    color: '#a5b4fc'
                  }}>
                    #{item.priorityRank} PRIORITY
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {item.category}
                  </span>
                </div>

                <h4 style={{ margin: '0.35rem 0 0 0', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {item.productName}
                </h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  {item.manufacturerName}
                </div>
              </div>

              {/* Risk Badge */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0.35rem 0.65rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isHigh ? 'rgba(239, 68, 68, 0.15)' : isMed ? 'rgba(245, 158, 11, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                border: `1px solid ${isHigh ? 'rgba(239, 68, 68, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
                flexShrink: 0
              }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: isHigh ? '#f87171' : '#fbbf24' }}>
                  {item.riskScore}
                </span>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {item.riskBand} RISK
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={12} />
                <span>{item.location}</span>
              </div>

              <RoleGate allowedRoles={['INSPECTOR', 'SUPERVISOR', 'ADMIN']}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDispatchInspection(item);
                  }}
                  className="btn btn-primary"
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Send size={12} /> Dispatch Audit
                </button>
              </RoleGate>
            </div>
          </div>
        );
      })}
    </div>
  );
};
