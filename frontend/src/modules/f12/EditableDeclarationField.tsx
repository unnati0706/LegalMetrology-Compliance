import React, { useState } from 'react';
import { Declaration } from '../../shared/types/index.js';

interface EditableDeclarationFieldProps {
  declaration: Declaration;
  onSave: (id: string, newValue: string) => Promise<void> | void;
}

export const EditableDeclarationField: React.FC<EditableDeclarationFieldProps> = ({ declaration, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(declaration.value);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(declaration.id, value);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(declaration.value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
        <input 
          type="text" 
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="form-input"
          style={{ 
            fontSize: '0.9rem', 
            padding: '4px 8px', 
            flex: 1, 
            borderRadius: '4px',
            border: '1px solid var(--primary-500, #3b82f6)' 
          }}
          autoFocus
        />
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="btn btn-primary"
          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button 
          onClick={handleCancel}
          className="btn btn-secondary"
          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', width: '100%' }}>
      <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
        {declaration.value || <em style={{ color: 'var(--text-muted)' }}>Missing / Not detected</em>}
      </span>
      <button 
        onClick={() => setIsEditing(true)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--primary-600, #2563eb)',
          cursor: 'pointer',
          fontSize: '0.8rem',
          padding: '2px 6px',
          borderRadius: '4px',
          textDecoration: 'underline'
        }}
        title="Edit OCR extracted value"
      >
        Edit
      </button>
    </div>
  );
};
