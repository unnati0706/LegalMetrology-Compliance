import React from 'react';
import { Camera, ShieldCheck, FileText, Layers, Settings, CheckCircle2, AlertTriangle, HelpCircle, FileSpreadsheet, Database, TrendingUp, ArrowRight } from 'lucide-react';

interface StatutoryWorkflowPipelineProps {
  currentStep?: number; // 1 to 11
  status?: 'COMPLIANT' | 'FLAGGED' | 'MANUAL_REVIEW';
}

export const StatutoryWorkflowPipeline: React.FC<StatutoryWorkflowPipelineProps> = ({
  currentStep = 11,
  status = 'COMPLIANT'
}) => {
  const steps = [
    { num: 1, title: '1. Capture Evidence', desc: 'Front + Back + Side', icon: Camera },
    { num: 2, title: '2. Quality Gate', desc: 'Blur / Glare / Crop / Framing', icon: ShieldCheck, badge: 'Image OK: Yes' },
    { num: 3, title: '3. OCR + Vision', desc: 'Text + regions + confidence', icon: FileText },
    { num: 4, title: '4. Structure Fields', desc: 'MRP / Quantity / Mfg / Dates', icon: Layers },
    { num: 5, title: '5. Applicability Layer', desc: 'Product context -> Relevant rules', icon: Settings },
    { num: 6, title: '6. Versioned Rule Engine', desc: 'Deterministic compliance checks', icon: Settings },
    {
      num: 7,
      title: '7. Confidence Gate',
      desc: status === 'COMPLIANT' ? 'PASS (Compliant)' : status === 'FLAGGED' ? 'FLAG (Non-Compliant)' : 'REVIEW (Manual Review)',
      icon: status === 'COMPLIANT' ? CheckCircle2 : status === 'FLAGGED' ? AlertTriangle : HelpCircle
    },
    { num: 8, title: '8. Evidence + Report', desc: 'Finding + Evidence + Rule', icon: FileSpreadsheet },
    { num: 9, title: '9. History / Records', desc: 'Searchable + Auditable', icon: Database },
    { num: 10, title: '10. Risk-Based Prioritization', desc: 'Patterns -> Risk Score', icon: TrendingUp },
    { num: 11, title: '11. Inspect Next', desc: 'Higher-risk targets', icon: ArrowRight }
  ];

  return (
    <div className="card" style={{
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      color: '#f8fafc',
      borderRadius: '12px',
      padding: '1.25rem 1.5rem',
      marginBottom: '1.5rem',
      border: '1px solid #334155',
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#38bdf8', fontWeight: 700 }}>
            End-to-End Legal Metrology Inspection Flow
          </div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
            11-Step Statutory Verification Pipeline
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#020617', padding: '0.35rem 0.75rem', borderRadius: '20px', border: '1px solid #334155', fontSize: '0.75rem', fontWeight: 600, color: '#38bdf8' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
          Pipeline Verified & Active
        </div>
      </div>

      {/* Grid of Steps */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '0.75rem'
      }}>
        {steps.map((step) => {
          const isActive = step.num <= currentStep;
          const isCurrent = step.num === currentStep;

          return (
            <div
              key={step.num}
              style={{
                background: isCurrent ? 'rgba(56, 189, 248, 0.15)' : isActive ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)',
                border: isCurrent ? '1.5px solid #38bdf8' : isActive ? '1px solid #334155' : '1px dashed #1e293b',
                borderRadius: '8px',
                padding: '0.65rem 0.75rem',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <div style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: isCurrent ? '#38bdf8' : isActive ? '#10b981' : '#334155',
                  color: isCurrent ? '#0f172a' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 700
                }}>
                  {isActive && !isCurrent ? '✓' : step.num}
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isCurrent ? '#38bdf8' : isActive ? '#f8fafc' : '#64748b' }}>
                  {step.title.split('. ')[1]}
                </div>
              </div>
              <div style={{ fontSize: '0.7rem', color: isCurrent ? '#cbd5e1' : isActive ? '#94a3b8' : '#475569', lineHeight: '1.3' }}>
                {step.desc}
              </div>

              {step.badge && (
                <span style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  fontSize: '0.6rem',
                  background: '#065f46',
                  color: '#a7f3d0',
                  padding: '0.1rem 0.35rem',
                  borderRadius: '4px',
                  fontWeight: 700
                }}>
                  {step.badge}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
