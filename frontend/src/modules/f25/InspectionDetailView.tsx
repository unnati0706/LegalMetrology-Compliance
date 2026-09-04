import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Inspection } from '../../shared/types/index.js';
import { Layers, CheckCircle2, FileText, Lock, X, ExternalLink, ShieldCheck, MapPin, Calendar } from 'lucide-react';

interface InspectionDetailViewProps {
  inspection: Inspection;
  onClose: () => void;
}

export const InspectionDetailView: React.FC<InspectionDetailViewProps> = ({
  inspection,
  onClose,
}) => {
  const navigate = useNavigate();

  return (
    <div className="card" style={{ border: '2px solid var(--color-primary-500)', animation: 'fadeIn 0.2s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>INSPECTION RECORD DOSSIER</div>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--text-main)' }}>{inspection.productName}</h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Category: <strong>{inspection.category}</strong> • Rule Engine: <strong>{inspection.ruleVersion}</strong>
          </div>
        </div>

        <button onClick={onClose} className="btn btn-secondary btn-sm" title="Close Drawer">
          <X size={16} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ backgroundColor: 'var(--bg-app)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Manufacturer</div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{inspection.manufacturerName}</div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-app)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Inspection Location</div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <MapPin size={14} color="var(--color-primary-500)" />
            {inspection.location || 'N/A'}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-app)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Timestamp</div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Calendar size={14} />
            {new Date(inspection.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Module Quick-Action Router Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
        <button
          onClick={() => navigate(`/inspections/${inspection.id}/heatmap`)}
          className="btn btn-primary btn-sm"
        >
          <Layers size={14} /> Open Compliance Heatmap (F21)
        </button>

        <button
          onClick={() => navigate(`/inspections/${inspection.id}/manual-review`)}
          className="btn btn-secondary btn-sm"
        >
          <CheckCircle2 size={14} /> Confidence Gate (F22)
        </button>

        <button
          onClick={() => navigate(`/inspections/${inspection.id}/notes`)}
          className="btn btn-secondary btn-sm"
        >
          <FileText size={14} /> Inspector Notes (F23)
        </button>

        <button
          onClick={() => navigate(`/inspections/${inspection.id}/finalize`)}
          className="btn btn-secondary btn-sm"
        >
          <Lock size={14} /> Finalize Disposition (F24)
        </button>
      </div>
    </div>
  );
};
