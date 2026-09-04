import React from 'react';
import { Inbox, Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon
}) => {
  return (
    <div
      className="card"
      style={{
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        background: 'var(--color-surface)',
        border: '1px dashed var(--color-border)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '1rem 0'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--color-background)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-secondary)',
          marginBottom: '1rem',
          border: '1px solid var(--color-border)'
        }}
      >
        {icon || <Inbox size={28} />}
      </div>

      <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-text)' }}>
        {title}
      </h3>
      <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)', maxWidth: '420px', lineHeight: '1.4' }}>
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', padding: '0.5rem 1.25rem' }}
        >
          <Plus size={16} /> {actionLabel}
        </button>
      )}
    </div>
  );
};
