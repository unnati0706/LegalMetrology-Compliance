import React, { useState, useEffect } from 'react';
import { apiClient } from '../../shared/api/client.js';
import { GeoRiskLocation } from '../../shared/types/index.js';
import { InspectionMapView } from './InspectionMapView.js';
import { RiskHeatLayer } from './RiskHeatLayer.js';
import { Map, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const GeographicRiskPage: React.FC = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<GeoRiskLocation[]>([]);
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [showHighRiskOnly, setShowHighRiskOnly] = useState<boolean>(false);
  const [showClusters, setShowClusters] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await apiClient.getGeoRiskLocations(selectedState);
      setLocations(data);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load geospatial risk data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedState]);

  const availableStates = Array.from(new Set(locations.map(l => l.state)));

  const filteredLocations = locations.filter(l => {
    if (showHighRiskOnly && l.riskLevel !== 'HIGH') return false;
    if (showClusters && l.violationsCount < 10) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button 
            type="button"
            onClick={() => navigate('/enforcement/dashboard')} 
            className="btn btn-secondary"
            style={{ marginBottom: '0.5rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Map color="var(--color-primary-light)" />
            Geographic Risk Visualization & Surveillance Grid (F31)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            Geospatial surveillance heat map, regional compliance rates, and hotspot density across states and industrial clusters.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
        >
          <RefreshCw size={14} /> Refresh Map Data
        </button>
      </div>

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
          <button type="button" onClick={loadData} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
            Retry
          </button>
        </div>
      )}

      {/* Layer Controls */}
      <RiskHeatLayer
        showHighRiskOnly={showHighRiskOnly}
        onToggleHighRisk={setShowHighRiskOnly}
        showClusters={showClusters}
        onToggleClusters={setShowClusters}
        activeState={selectedState}
        onSelectState={setSelectedState}
        availableStates={['Maharashtra', 'Delhi', 'Karnataka', 'Gujarat', 'Tamil Nadu']}
      />

      {/* Map View */}
      {isLoading ? (
        <div className="skeleton" style={{ height: '440px', borderRadius: 'var(--radius-lg)' }} />
      ) : (
        <InspectionMapView locations={filteredLocations} />
      )}
    </div>
  );
};
