import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../shared/auth/AuthContext.js';

// F01 Components
import { DesignTokensViewer } from '../modules/f01/DesignTokens.js';
import { ThemeProvider, useTheme } from '../modules/f01/ThemeProvider.js';
import { Breadcrumb } from '../modules/f01/Breadcrumb.js';
import { NotificationProvider, useNotifications } from '../modules/f01/NotificationCenter.js';
import { TopNav } from '../modules/f01/TopNav.js';
import { SideNav } from '../modules/f01/SideNav.js';
import { DashboardPage } from '../modules/f01/DashboardPage.js';

// F02 Components
import { RoleGate } from '../modules/f02/RoleGate.js';
import { LoginForm } from '../modules/f02/LoginForm.js';
import { IdleSessionWarning } from '../modules/f02/IdleSessionWarning.js';
import { UnauthorizedPage } from '../modules/f02/UnauthorizedPage.js';

// F03 Components
import { GlobalErrorBoundary } from '../modules/f03/GlobalErrorBoundary.js';
import { RequestInterceptor } from '../modules/f03/RequestInterceptor.js';

// F04 Components
import { ValidationSchemaRegistry } from '../modules/f04/ValidationSchemaRegistry.js';
import { FormField } from '../modules/f04/FormField.js';
import { FormWrapper } from '../modules/f04/FormWrapper.js';
import { FileUploadField } from '../modules/f04/FileUploadField.js';

// F05 Components
import { SkeletonLoader } from '../modules/f05/SkeletonLoader.js';
import { EmptyState } from '../modules/f05/EmptyState.js';
import { ErrorState } from '../modules/f05/ErrorState.js';
import { OfflineBanner } from '../modules/f05/OfflineBanner.js';
import { A11yLiveRegion } from '../modules/f05/A11yLiveRegion.js';

describe('Frontend Modules F01 - F05 Component Suite', () => {
  /* ============================================================
     F01: Application Shell, Routing & Design System
     ============================================================ */
  describe('F01: Application Shell & Design System', () => {
    it('renders DesignTokensViewer with color tokens', () => {
      render(<DesignTokensViewer />);
      expect(screen.getByText(/Legal Metrology Design Tokens/i)).toBeInTheDocument();
      expect(screen.getByText('primary')).toBeInTheDocument();
      expect(screen.getByText('#4f46e5')).toBeInTheDocument();
    });

    it('renders Breadcrumb with path navigation', () => {
      render(
        <BrowserRouter>
          <Breadcrumb customItems={[{ label: 'Home', path: '/' }, { label: 'Inspections', path: '/inspections' }]} />
        </BrowserRouter>
      );
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Inspections')).toBeInTheDocument();
    });

    it('renders TopNav with brand, theme toggle and role selector', () => {
      render(
        <AuthProvider>
          <ThemeProvider>
            <BrowserRouter>
              <TopNav />
            </BrowserRouter>
          </ThemeProvider>
        </AuthProvider>
      );
      expect(screen.getByText(/Legal Metrology DoCA/i)).toBeInTheDocument();
      expect(screen.getByText(/Role:/i)).toBeInTheDocument();
    });

    it('renders SideNav and displays navigation links', () => {
      render(
        <AuthProvider>
          <BrowserRouter>
            <SideNav />
          </BrowserRouter>
        </AuthProvider>
      );
      expect(screen.getByText(/Overview Dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/Inspections & Search/i)).toBeInTheDocument();
    });

    it('renders DashboardPage with workflow cards', () => {
      render(
        <AuthProvider>
          <BrowserRouter>
            <DashboardPage />
          </BrowserRouter>
        </AuthProvider>
      );
      expect(screen.getByText(/Legal Metrology Compliance Platform/i)).toBeInTheDocument();
      expect(screen.getByText(/Field Inspections & OCR/i)).toBeInTheDocument();
    });
  });

  /* ============================================================
     F02: Authentication, Session & RBAC UI
     ============================================================ */
  describe('F02: Authentication, Session & RBAC UI', () => {
    it('renders RoleGate and restricts content based on role', () => {
      render(
        <AuthProvider>
          <RoleGate allowedRoles={['SUPERVISOR', 'ADMIN']} fallback={<div>Access Restricted</div>}>
            <div>Supervisor Secret Panel</div>
          </RoleGate>
        </AuthProvider>
      );
      // Default auth role is INSPECTOR, so fallback should show
      expect(screen.getByText('Access Restricted')).toBeInTheDocument();
    });

    it('renders LoginForm and handles quick role selection', () => {
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      );
      expect(screen.getByText(/Departmental Sign-In/i)).toBeInTheDocument();
      const adminBtn = screen.getByRole('button', { name: /System Admin/i });
      fireEvent.click(adminBtn);
      expect(screen.getByDisplayValue('admin@doca.gov.in')).toBeInTheDocument();
    });

    it('renders IdleSessionWarning and triggers stay-logged-in', () => {
      const handleExtend = vi.fn();
      const handleLogout = vi.fn();

      render(
        <AuthProvider>
          <IdleSessionWarning onExtendSession={handleExtend} onLogout={handleLogout} />
        </AuthProvider>
      );

      expect(screen.getByText(/Session Inactivity Warning/i)).toBeInTheDocument();
      const extendBtn = screen.getByRole('button', { name: /Keep Working & Stay Logged In/i });
      fireEvent.click(extendBtn);
      expect(handleExtend).toHaveBeenCalled();
    });

    it('renders UnauthorizedPage with 403 status', () => {
      render(
        <AuthProvider>
          <BrowserRouter>
            <UnauthorizedPage />
          </BrowserRouter>
        </AuthProvider>
      );
      expect(screen.getByText(/403 - Restricted Access/i)).toBeInTheDocument();
    });
  });

  /* ============================================================
     F03: API Client & Global Data Layer
     ============================================================ */
  describe('F03: API Client & Global Data Layer', () => {
    it('renders GlobalErrorBoundary fallback when child throws', () => {
      const ThrowingComponent = () => {
        throw new Error('Test statutory vision crash');
      };

      // Suppress console.error in vitest output for intentional error
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <GlobalErrorBoundary>
          <ThrowingComponent />
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/Statutory Platform Exception Caught/i)).toBeInTheDocument();
      expect(screen.getByText(/Test statutory vision crash/i)).toBeInTheDocument();
      spy.mockRestore();
    });

    it('RequestInterceptor sets request ID and client headers', () => {
      const intercepted = RequestInterceptor.applyInterceptors('/api/v1/inspections', { method: 'GET' });
      const headers = intercepted.init.headers as Headers;
      expect(headers.get('X-Request-ID')).toBeDefined();
      expect(headers.get('X-Client-Timestamp')).toBeDefined();
    });
  });

  /* ============================================================
     F04: Global State, Forms & Validation Infrastructure
     ============================================================ */
  describe('F04: Global State, Forms & Validation Infrastructure', () => {
    it('validates PCR 2011 MRP and Net Quantity schemas', () => {
      expect(ValidationSchemaRegistry.validateMrp('₹140.00').isValid).toBe(true);
      expect(ValidationSchemaRegistry.validateMrp('-50').isValid).toBe(false);

      expect(ValidationSchemaRegistry.validateNetQuantity('500 g').isValid).toBe(true);
      expect(ValidationSchemaRegistry.validateNetQuantity('500 boxes').isValid).toBe(false);

      expect(ValidationSchemaRegistry.validateUnitSalePrice('₹0.28 / g').isValid).toBe(true);
    });

    it('renders FormField with label and error state', () => {
      render(
        <FormField id="mrp-field" label="Maximum Retail Price" required error="MRP is mandatory">
          <input id="mrp-field" />
        </FormField>
      );
      expect(screen.getByText('Maximum Retail Price')).toBeInTheDocument();
      expect(screen.getByText('MRP is mandatory')).toBeInTheDocument();
    });

    it('renders FormWrapper and invokes submit handler', () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());
      render(
        <FormWrapper onSubmit={handleSubmit} submitLabel="Save Declaration">
          <div>Form Inputs</div>
        </FormWrapper>
      );
      const submitBtn = screen.getByRole('button', { name: /Save Declaration/i });
      fireEvent.click(submitBtn);
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('renders FileUploadField and accepts files', () => {
      const handleFile = vi.fn();
      render(<FileUploadField label="Package Front Face" onFileSelect={handleFile} />);
      expect(screen.getByText(/Click to browse or drag & drop packaging image/i)).toBeInTheDocument();
    });
  });

  /* ============================================================
     F05: Accessibility, Responsive & Error-Handling Foundation
     ============================================================ */
  describe('F05: Accessibility, Responsive & Error-Handling Foundation', () => {
    it('renders SkeletonLoader placeholders', () => {
      render(<SkeletonLoader type="card" count={3} />);
      expect(document.querySelectorAll('.card').length).toBe(3);
    });

    it('renders EmptyState with action CTA', () => {
      const handleAction = vi.fn();
      render(
        <EmptyState
          title="No Inspections Found"
          description="Start a new field audit."
          actionLabel="Create Inspection"
          onAction={handleAction}
        />
      );
      expect(screen.getByText('No Inspections Found')).toBeInTheDocument();
      const actionBtn = screen.getByRole('button', { name: /Create Inspection/i });
      fireEvent.click(actionBtn);
      expect(handleAction).toHaveBeenCalled();
    });

    it('renders ErrorState with retry trigger', () => {
      const handleRetry = vi.fn();
      render(<ErrorState message="Could not connect to DoCA central registry" onRetry={handleRetry} />);
      expect(screen.getByText(/Could not connect to DoCA central registry/i)).toBeInTheDocument();
      const retryBtn = screen.getByRole('button', { name: /Retry Operation/i });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalled();
    });

    it('renders A11yLiveRegion for screen reader announcements', () => {
      render(<A11yLiveRegion message="Field capture completed" politeness="polite" />);
      expect(screen.getByText('Field capture completed')).toBeInTheDocument();
    });
  });
});
