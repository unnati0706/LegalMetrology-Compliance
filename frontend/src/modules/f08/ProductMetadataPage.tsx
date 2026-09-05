import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ProductForm } from './ProductForm';
import { ArrowLeft, Package, Sparkles } from 'lucide-react';

export const ProductMetadataPage: React.FC = () => {
  const navigate = useNavigate();

  const handleProductSubmit = (data: any) => {
    const generatedId = `insp-${Date.now().toString(36)}`;
    navigate(`/inspections/${generatedId}/capture`);
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '1rem 0' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate('/inspections/new')}
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}
        >
          <ArrowLeft size={16} /> Back to Wizard
        </button>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={24} color="var(--color-primary)" />
          Product & Commodity Metadata Entry
        </h1>
        <p style={{ margin: '0.2rem 0 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Specify mandatory package declarations for statutory verification under Legal Metrology Act, 2009.
        </p>
      </div>

      <ProductForm onSubmit={handleProductSubmit} />
    </div>
  );
};
