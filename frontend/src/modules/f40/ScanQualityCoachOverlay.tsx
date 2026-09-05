import React from 'react';
import { ScanQualityMetrics } from '../../shared/types';
import { Camera, Sun, Compass, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ScanQualityCoachOverlayProps {
  metrics: ScanQualityMetrics;
}

export const ScanQualityCoachOverlay: React.FC<ScanQualityCoachOverlayProps> = ({ metrics }) => {
  return (
    <div
      className="card"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Camera size={22} color="var(--color-primary)" />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>Field Scan Quality Coach</h3>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Real-time computer vision metrics for evidentiary admissibility & OCR accuracy
            </p>
          </div>
        </div>

        <div>
          {metrics.isCourtroomReady ? (
            <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.8rem', fontSize: '0.8125rem' }}>
              <ShieldCheck size={16} /> Courtroom Admissible Evidence
            </span>
          ) : (
            <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.8rem', fontSize: '0.8125rem' }}>
              <AlertTriangle size={16} /> Needs Re-Capture Adjustment
            </span>
          )}
        </div>
      </div>

      {/* Metrics Bar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {/* Overall Quality */}
        <div style={{ padding: '0.875rem', background: 'var(--color-background)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
            <span>Overall Admissibility</span>
            <strong style={{ color: metrics.overallQuality >= 85 ? '#059669' : '#d97706' }}>{metrics.overallQuality}%</strong>
          </div>
          <div style={{ height: '6px', background: 'var(--color-border)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: `${metrics.overallQuality}%`, height: '100%', background: metrics.overallQuality >= 85 ? '#10b981' : '#f59e0b' }} />
          </div>
        </div>

        {/* Glare & Reflection */}
        <div style={{ padding: '0.875rem', background: 'var(--color-background)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
            <span>Anti-Glare Index</span>
            <strong style={{ color: '#059669' }}>{metrics.glareScore}%</strong>
          </div>
          <div style={{ height: '6px', background: 'var(--color-border)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: `${metrics.glareScore}%`, height: '100%', background: '#10b981' }} />
          </div>
        </div>

        {/* Lighting & Contrast */}
        <div style={{ padding: '0.875rem', background: 'var(--color-background)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
            <span>Lighting & Contrast</span>
            <strong style={{ color: '#059669' }}>{metrics.lightingScore}%</strong>
          </div>
          <div style={{ height: '6px', background: 'var(--color-border)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: `${metrics.lightingScore}%`, height: '100%', background: '#10b981' }} />
          </div>
        </div>

        {/* Skew Angle */}
        <div style={{ padding: '0.875rem', background: 'var(--color-background)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
            <span>Skew Angle</span>
            <strong style={{ color: metrics.skewAngle < 3 ? '#059669' : '#dc2626' }}>{metrics.skewAngle}° (Optimal &lt; 3°)</strong>
          </div>
          <div style={{ height: '6px', background: 'var(--color-border)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.max(10, 100 - metrics.skewAngle * 10)}%`, height: '100%', background: '#10b981' }} />
          </div>
        </div>
      </div>

      {/* AI Coaching Tips */}
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#166534', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          <Sparkles size={16} /> Live Coaching Recommendations:
        </div>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem', color: '#14532d' }}>
          {metrics.coachingTips.map((tip, idx) => (
            <li key={idx} style={{ marginBottom: '0.25rem' }}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
