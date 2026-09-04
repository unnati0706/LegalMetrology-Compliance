import React from 'react';
import { CheckCircle2, ShieldCheck, MapPin, Package, Layers } from 'lucide-react';

interface WizardSummaryStepProps {
  categoryName: string;
  metadata: {
    brandName: string;
    productName: string;
    declaredNetQuantity: string;
    declaredMrp: string;
    packageType: string;
  };
  location: {
    state: string;
    district: string;
    premisesName: string;
    premisesType: string;
    gpsCoordinates?: string;
  };
}

export const WizardSummaryStep: React.FC<WizardSummaryStepProps> = ({
  categoryName,
  metadata,
  location
}) => {
  return (
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        Pre-Capture Statutory Inspection Dossier Summary
      </h3>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
        Review inspection metadata before initiating the multi-side computer vision capture session.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Commodity Block */}
        <div style={{ padding: '1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--color-primary)' }}>
            <Package size={16} /> Commodity & Identity
          </div>
          <div style={{ fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div><strong>Category:</strong> {categoryName}</div>
            <div><strong>Brand:</strong> {metadata.brandName}</div>
            <div><strong>Product:</strong> {metadata.productName}</div>
            <div><strong>Packaging:</strong> {metadata.packageType}</div>
          </div>
        </div>

        {/* Declarations Block */}
        <div style={{ padding: '1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.75rem', color: '#059669' }}>
            <CheckCircle2 size={16} /> Declared Commercials
          </div>
          <div style={{ fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div><strong>Declared Net Qty:</strong> {metadata.declaredNetQuantity}</div>
            <div><strong>Declared MRP:</strong> {metadata.declaredMrp}</div>
            <div><strong>Rule Standard:</strong> PCR 2011 Rule 6(1)</div>
          </div>
        </div>

        {/* Location Block */}
        <div style={{ padding: '1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.75rem', color: '#d97706' }}>
            <MapPin size={16} /> Premises & GPS
          </div>
          <div style={{ fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div><strong>Premises:</strong> {location.premisesName || 'Retail Outlet'} ({location.premisesType})</div>
            <div><strong>District:</strong> {location.district}, {location.state}</div>
            <div><strong>GPS:</strong> {location.gpsCoordinates || 'Zone Lock Active'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
