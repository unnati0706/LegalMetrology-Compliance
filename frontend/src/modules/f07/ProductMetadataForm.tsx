import React from 'react';

interface ProductMetadata {
  brandName: string;
  productName: string;
  declaredNetQuantity: string;
  declaredMrp: string;
  batchNumber?: string;
  packageType: string;
}

interface ProductMetadataFormProps {
  metadata: ProductMetadata;
  onChange: (data: Partial<ProductMetadata>) => void;
}

export const ProductMetadataForm: React.FC<ProductMetadataFormProps> = ({ metadata, onChange }) => {
  return (
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        Product Identification & Package Specifications
      </h3>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
        Enter package label declarations for baseline comparison against OCR extraction.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Brand Name *
          </label>
          <input
            type="text"
            value={metadata.brandName}
            onChange={(e) => onChange({ brandName: e.target.value })}
            placeholder="e.g. Priya Foods"
            required
            className="input-text"
            style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Product Commodity Name *
          </label>
          <input
            type="text"
            value={metadata.productName}
            onChange={(e) => onChange({ productName: e.target.value })}
            placeholder="e.g. Premium Red Chilli Powder"
            required
            className="input-text"
            style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Declared Net Quantity *
          </label>
          <input
            type="text"
            value={metadata.declaredNetQuantity}
            onChange={(e) => onChange({ declaredNetQuantity: e.target.value })}
            placeholder="e.g. 500 g"
            required
            className="input-text"
            style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Maximum Retail Price (MRP) *
          </label>
          <input
            type="text"
            value={metadata.declaredMrp}
            onChange={(e) => onChange({ declaredMrp: e.target.value })}
            placeholder="e.g. ₹140.00"
            required
            className="input-text"
            style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Batch / Lot Number (Optional)
          </label>
          <input
            type="text"
            value={metadata.batchNumber || ''}
            onChange={(e) => onChange({ batchNumber: e.target.value })}
            placeholder="e.g. BATCH-2026-09A"
            className="input-text"
            style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Packaging Material / Type
          </label>
          <select
            value={metadata.packageType}
            onChange={(e) => onChange({ packageType: e.target.value })}
            className="input-select"
            style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
          >
            <option value="Flexible Pouch">Flexible Foil Pouch</option>
            <option value="Rigid Bottle / Can">Rigid Bottle / PET Canister</option>
            <option value="Paperboard Carton">Paperboard Duplex Carton</option>
            <option value="Tinplate Container">Tinplate Metal Container</option>
            <option value="Corrugated Outer">Corrugated Wholesale Carton</option>
          </select>
        </div>
      </div>
    </div>
  );
};
