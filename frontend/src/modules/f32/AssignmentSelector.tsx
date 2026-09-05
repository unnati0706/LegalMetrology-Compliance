import React, { useState } from 'react';
import { UserCheck, Shield, AlertCircle } from 'lucide-react';
import { EnforcementCase } from '../../shared/types/index.js';

interface AssignmentSelectorProps {
  currentInspectorId: string;
  currentPriority: EnforcementCase['priority'];
  onAssign: (inspectorId: string, inspectorName: string, priority: EnforcementCase['priority']) => void;
  disabled?: boolean;
}

export const AssignmentSelector: React.FC<AssignmentSelectorProps> = ({
  currentInspectorId,
  currentPriority,
  onAssign,
  disabled = false,
}) => {
  const inspectors = [
    { id: 'usr-inspector-01', name: 'Inspector Amit Patel (Zone 1)' },
    { id: 'usr-inspector-02', name: 'Inspector Rajesh Sharma (Zone 2)' },
    { id: 'usr-inspector-03', name: 'Inspector Sunita Rao (Zone 3)' },
    { id: 'usr-inspector-04', name: 'Special Enforcement Squad Alpha' },
  ];

  const [selectedInspectorId, setSelectedInspectorId] = useState(currentInspectorId);
  const [selectedPriority, setSelectedPriority] = useState<EnforcementCase['priority']>(currentPriority);

  const handleApply = () => {
    const insp = inspectors.find(i => i.id === selectedInspectorId);
    if (insp) {
      onAssign(insp.id, insp.name, selectedPriority);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}>
        <UserCheck size={16} color="var(--color-primary-light)" />
        <span>Reassign Case Officer & Priority</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
            Officer
          </label>
          <select
            value={selectedInspectorId}
            onChange={(e) => setSelectedInspectorId(e.target.value)}
            disabled={disabled}
            className="form-input"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
          >
            {inspectors.map(i => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
            Priority
          </label>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as EnforcementCase['priority'])}
            disabled={disabled}
            className="form-input"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
          >
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={handleApply}
        disabled={disabled}
        className="btn btn-primary"
        style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', alignSelf: 'flex-start' }}
      >
        Update Assignment
      </button>
    </div>
  );
};
