import React, { useState, useEffect } from 'react';
import { apiClient } from '../../shared/api/client.js';
import { EnforcementCase, FollowUpStatus } from '../../shared/types/index.js';
import { CaseList } from './CaseList.js';
import { CaseDetailPanel } from './CaseDetailPanel.js';
import { Briefcase, RefreshCw, Filter, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CasesWorkflowPage: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<EnforcementCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<EnforcementCase | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadCases = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await apiClient.getEnforcementCases(statusFilter, priorityFilter);
      setCases(data);
      if (data.length > 0 && (!selectedCase || !data.some(c => c.id === selectedCase.id))) {
        setSelectedCase(data[0]);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load enforcement cases');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, [statusFilter, priorityFilter]);

  const handleUpdateStatus = async (caseId: string, status: FollowUpStatus, note?: string) => {
    try {
      const updated = await apiClient.updateCaseStatus(caseId, status, note);
      setCases(prev => prev.map(c => c.id === caseId ? updated : c));
      setSelectedCase(updated);
      setToastMessage(`Case milestone advanced to "${status.replace(/_/g, ' ')}"`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update case status');
    }
  };

  const handleAssign = async (inspectorId: string, inspectorName: string, priority: EnforcementCase['priority']) => {
    if (!selectedCase) return;
    try {
      const updated = await apiClient.updateCaseAssignment(selectedCase.id, inspectorId, inspectorName, priority);
      setCases(prev => prev.map(c => c.id === selectedCase.id ? updated : c));
      setSelectedCase(updated);
      setToastMessage(`Case reassigned to ${inspectorName} with ${priority} Priority.`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to reassign case');
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
            <Briefcase color="var(--color-primary-light)" />
            Enforcement Cases, Follow-Ups & Assignment
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            Manage statutory notices, compounding proceedings, inspector field assignments, and prosecution escalations.
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input"
            style={{ width: 'auto' }}
            aria-label="Filter cases by status"
          >
            <option value="ALL">All Milestones</option>
            <option value="NOTICE_PENDING">Notice Pending</option>
            <option value="HEARING_SCHEDULED">Hearing Scheduled</option>
            <option value="RE_INSPECTION_ASSIGNED">Re-Inspection Assigned</option>
            <option value="RESOLVED_COMPLIANT">Resolved Compliant</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="form-input"
            style={{ width: 'auto' }}
            aria-label="Filter cases by priority"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          <button
            type="button"
            onClick={loadCases}
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
          <button type="button" onClick={loadCases} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className="skeleton" style={{ height: '360px', borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ height: '360px', borderRadius: 'var(--radius-md)' }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'flex-start' }}>
          <div>
            <CaseList
              cases={cases}
              selectedCaseId={selectedCase?.id}
              onSelectCase={(c) => setSelectedCase(c)}
            />
          </div>

          <div>
            {selectedCase ? (
              <CaseDetailPanel
                caseItem={selectedCase}
                onUpdateStatus={handleUpdateStatus}
                onAssign={handleAssign}
              />
            ) : (
              <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>Select a case from the list to view timeline and assignment controls.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
