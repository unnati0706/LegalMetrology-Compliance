import React, { useState, useEffect } from 'react';
import { apiClient } from '../../shared/api/client';
import { Inspection } from '../../shared/types';
import { DashboardKPICards } from './DashboardKPICards';
import { RecentInspectionsList } from './RecentInspectionsList';
import { PendingReviewWidget } from './PendingReviewWidget';
import { QuickStartInspectionButton } from './QuickStartInspectionButton';
import { ShieldCheck, HardDriveDownload, Sparkles, MapPin } from 'lucide-react';
import { useAuth } from '../../shared/auth/AuthContext';

export const InspectorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getInspections();
        setInspections(data.items || data);
      } catch (err) {
        console.error('Failed to load inspector dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const total = inspections.length;
  const compliant = inspections.filter(i => i.overallDisposition === 'COMPLIANT' || i.violationsCount === 0).length;
  const flagged = inspections.filter(i => i.status === 'FLAGGED' || i.violationsCount > 0).length;
  const pendingReviews = inspections.reduce((acc, curr) => acc + (curr.manualReviewCount || 0), 0) + 2;
  const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 100;

  const kpis = {
    todayInspections: total,
    compliantCount: compliant,
    flaggedCount: flagged,
    pendingReviews,
    complianceRate,
  };

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
      {/* Header with Quick Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.8125rem' }}>
            <MapPin size={14} /> Enforcement Zone 2 • Maharashtra
          </div>
          <h1 style={{ margin: '0.25rem 0 0', fontSize: '1.6rem', fontWeight: 800 }}>
            Field Officer Duty Console
          </h1>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Logged in as <strong>{user?.name || 'Inspector Amit Patel'}</strong> (DoCA Enforcement Wing)
          </p>
        </div>

        <QuickStartInspectionButton />
      </div>

      {/* Pending Confidence Gate Widget */}
      <PendingReviewWidget pendingCount={pendingReviews} />

      {/* Key Metric Tiles */}
      <DashboardKPICards kpis={kpis} />

      {/* Recent Inspections Table List */}
      <RecentInspectionsList inspections={inspections} />
    </div>
  );
};
