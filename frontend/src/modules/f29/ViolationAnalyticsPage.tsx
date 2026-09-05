import React, { useState, useEffect } from 'react';
import { apiClient } from '../../shared/api/client.js';
import { ViolationTrendData, RuleDistributionData } from '../../shared/types/index.js';
import { ViolationTrendChart } from './ViolationTrendChart.js';
import { ViolationDistributionChart } from './ViolationDistributionChart.js';
import { BarChart3, RefreshCw, Download, Filter, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ViolationAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [trends, setTrends] = useState<ViolationTrendData[]>([]);
  const [distributions, setDistributions] = useState<RuleDistributionData[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadAnalytics = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [trendRes, distRes] = await Promise.all([
        apiClient.getViolationTrends(),
        apiClient.getRuleDistributions()
      ]);
      setTrends(trendRes);
      setDistributions(distRes);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load violation analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const filteredDistributions = selectedSeverity === 'ALL'
    ? distributions
    : distributions.filter(d => d.severity === selectedSeverity);

  const handleExportCSV = () => {
    const csvContent = [
      ['Rule Code', 'Rule Description', 'Severity', 'Violations Count', 'Percentage (%)'],
      ...distributions.map(d => [d.ruleCode, `"${d.ruleTitle}"`, d.severity, d.count, `${d.percentage}%`])
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Statutory-Violation-Analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
            <BarChart3 color="var(--color-primary-light)" />
            Violation Trends & Statutory Clause Distribution (F29)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            Longitudinal violation patterns, non-compliance hotspot analysis, and clause severity analytics.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="form-input"
            style={{ width: 'auto' }}
            aria-label="Filter by severity"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="MAJOR">Major Only</option>
            <option value="MINOR">Minor Only</option>
          </select>

          <button
            type="button"
            onClick={handleExportCSV}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <Download size={14} /> Export CSV
          </button>

          <button
            type="button"
            onClick={loadAnalytics}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
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
          <button type="button" onClick={loadAnalytics} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="skeleton" style={{ height: '240px', borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ height: '280px', borderRadius: 'var(--radius-md)' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <ViolationTrendChart data={trends} />
          <ViolationDistributionChart data={filteredDistributions} />
        </div>
      )}
    </div>
  );
};
