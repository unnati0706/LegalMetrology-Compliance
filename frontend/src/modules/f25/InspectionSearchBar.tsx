import React from 'react';
import { Search, X } from 'lucide-react';

interface InspectionSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export const InspectionSearchBar: React.FC<InspectionSearchBarProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search by product name, brand, manufacturer, location...',
}) => {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{
        position: 'absolute',
        left: '0.85rem',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'none'
      }}>
        <Search size={18} />
      </div>

      <input
        type="text"
        className="form-input"
        style={{
          paddingLeft: '2.5rem',
          paddingRight: value ? '2.5rem' : '1rem',
          height: '42px',
          fontSize: '0.9rem',
          backgroundColor: 'var(--bg-card)'
        }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {value && (
        <button
          type="button"
          onClick={onClear}
          style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
