import React from 'react';
import { FollowUpStatus } from '../../shared/types/index.js';
import { Clock, Calendar, CheckCircle2, AlertOctagon, UserCheck } from 'lucide-react';

interface FollowUpStatusTagProps {
  status: FollowUpStatus;
}

export const FollowUpStatusTag: React.FC<FollowUpStatusTagProps> = ({ status }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'NOTICE_PENDING':
        return {
          label: 'Notice Pending',
          icon: <Clock size={12} />,
          bg: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
          border: 'rgba(245, 158, 11, 0.3)'
        };
      case 'HEARING_SCHEDULED':
        return {
          label: 'Hearing Scheduled',
          icon: <Calendar size={12} />,
          bg: 'rgba(147, 51, 234, 0.15)',
          color: '#c084fc',
          border: 'rgba(147, 51, 234, 0.3)'
        };
      case 'RE_INSPECTION_ASSIGNED':
        return {
          label: 'Re-Inspection Assigned',
          icon: <UserCheck size={12} />,
          bg: 'rgba(59, 130, 246, 0.15)',
          color: '#60a5fa',
          border: 'rgba(59, 130, 246, 0.3)'
        };
      case 'RESOLVED_COMPLIANT':
        return {
          label: 'Resolved / Compliant',
          icon: <CheckCircle2 size={12} />,
          bg: 'rgba(34, 197, 94, 0.15)',
          color: '#4ade80',
          border: 'rgba(34, 197, 94, 0.3)'
        };
      case 'ESCALATED_PROSECUTION':
        return {
          label: 'Prosecution Escalated',
          icon: <AlertOctagon size={12} />,
          bg: 'rgba(239, 68, 68, 0.15)',
          color: '#f87171',
          border: 'rgba(239, 68, 68, 0.3)'
        };
      default:
        return {
          label: status,
          icon: <Clock size={12} />,
          bg: 'rgba(255, 255, 255, 0.1)',
          color: '#ffffff',
          border: 'transparent'
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      fontSize: '0.75rem',
      fontWeight: 700,
      padding: '0.2rem 0.55rem',
      borderRadius: '4px',
      backgroundColor: config.bg,
      color: config.color,
      border: `1px solid ${config.border}`
    }}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
