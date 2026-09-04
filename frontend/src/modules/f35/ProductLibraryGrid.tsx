import React from 'react';
import { ManufacturerProduct } from '../../shared/types/index.js';
import { Package, ShieldCheck, AlertCircle, Clock, Eye, Layers } from 'lucide-react';

interface ProductLibraryGridProps {
  products: ManufacturerProduct[];
  selectedProductId?: string;
  onSelectProduct: (product: ManufacturerProduct) => void;
}

export const ProductLibraryGrid: React.FC<ProductLibraryGridProps> = ({
  products,
  selectedProductId,
  onSelectProduct,
}) => {
  if (products.length === 0) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <Package size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
        <h3>No products found</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Try searching for a different SKU name or register a new product.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '1.25rem'
    }}>
      {products.map((p) => {
        const isSelected = selectedProductId === p.id;
        const isCompliant = p.complianceStatus === 'COMPLIANT';
        const isFlagged = p.complianceStatus === 'FLAGGED';
        const activeArtwork = p.artworks[0];

        return (
          <div
            key={p.id}
            onClick={() => onSelectProduct(p)}
            className="card"
            style={{
              padding: 0,
              overflow: 'hidden',
              cursor: 'pointer',
              border: `1.5px solid ${isSelected ? 'var(--color-primary-light)' : 'var(--border-color)'}`,
              backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-surface)',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Artwork Thumbnail Header */}
            <div style={{ position: 'relative', height: '140px', backgroundColor: '#020617' }}>
              <img
                src={activeArtwork?.imageUrl || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=60'}
                alt={p.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
              />
              <div style={{
                position: 'absolute',
                top: '0.5rem',
                left: '0.5rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                color: '#ffffff',
                fontSize: '0.7rem',
                fontWeight: 700,
                fontFamily: 'monospace'
              }}>
                {p.sku}
              </div>

              <div style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                backgroundColor: isCompliant ? 'rgba(22, 101, 52, 0.9)' : isFlagged ? 'rgba(185, 28, 28, 0.9)' : 'rgba(217, 119, 6, 0.9)',
                color: '#ffffff',
                fontSize: '0.7rem',
                fontWeight: 700
              }}>
                {isCompliant ? 'COMPLIANT' : isFlagged ? 'FLAGGED' : 'PENDING'}
              </div>
            </div>

            {/* Product Details */}
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {p.name}
              </h4>
              
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {p.category} • {p.packagingType}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>MRP: </span>
                  <strong>{p.mrp}</strong> ({p.netQuantity})
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--color-primary-light)', fontWeight: 600 }}>
                  <Layers size={12} />
                  <span>{p.currentArtworkVersion} ({p.artworks.length} ver)</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
