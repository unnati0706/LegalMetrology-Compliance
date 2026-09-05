import React from 'react';
import { MapPin, Navigation, Building } from 'lucide-react';

export interface LocationData {
  state: string;
  district: string;
  premisesName: string;
  premisesType: 'RETAIL_STORE' | 'SUPERMARKET' | 'MANUFACTURING_UNIT' | 'WAREHOUSE';
  gpsCoordinates?: string;
}

interface LocationPickerProps {
  location: LocationData;
  onChange: (loc: Partial<LocationData>) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ location, onChange }) => {
  const handleGetGps = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onChange({
            gpsCoordinates: `${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`
          });
        },
        () => {
          onChange({ gpsCoordinates: '18.5204° N, 73.8567° E (Pune Regional Zone)' });
        }
      );
    } else {
      onChange({ gpsCoordinates: '18.5204° N, 73.8567° E (Pune Regional Zone)' });
    }
  };

  return (
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        Inspection Location & Premises Context
      </h3>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
        Statutory field location for enforcement jurisdiction and geo-risk tagging.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            State Jurisdiction
          </label>
          <select
            value={location.state}
            onChange={(e) => onChange({ state: e.target.value })}
            className="input-select"
            style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
          >
            <option value="Maharashtra">Maharashtra</option>
            <option value="Delhi">Delhi (NCR)</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            District / Zone
          </label>
          <input
            type="text"
            value={location.district}
            onChange={(e) => onChange({ district: e.target.value })}
            placeholder="e.g. Pune Urban"
            className="input-text"
            style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Establishment / Premises Name
          </label>
          <input
            type="text"
            value={location.premisesName}
            onChange={(e) => onChange({ premisesName: e.target.value })}
            placeholder="e.g. Apex Hypermarket & Wholesale Hub"
            className="input-text"
            style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Premises Category
          </label>
          <select
            value={location.premisesType}
            onChange={(e) => onChange({ premisesType: e.target.value as any })}
            className="input-select"
            style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
          >
            <option value="RETAIL_STORE">Retail Outlet / Kirana</option>
            <option value="SUPERMARKET">Supermarket / Hypermarket</option>
            <option value="WAREHOUSE">Wholesale Distributor / Warehouse</option>
            <option value="MANUFACTURING_UNIT">Factory / Packaging Plant</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', background: 'var(--color-background)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
        <MapPin size={18} color="var(--color-primary)" />
        <div style={{ flex: 1, fontSize: '0.8125rem' }}>
          GPS Lock: <strong>{location.gpsCoordinates || 'Not Acquired'}</strong>
        </div>
        <button
          type="button"
          onClick={handleGetGps}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}
        >
          <Navigation size={13} /> {location.gpsCoordinates ? 'Re-acquire GPS' : 'Lock GPS Coordinates'}
        </button>
      </div>
    </div>
  );
};
