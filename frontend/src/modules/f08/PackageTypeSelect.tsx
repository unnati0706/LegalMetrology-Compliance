import React from 'react';

interface PackageTypeSelectProps {
  value: string;
  onChange: (val: string) => void;
}

export const PackageTypeSelect: React.FC<PackageTypeSelectProps> = ({ value, onChange }) => {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
        Packaging Format & Substrate *
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-select"
        style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
      >
        <option value="Flexible Pouch">Flexible Foil Pouch (Pillow / Stand-up)</option>
        <option value="PET / HDPE Bottle">PET / HDPE Rigid Plastic Bottle</option>
        <option value="Paperboard Carton">Paperboard Duplex Outer Box</option>
        <option value="Tin / Aluminium Can">Tin / Aluminium Metallic Canister</option>
        <option value="Glass Jar">Glass Bottle / Jar with Crown Cap</option>
        <option value="Shrink Film Bundle">Multi-pack Shrink Wrapped Bundle</option>
      </select>
    </div>
  );
};
