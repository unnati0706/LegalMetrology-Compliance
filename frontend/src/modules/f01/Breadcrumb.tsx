import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

export const Breadcrumb: React.FC<{ customItems?: BreadcrumbItem[] }> = ({ customItems }) => {
  const location = useLocation();

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) return customItems;

    const segments = location.pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [{ label: 'Home', path: '/' }];

    let currentPath = '';
    segments.forEach((seg) => {
      currentPath += `/${seg}`;
      const formattedLabel = seg
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
      items.push({ label: formattedLabel, path: currentPath });
    });

    return items;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.8125rem',
        color: 'var(--color-text-secondary)',
        marginBottom: '1rem',
        flexWrap: 'wrap'
      }}
    >
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <React.Fragment key={item.path}>
            {index > 0 && <ChevronRight size={13} style={{ opacity: 0.5 }} />}
            {isLast ? (
              <span
                style={{ fontWeight: 600, color: 'var(--color-text)' }}
                aria-current="page"
              >
                {index === 0 ? <Home size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> : item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                style={{
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem'
                }}
              >
                {index === 0 && <Home size={14} />}
                <span>{item.label}</span>
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
