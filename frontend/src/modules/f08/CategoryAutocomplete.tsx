import React, { useState } from 'react';
import { Search, Check } from 'lucide-react';
import { COMMODITY_CATEGORIES } from '../f07/CategorySelector';

interface CategoryAutocompleteProps {
  value: string;
  onChange: (category: string) => void;
}

export const CategoryAutocomplete: React.FC<CategoryAutocompleteProps> = ({ value, onChange }) => {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  const filtered = COMMODITY_CATEGORIES.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (catName: string) => {
    setQuery(catName);
    onChange(catName);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
        Commodity Category Autocomplete *
      </label>
      <div style={{ position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search PCR 2011 category (e.g. Spices, Water, Edible Oil)..."
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
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 50,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}
        >
          {filtered.map(cat => (
            <div
              key={cat.id}
              onClick={() => handleSelect(cat.name)}
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
                <div style={{ fontWeight: 600 }}>{cat.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{cat.rules}</div>
              </div>
              {cat.name === query && <Check size={16} color="var(--color-primary)" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
