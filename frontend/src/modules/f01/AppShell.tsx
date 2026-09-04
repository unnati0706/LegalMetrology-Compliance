import React from 'react';
import { TopNav } from './TopNav';
import { SideNav } from './SideNav';
import { Breadcrumb } from './Breadcrumb';
import { NotificationProvider } from './NotificationCenter';
import { ThemeProvider } from './ThemeProvider';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
          <TopNav />
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <SideNav />
            <main
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.5rem 2rem',
                backgroundColor: 'var(--color-background)'
              }}
            >
              <Breadcrumb />
              {children}
            </main>
          </div>
        </div>
      </NotificationProvider>
    </ThemeProvider>
  );
};
