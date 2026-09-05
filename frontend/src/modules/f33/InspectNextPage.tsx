import React, { useState, useEffect } from 'react';
import { apiClient } from '../../shared/api/client.js';
import { InspectNextItem } from '../../shared/types/index.js';
import { InspectNextQueueList } from './InspectNextQueueList.js';
import { RiskScoreCard } from './RiskScoreCard.js';
import { RiskFactorBreakdown } from './RiskFactorBreakdown.js';
import { Sparkles, RefreshCw, Filter, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const InspectNextPage: React.FC = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<InspectNextItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InspectNextItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [riskBandFilter, setRiskBandFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadQueue = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await apiClient.getInspectNextQueue(categoryFilter, riskBandFilter);
      setQueue(data);
      if (data.length > 0 && (!selectedItem || !data.some(i => i.id === selectedItem.id))) {
        setSelectedItem(data[0]);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load inspect-next queue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [categoryFilter, riskBandFilter]);

  const handleDispatch = (item: InspectNextItem) => {
    setToastMessage(`Inspection mission dispatched for "${item.productName}". Queued for field scanning.`);
    setTimeout(() => setToastMessage(null), 4000);
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
            <Sparkles color="var(--color-primary-light)" />
            Risk Dashboard & Predictive Inspect-Next Queue
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            ML-driven risk prioritization index identifying high-probability non-compliant targets for field enforcement.
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-input"
            style={{ width: 'auto' }}
            aria-label="Filter by commodity category"
          >
            <option value="ALL">All Commodity Categories</option>
            <option value="Packaged Drinking Water">Packaged Drinking Water</option>
            <option value="Packaged Snacks & Chips">Packaged Snacks & Chips</option>
            <option value="Spices & Condiments">Spices & Condiments</option>
            <option value="Dairy Products">Dairy Products</option>
          </select>

          <select
            value={riskBandFilter}
            onChange={(e) => setRiskBandFilter(e.target.value)}
            className="form-input"
            style={{ width: 'auto' }}
            aria-label="Filter by risk band"
          >
            <option value="ALL">All Risk Bands</option>
            <option value="HIGH">High Risk Only (Score &gt; 70)</option>
            <option value="MEDIUM">Medium Risk (Score 40-70)</option>
            <option value="LOW">Low Risk</option>
          </select>

          <button
            type="button"
            onClick={loadQueue}
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
          <button type="button" onClick={loadQueue} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem' }}>
          <div className="skeleton" style={{ height: '360px', borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ height: '360px', borderRadius: 'var(--radius-md)' }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'flex-start' }}>
          {/* Left Column: Prioritized Queue */}
          <div>
            <InspectNextQueueList
              queue={queue}
              selectedItemId={selectedItem?.id}
              onSelectItem={(item) => setSelectedItem(item)}
              onDispatchInspection={handleDispatch}
            />
          </div>

          {/* Right Column: Explainable AI Score & Factors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {selectedItem ? (
              <>
                <RiskScoreCard item={selectedItem} />
                <RiskFactorBreakdown factors={selectedItem.riskFactors} />
              </>
            ) : (
              <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>Select an item from the queue to view explainable risk factors.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
