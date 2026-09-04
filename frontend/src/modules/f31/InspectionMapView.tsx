import React, { useState } from 'react';
import { GeoRiskLocation } from '../../shared/types/index.js';
import { MapPin, ShieldAlert, ShieldCheck, AlertTriangle, Building, Navigation, ArrowRight } from 'lucide-react';

interface InspectionMapViewProps {
  locations: GeoRiskLocation[];
  onSelectLocation?: (location: GeoRiskLocation) => void;
}

export const InspectionMapView: React.FC<InspectionMapViewProps> = ({
  locations,
  onSelectLocation,
}) => {
  const [selectedLoc, setSelectedLoc] = useState<GeoRiskLocation | null>(locations[0] || null);

  const handlePinClick = (loc: GeoRiskLocation) => {
    setSelectedLoc(loc);
    if (onSelectLocation) onSelectLocation(loc);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '1.25rem', alignItems: 'flex-start' }}>
      {/* Map Canvas / Grid Representation */}
      <div 
        className="card" 
        style={{
          padding: 0,
          overflow: 'hidden',
          backgroundColor: '#090d16',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 'var(--radius-lg)',
          minHeight: '440px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Map Header Overlay */}
        <div style={{
          padding: '0.85rem 1.25rem',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.8rem' }}>
            <Navigation size={14} color="#38bdf8" />
            <span>National Metrology Enforcement Geo-Grid</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem' }}>
            <span style={{ color: '#4ade80' }}>● Low Risk</span>
            <span style={{ color: '#fbbf24' }}>● Medium Risk</span>
            <span style={{ color: '#f87171' }}>● High Risk</span>
          </div>
        </div>

        {/* Geospatial Canvas / Pin Grid */}
        <div style={{
          flex: 1,
          padding: '2rem 1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          alignContent: 'center',
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}>
          {locations.map((loc) => {
            const isSelected = selectedLoc?.id === loc.id;
            const isHigh = loc.riskLevel === 'HIGH';
            const isMed = loc.riskLevel === 'MEDIUM';

            return (
              <div
                key={loc.id}
                onClick={() => handlePinClick(loc)}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.25)' : 'rgba(15, 23, 42, 0.85)',
                  border: `1.5px solid ${isSelected ? '#818cf8' : isHigh ? 'rgba(239, 68, 68, 0.4)' : isMed ? 'rgba(245, 158, 11, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 0 15px rgba(99, 102, 241, 0.4)' : 'none',
                  backdropFilter: 'blur(4px)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={16} color={isHigh ? '#f87171' : isMed ? '#fbbf24' : '#4ade80'} />
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>
                      {loc.district}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                    backgroundColor: isHigh ? 'rgba(239, 68, 68, 0.2)' : isMed ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                    color: isHigh ? '#f87171' : isMed ? '#fbbf24' : '#4ade80'
                  }}>
                    {loc.riskScore}/100
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                  {loc.state} • {loc.totalInspections} audits
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem' }}>
                  <span style={{ color: '#cbd5e1' }}>Compliance Rate:</span>
                  <span style={{ fontWeight: 700, color: loc.complianceRate >= 75 ? '#4ade80' : '#f87171' }}>
                    {loc.complianceRate}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Region Detail Card */}
      {selectedLoc ? (
        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={18} color="var(--color-primary-light)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
              Jurisdiction Intelligence
            </h3>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Location Node
            </div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
              {selectedLoc.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {selectedLoc.district}, {selectedLoc.state} ({selectedLoc.lat.toFixed(2)}°N, {selectedLoc.lng.toFixed(2)}°E)
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.6rem',
            padding: '0.75rem',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-md)'
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Audits</div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedLoc.totalInspections}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Violations</div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f87171' }}>{selectedLoc.violationsCount}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Compliance</div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#4ade80' }}>{selectedLoc.complianceRate}%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Risk Index</div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: selectedLoc.riskScore >= 75 ? '#f87171' : '#fbbf24' }}>
                {selectedLoc.riskScore}/100
              </div>
            </div>
          </div>

          {selectedLoc.recentFlaggedBrand && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem'
            }}>
              <div style={{ fontWeight: 700, color: '#f87171', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ShieldAlert size={14} /> Active Recidivist Hotspot
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                Recent Non-Compliance: <strong>{selectedLoc.recentFlaggedBrand}</strong>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
