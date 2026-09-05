import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

interface InspectionFilterPanelProps {
  status: string;
  category: string;
  onStatusChange: (status: string) => void;
  onCategoryChange: (category: string) => void;
  onReset: () => void;
}

export const InspectionFilterPanel: React.FC<InspectionFilterPanelProps> = ({
  status,
  category,
  onStatusChange,
  onCategoryChange,
  onReset,
}) => {
  const categories = [
    'ALL',
    'Spices & Condiments',
    'Packaged Drinking Water',
    'Edible Oils & Fats',
    'Food & Grains',
    'Personal Care & Cosmetics',
    'Dairy Products'
  ];

  const statuses = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'MANUAL_REVIEW_REQUIRED', label: 'Manual Review Required' },
    { value: 'FLAGGED', label: 'Flagged (Non-Compliant)' },
    { value: 'COMPLETED', label: 'Completed (Compliant)' },
    { value: 'IN_REVIEW', label: 'In Review' },
    { value: 'DRAFT', label: 'Draft' },
  ];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      flexWrap: 'wrap',
      backgroundColor: 'var(--bg-card)',
      padding: '0.75rem 1rem',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-light)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
        <Filter size={15} /> Filters:
      </div>

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="form-select"
        style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
      >
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="form-select"
        style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
      >
        {categories.map((c) => (
          <option key={c} value={c}>
            {c === 'ALL' ? 'All Categories' : c}
          </option>
        ))}
      </select>

      {(status !== 'ALL' || category !== 'ALL') && (
        <button
          onClick={onReset}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
          title="Reset Filters"
        >
          <RotateCcw size={12} /> Reset
        </button>
      )}
    </div>
  );
};
