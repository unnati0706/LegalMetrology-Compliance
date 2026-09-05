import React from 'react';
import { Package, Droplets, Coffee, Cookie, Sparkles, Layers } from 'lucide-react';

export const COMMODITY_CATEGORIES = [
  { id: 'cat-spices', name: 'Spices & Condiments', icon: <Package size={20} />, rules: 'Rule 6(1) + Second Schedule Table 1 (g/kg)' },
  { id: 'cat-water', name: 'Packaged Drinking Water', icon: <Droplets size={20} />, rules: 'IS 14543 mandatory + Rule 6(1)(d) Batch Code' },
  { id: 'cat-oil', name: 'Edible Oils & Fats', icon: <Coffee size={20} />, rules: 'Dual declaration (Net Weight & Volume) Rule 12' },
  { id: 'cat-confectionery', name: 'Biscuits & Confectionery', icon: <Cookie size={20} />, rules: 'Standard size packaging exemptions' },
  { id: 'cat-cosmetics', name: 'Personal Care & Cosmetics', icon: <Sparkles size={20} />, rules: 'Importer declaration + Use-before date' },
  { id: 'cat-general', name: 'General Packaged Commodity', icon: <Layers size={20} />, rules: 'Standard PCR 2011 7-point declarations' },
];

interface CategorySelectorProps {
  selectedCategoryId: string;
  onSelectCategory: (catId: string, catName: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategoryId,
  onSelectCategory
}) => {
  return (
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        Select Commodity Category
      </h3>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
        Determines applicable Legal Metrology rules, font size tables, and tolerance thresholds.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {COMMODITY_CATEGORIES.map(cat => {
          const isSelected = cat.id === selectedCategoryId;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id, cat.name)}
              className="card"
              style={{
                background: isSelected ? 'rgba(79, 70, 229, 0.05)' : 'var(--color-surface)',
                border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: '10px',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                  {cat.icon}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: isSelected ? 'var(--color-primary)' : 'var(--color-text)' }}>
                  {cat.name}
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                {cat.rules}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
