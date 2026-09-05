import React, { useState, useEffect } from 'react';
import { apiClient } from '../../shared/api/client.js';
import { KPISummary, TrendDataPoint, Inspection } from '../../shared/types/index.js';
import { KPISummaryRow } from './KPISummaryRow.js';
import { TrendSparkline } from './TrendSparkline.js';
import { StatusDistributionChart } from './StatusDistributionChart.js';
import { RoleGate } from '../../shared/auth/RoleGate.js';
import { Shield, RefreshCw, AlertCircle, ArrowUpRight, ShieldAlert, CheckCircle, Clock, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EnforcementDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<KPISummary | null>(null);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [recentInspections, setRecentInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDashboard = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [kpiRes, trendRes, inspRes] = await Promise.all([
        apiClient.getKPISummary(),
        apiClient.getTrendSparklineData(),
        apiClient.getInspections()
      ]);
      setKpis(kpiRes);
      setTrendData(trendRes);
      setRecentInspections(inspRes.items);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load enforcement dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Shield color="var(--color-primary-light)" />
            Supervisor / Enforcement Dashboard
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            High-level executive metrics, statutory compliance velocity, and operational enforcement monitoring.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={loadDashboard}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} /> Refresh Feed
          </button>

          <RoleGate allowedRoles={['SUPERVISOR', 'ADMIN']}>
            <button
              type="button"
              onClick={() => navigate('/enforcement/analytics')}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
            >
              <span>Detailed Violation Analytics</span>
              <ArrowUpRight size={15} />
            </button>
          </RoleGate>
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
          <button type="button" onClick={loadDashboard} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="skeleton" style={{ height: '110px', borderRadius: 'var(--radius-md)' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
            <div className="skeleton" style={{ height: '240px', borderRadius: 'var(--radius-md)' }} />
            <div className="skeleton" style={{ height: '240px', borderRadius: 'var(--radius-md)' }} />
          </div>
        </div>
      ) : kpis ? (
        <>
          {/* Top KPI Row */}
          <KPISummaryRow kpis={kpis} />

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.25rem' }}>
            <TrendSparkline data={trendData} />
            <StatusDistributionChart kpis={kpis} />
          </div>

          {/* Urgent Action Feed */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={18} color="#ef4444" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                  High-Priority Case Alerts & Flagged Audits
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => navigate('/inspections')} 
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                View All Inspections
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {recentInspections.map((insp) => (
                <div
                  key={insp.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-color)',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {insp.productName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {insp.manufacturerName} • {insp.location || 'Jurisdiction Zone 1'} • {new Date(insp.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: insp.status === 'COMPLETED' ? 'rgba(34, 197, 94, 0.15)' : insp.status === 'FLAGGED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: insp.status === 'COMPLETED' ? '#4ade80' : insp.status === 'FLAGGED' ? '#f87171' : '#fbbf24'
                    }}>
                      {insp.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => navigate(`/inspections/${insp.id}/report`)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                    >
                      Inspect Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
