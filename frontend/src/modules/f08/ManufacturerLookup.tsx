import React, { useState } from 'react';
import { Building2, Search, Check, ShieldAlert } from 'lucide-react';

const REGISTERED_MANUFACTURERS = [
  { id: 'mfg-01', name: 'Priya Foods Ltd', city: 'Pune, Maharashtra', risk: 'LOW' },
  { id: 'mfg-02', name: 'Royal Beverages Bottling Plant', city: 'Okhla, New Delhi', risk: 'HIGH' },
  { id: 'mfg-03', name: 'Delta Snacks & Confectionery Pvt Ltd', city: 'Sanand, Gujarat', risk: 'MEDIUM' },
  { id: 'mfg-04', name: 'Sunstar Agro Ltd', city: 'Bengaluru, Karnataka', risk: 'LOW' },
];

interface ManufacturerLookupProps {
  value: string;
  onChange: (mfgName: string, mfgId?: string) => void;
}

export const ManufacturerLookup: React.FC<ManufacturerLookupProps> = ({ value, onChange }) => {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  const filtered = REGISTERED_MANUFACTURERS.filter(m =>
    m.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (mfg: typeof REGISTERED_MANUFACTURERS[0]) => {
    setQuery(mfg.name);
    onChange(mfg.name, mfg.id);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
        Registered Manufacturer / Packer Lookup
      </label>
      <div style={{ position: 'relative' }}>
        <Building2 size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Lookup registered brand / plant or type custom name..."
          className="input-text"
          style={{ width: '100%', padding: '0.625rem 0.875rem 0.625rem 2.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
        />
      </div>

      {isOpen && filtered.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            marginTop: '0.25rem',
            maxHeight: '180px',
            overflowY: 'auto',
            zIndex: 50,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}
        >
          {filtered.map(mfg => (
            <div
              key={mfg.id}
              onClick={() => handleSelect(mfg)}
              style={{
                padding: '0.625rem 1rem',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--color-border)',
                fontSize: '0.875rem'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-background)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{mfg.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{mfg.city}</div>
              </div>
              <span className={`badge ${mfg.risk === 'HIGH' ? 'badge-danger' : mfg.risk === 'MEDIUM' ? 'badge-warning' : 'badge-success'}`}>
                {mfg.risk} Risk
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
