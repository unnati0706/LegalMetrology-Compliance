import React, { useState } from 'react';
import { RemediationItem } from '../../shared/types';
import { IssueDetailCard } from './IssueDetailCard';
import { CheckCircle, AlertOctagon, Filter, CheckCircle2 } from 'lucide-react';

interface RemediationChecklistProps {
  items: RemediationItem[];
  onToggleResolved: (id: string) => void;
  onResolveAll?: () => void;
}

export const RemediationChecklist: React.FC<RemediationChecklistProps> = ({
  items,
  onToggleResolved,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'UNRESOLVED' | 'CRITICAL' | 'RESOLVED'>('ALL');

  const resolvedCount = items.filter(i => i.isResolved).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 100;

  const filteredItems = items.filter(item => {
    if (filter === 'UNRESOLVED') return !item.isResolved;
    if (filter === 'RESOLVED') return item.isResolved;
    if (filter === 'CRITICAL') return item.severity === 'CRITICAL' || item.severity === 'MAJOR';
    return true;
  });

  return (
    <div>
      {/* Progress Header */}
      <div className="card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} color="var(--color-primary)" />
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Remediation Progress</h4>
          </div>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)' }}>
            {resolvedCount} of {totalCount} Items Resolved ({progressPercent}%)
          </span>
        </div>

        <div style={{ width: '100%', height: '8px', background: 'var(--color-background)', borderRadius: '999px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: progressPercent === 100 ? '#10b981' : 'var(--color-primary)',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('ALL')}
            className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
          >
            All Items ({items.length})
          </button>
          <button
            onClick={() => setFilter('UNRESOLVED')}
            className={`btn btn-sm ${filter === 'UNRESOLVED' ? 'btn-primary' : 'btn-outline'}`}
          >
            Action Required ({items.filter(i => !i.isResolved).length})
          </button>
          <button
            onClick={() => setFilter('CRITICAL')}
            className={`btn btn-sm ${filter === 'CRITICAL' ? 'btn-primary' : 'btn-outline'}`}
          >
            Critical / Major
          </button>
          <button
            onClick={() => setFilter('RESOLVED')}
            className={`btn btn-sm ${filter === 'RESOLVED' ? 'btn-primary' : 'btn-outline'}`}
          >
            Resolved ({resolvedCount})
          </button>
        </div>

        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Filter size={14} /> Showing {filteredItems.length} entries
        </div>
      </div>

      {/* Item list */}
      {filteredItems.length === 0 ? (
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-secondary)', border: '1px dashed var(--color-border)', borderRadius: '12px' }}>
          <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
          <p style={{ margin: 0, fontWeight: 500 }}>No items match the selected filter.</p>
        </div>
      ) : (
        filteredItems.map(item => (
          <IssueDetailCard
            key={item.id}
            item={item}
            onToggleResolved={onToggleResolved}
          />
        ))
      )}
    </div>
  );
};
