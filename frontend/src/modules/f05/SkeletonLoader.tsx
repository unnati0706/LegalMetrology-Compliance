import React from 'react';

interface SkeletonLoaderProps {
  type?: 'card' | 'table-row' | 'text' | 'image';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'card',
  count = 1
}) => {
  const items = Array.from({ length: count });

  if (type === 'table-row') {
    return (
      <>
        {items.map((_, i) => (
          <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
            <td colSpan={6} style={{ padding: '1rem' }}>
              <div
                style={{
                  height: '24px',
                  background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
                  backgroundSize: '200% 100%',
                  borderRadius: '6px',
                  animation: 'shimmer 1.5s infinite'
                }}
              />
            </td>
          </tr>
        ))}
      </>
    );
  }

  if (type === 'text') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.map((_, i) => (
          <div
            key={i}
            style={{
              height: '16px',
              width: i === count - 1 && count > 1 ? '60%' : '100%',
              background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
              backgroundSize: '200% 100%',
              borderRadius: '4px',
              animation: 'shimmer 1.5s infinite'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
      {items.map((_, i) => (
        <div
          key={i}
          className="card"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          <div
            style={{
              height: '20px',
              width: '40%',
              background: '#e2e8f0',
              borderRadius: '4px'
            }}
          />
          <div
            style={{
              height: '16px',
              width: '80%',
              background: '#f1f5f9',
              borderRadius: '4px'
            }}
          />
          <div
            style={{
              height: '40px',
              width: '100%',
              background: '#f8fafc',
              borderRadius: '6px',
              marginTop: '0.5rem'
            }}
          />
        </div>
      ))}
    </div>
  );
};
