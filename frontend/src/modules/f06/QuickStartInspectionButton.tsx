import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Camera } from 'lucide-react';

export const QuickStartInspectionButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/inspections/new')}
      className="btn btn-primary"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        fontWeight: 700,
        fontSize: '0.9375rem',
        borderRadius: '10px',
        boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)'
      }}
    >
      <Camera size={18} />
      <span>Start New Inspection</span>
    </button>
  );
};
