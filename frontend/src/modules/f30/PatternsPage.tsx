import React, { useState, useEffect } from 'react';
import { apiClient } from '../../shared/api/client.js';
import { ManufacturerPattern, CategoryPattern } from '../../shared/types/index.js';
import { ManufacturerPatternTable } from './ManufacturerPatternTable.js';
import { CategoryPatternChart } from './CategoryPatternChart.js';
import { Network, Search, Filter, RefreshCw, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PatternsPage: React.FC = () => {
  const navigate = useNavigate();
  const [patterns, setPatterns] = useState<ManufacturerPattern[]>([]);
  const [categories, setCategories] = useState<CategoryPattern[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [patternsRes, catsRes] = await Promise.all([
        apiClient.getManufacturerPatterns(searchQuery, riskFilter),
        apiClient.getCategoryPatterns()
      ]);
      setPatterns(patternsRes);
      setCategories(catsRes);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load pattern analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [riskFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleEscalate = async (id: string, newStatus: ManufacturerPattern['escalationStatus']) => {
    try {
      await apiClient.updateManufacturerEscalation(id, newStatus);
      setPatterns(prev => prev.map(m => m.id === id ? { ...m, escalationStatus: newStatus } : m));
      setToastMessage(`Enforcement status updated to "${newStatus?.replace(/_/g, ' ')}" for manufacturer.`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update escalation');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
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
            <Network color="var(--color-primary-light)" />
            Manufacturer Recidivism & Category Patterns (F30)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            Identify habitual offenders, recurrent non-compliance patterns, and commodity sector risk profiles.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search manufacturer or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.25rem', width: '240px' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              Search
            </button>
          </form>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="form-input"
            style={{ width: 'auto' }}
            aria-label="Filter by risk tier"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="HIGH">High Risk Only</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>

          <button
            type="button"
            onClick={loadData}
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
          <button type="button" onClick={loadData} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="skeleton" style={{ height: '140px', borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-md)' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <CategoryPatternChart categories={categories} />
          <ManufacturerPatternTable patterns={patterns} onEscalate={handleEscalate} />
        </div>
      )}
    </div>
  );
};
