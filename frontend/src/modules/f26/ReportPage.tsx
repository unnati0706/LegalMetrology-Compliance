import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../shared/api/client.js';
import { Inspection, CheckResult, Declaration, ReportRecord } from '../../shared/types/index.js';
import { RoleGate } from '../../shared/auth/RoleGate.js';
import { ReportPreview } from './ReportPreview.js';
import { ReportGenerateButton } from './ReportGenerateButton.js';
import { ReportDownloadLink } from './ReportDownloadLink.js';
import { ReportEditableFieldsForm } from './ReportEditableFieldsForm.js';
import { FileSpreadsheet, AlertCircle, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';

export const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [selectedInspectionId, setSelectedInspectionId] = useState<string>(id || 'insp-sample-01');
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [latestReport, setLatestReport] = useState<ReportRecord | undefined>(undefined);
  
  const [options, setOptions] = useState({
    includeEvidenceThumbnails: true,
    legalNoticeHeader: true,
    officerRemarks: 'Statutory compliance verification executed in accordance with Legal Metrology Act, 2009.',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const loadData = async (targetId: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const allInspRes = await apiClient.getInspections();
      setInspections(allInspRes.items);

      const inspData = await apiClient.getInspectionHeatmapData(targetId);
      setInspection(inspData.inspection);
      setChecks(inspData.checks);
      setDeclarations(inspData.declarations);

      const reportsRes = await apiClient.getReports(targetId);
      setReports(reportsRes);
      setLatestReport(reportsRes[0]);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const targetId = id || selectedInspectionId;
    setSelectedInspectionId(targetId);
    loadData(targetId);
  }, [id]);

  const handleGenerate = async (format: 'PDF' | 'JSON' | 'CSV') => {
    if (!inspection) return;
    try {
      const newRep = await apiClient.generateReport({
        inspectionId: inspection.id,
        format,
        includeEvidenceThumbnails: options.includeEvidenceThumbnails,
        legalNoticeHeader: options.legalNoticeHeader,
        officerRemarks: options.officerRemarks,
      });

      setReports(prev => [newRep, ...prev]);
      setLatestReport(newRep);
      setFeedbackToast(`Report ${newRep.version} (${format}) generated with SHA-256 integrity seal.`);
      setTimeout(() => setFeedbackToast(null), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to generate report');
    }
  };

  const handleSelectChange = (newId: string) => {
    setSelectedInspectionId(newId);
    navigate(`/inspections/${newId}/report`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Breadcrumb & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button 
            type="button"
            onClick={() => navigate('/inspections')} 
            className="btn btn-secondary"
            style={{ marginBottom: '0.5rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
          >
            <ArrowLeft size={14} /> Back to Inspections
          </button>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileSpreadsheet color="var(--color-primary-light)" />
            Report Generation & Export (F26)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            Compile tamper-evident statutory compliance certificates, compounding notices, and audit payloads.
          </p>
        </div>

        {/* Inspection Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label htmlFor="report-insp-select" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Target Inspection:
          </label>
          <select
            id="report-insp-select"
            value={selectedInspectionId}
            onChange={(e) => handleSelectChange(e.target.value)}
            className="form-input"
            style={{ width: 'auto', minWidth: '220px' }}
          >
            {inspections.map(i => (
              <option key={i.id} value={i.id}>
                {i.productName} ({i.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {feedbackToast && (
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
          <span>{feedbackToast}</span>
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
          <button 
            type="button"
            onClick={() => loadData(selectedInspectionId)} 
            className="btn btn-secondary" 
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-lg)' }} />
        </div>
      ) : inspection ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '1.5rem', alignItems: 'flex-start' }}>
          {/* Main Column: Live Report Preview */}
          <div>
            <ReportPreview 
              inspection={inspection}
              checks={checks}
              declarations={declarations}
              report={latestReport}
              customOptions={options}
            />
          </div>

          {/* Right Column: Actions & Configuration */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Generate & Export</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Create digitally certified export with SHA-256 cryptographic seal for administrative or judicial record.
              </p>
              
              <RoleGate allowedRoles={['INSPECTOR', 'SUPERVISOR', 'ADMIN']} fallback={<p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Export restricted to enforcement personnel.</p>}>
                <ReportGenerateButton
                  inspectionId={inspection.id}
                  onGenerate={handleGenerate}
                />
              </RoleGate>
            </div>

            {/* Editable Fields Form */}
            <RoleGate allowedRoles={['INSPECTOR', 'SUPERVISOR', 'ADMIN']}>
              <ReportEditableFieldsForm 
                options={options}
                onChange={setOptions}
              />
            </RoleGate>

            {/* Latest Generated Downloads */}
            {reports.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Generated Report Archives ({reports.length})
                </h4>
                {reports.map((rep) => (
                  <ReportDownloadLink key={rep.id} report={rep} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <AlertCircle size={40} color="var(--color-warning)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>No inspection record loaded</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Select an inspection from the dropdown above to view and generate reports.</p>
        </div>
      )}
    </div>
  );
};
