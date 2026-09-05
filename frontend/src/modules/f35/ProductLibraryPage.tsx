import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../shared/api/client.js';
import { ManufacturerProduct, ArtworkVersion } from '../../shared/types/index.js';
import { ProductLibraryGrid } from './ProductLibraryGrid.js';
import { ArtworkUploadPanel } from './ArtworkUploadPanel.js';
import { ArtworkVersionList } from './ArtworkVersionList.js';
import { Package, Search, Filter, RefreshCw, AlertCircle, CheckCircle2, ArrowLeft, Plus } from 'lucide-react';
import { RoleGate } from '../../shared/auth/RoleGate.js';

export const ProductLibraryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [products, setProducts] = useState<ManufacturerProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ManufacturerProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadProducts = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await apiClient.getManufacturerProducts(searchQuery, categoryFilter);
      setProducts(data);
      if (id) {
        const found = data.find(p => p.id === id);
        if (found) setSelectedProduct(found);
      } else if (data.length > 0 && !selectedProduct) {
        setSelectedProduct(data[0]);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load product library');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [categoryFilter]);

  const handleSelectProduct = (product: ManufacturerProduct) => {
    setSelectedProduct(product);
    navigate(`/manufacturer/products/${product.id}`);
  };

  const handleUploadArtwork = async (versionData: Partial<ArtworkVersion>) => {
    if (!selectedProduct) return;
    try {
      const newVersion = await apiClient.uploadArtworkVersion(selectedProduct.id, versionData);
      setProducts(prev => prev.map(p => {
        if (p.id === selectedProduct.id) {
          return {
            ...p,
            currentArtworkVersion: newVersion.version,
            artworks: [newVersion, ...p.artworks]
          };
        }
        return p;
      }));
      setSelectedProduct(prev => prev ? {
        ...prev,
        currentArtworkVersion: newVersion.version,
        artworks: [newVersion, ...prev.artworks]
      } : null);
      setToastMessage(`Artwork version ${newVersion.version} uploaded successfully and queued for pre-compliance validation.`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Artwork upload failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button 
            type="button"
            onClick={() => navigate('/manufacturer/dashboard')} 
            className="btn btn-secondary"
            style={{ marginBottom: '0.5rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
          >
            <ArrowLeft size={14} /> Back to Portal
          </button>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Package color="var(--color-primary-light)" />
            Manufacturer Product Library & Packaging Artwork
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            Brand catalog & packaging asset repository — SKU metadata, package dimensions, artwork version history, pre-release PDF proofs, and diff scans.
          </p>
        </div>

        {/* Search and Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search SKU or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadProducts()}
              className="form-input"
              style={{ paddingLeft: '2.25rem', width: '220px' }}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-input"
            style={{ width: 'auto' }}
            aria-label="Filter by category"
          >
            <option value="ALL">All Categories</option>
            <option value="Spices & Condiments">Spices & Condiments</option>
            <option value="Packaged Drinking Water">Packaged Drinking Water</option>
            <option value="Packaged Snacks & Chips">Packaged Snacks & Chips</option>
            <option value="Edible Oils & Fats">Edible Oils & Fats</option>
          </select>

          <button
            type="button"
            onClick={loadProducts}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {toastMessage && (
        <div style={{
          backgroundColor: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#4ade80',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem'
        }}>
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.875rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
          <button type="button" onClick={loadProducts} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {[1, 2, 3].map(k => (
            <div key={k} className="skeleton" style={{ height: '220px', borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Catalog Grid */}
          <ProductLibraryGrid
            products={products}
            selectedProductId={selectedProduct?.id}
            onSelectProduct={handleSelectProduct}
          />

          {/* Selected Product Artwork Detail & Upload Panel */}
          {selectedProduct && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
              gap: '1.5rem',
              alignItems: 'flex-start',
              borderTop: '2px dashed var(--border-color)',
              paddingTop: '2rem'
            }}>
              <div>
                <ArtworkVersionList artworks={selectedProduct.artworks} />
              </div>

              <div>
                <RoleGate allowedRoles={['MANUFACTURER', 'ADMIN']}>
                  <ArtworkUploadPanel
                    productId={selectedProduct.id}
                    onUpload={handleUploadArtwork}
                  />
                </RoleGate>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
