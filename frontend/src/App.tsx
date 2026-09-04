import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './shared/auth/AuthContext.js';
import { Layout } from './shared/components/Layout.js';

// Foundation Modules F01 - F05
import { DashboardPage } from './modules/f01/DashboardPage.js';
import { LoginPage } from './modules/f02/LoginPage.js';
import { ForgotPasswordPage } from './modules/f02/ForgotPasswordPage.js';
import { UnauthorizedPage } from './modules/f02/UnauthorizedPage.js';
import { SessionProvider } from './modules/f02/SessionProvider.js';
import { GlobalErrorBoundary } from './modules/f03/GlobalErrorBoundary.js';
import { QueryClientProvider } from './modules/f03/QueryClientProvider.js';
import { AppStoreProvider } from './modules/f04/AppStore.js';
import { PwaRegistration } from './modules/f05/PwaRegistration.js';

// Module Pages F21 - F25

import { HeatmapPage } from './modules/f21/HeatmapPage.js';
import { ManualReviewPage } from './modules/f22/ManualReviewPage.js';
import { NotesPage } from './modules/f23/NotesPage.js';
import { FinalizePage } from './modules/f24/FinalizePage.js';
import { InspectionsPage } from './modules/f25/InspectionsPage.js';

// Module Pages F26 - F30
import { ReportPage } from './modules/f26/ReportPage.js';
import { EvidenceLockerPage } from './modules/f27/EvidenceLockerPage.js';
import { ReportsHistoryPage } from './modules/f27/ReportsHistoryPage.js';
import { EnforcementDashboardPage } from './modules/f28/EnforcementDashboardPage.js';
import { ViolationAnalyticsPage } from './modules/f29/ViolationAnalyticsPage.js';
import { PatternsPage } from './modules/f30/PatternsPage.js';

// Module Pages F31 - F35
import { GeographicRiskPage } from './modules/f31/GeographicRiskPage.js';
import { CasesWorkflowPage } from './modules/f32/CasesWorkflowPage.js';
import { InspectNextPage } from './modules/f33/InspectNextPage.js';
import { ManufacturerDashboardPage } from './modules/f34/ManufacturerDashboardPage.js';
import { ProductLibraryPage } from './modules/f35/ProductLibraryPage.js';

// Module Pages F36 - F40
import { PreComplianceScanPage } from './modules/f36/PreComplianceScanPage.js';
import { BeforeAfterRescanPage } from './modules/f37/BeforeAfterRescanPage.js';
import { ProductComplianceHistoryPage } from './modules/f37/ProductComplianceHistoryPage.js';
import { OfflineQueuePage } from './modules/f38/OfflineQueuePage.js';
import { ExplainableEvidencePage } from './modules/f39/ExplainableEvidencePage.js';
import { InspectionTimelinePage } from './modules/f39/InspectionTimelinePage.js';
import { SmartReportPage } from './modules/f40/SmartReportPage.js';

export const App: React.FC = () => {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider>
        <AppStoreProvider>
          <AuthProvider>
            <SessionProvider>
              <BrowserRouter>
                <Layout>
                  <PwaRegistration />
                  <Routes>
                    {/* F01: Overview & Foundation */}
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />

                    {/* F02: Authentication & RBAC */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />
                    
                    {/* F25: Inspection History & Search */}
                    <Route path="/inspections" element={<InspectionsPage />} />
                    <Route path="/inspections/:id" element={<InspectionsPage />} />

                    {/* F21: Compliance Heatmap */}
                    <Route path="/heatmap" element={<HeatmapPage />} />
                    <Route path="/inspections/:id/heatmap" element={<HeatmapPage />} />

                    {/* F22: Manual Review Queue */}
                    <Route path="/manual-review" element={<ManualReviewPage />} />
                    <Route path="/inspections/:id/manual-review" element={<ManualReviewPage />} />

                    {/* F23: Inspector Notes */}
                    <Route path="/notes" element={<NotesPage />} />
                    <Route path="/inspections/:id/notes" element={<NotesPage />} />

                    {/* F24: Inspection Finalization */}
                    <Route path="/finalize" element={<FinalizePage />} />
                    <Route path="/inspections/:id/finalize" element={<FinalizePage />} />

                    {/* F26: Report Generation & Export */}
                    <Route path="/report" element={<ReportPage />} />
                    <Route path="/inspections/:id/report" element={<ReportPage />} />

                    {/* F27: Evidence Locker & Report History */}
                    <Route path="/inspections/:id/evidence-locker" element={<EvidenceLockerPage />} />
                    <Route path="/evidence-locker" element={<EvidenceLockerPage />} />
                    <Route path="/reports" element={<ReportsHistoryPage />} />

                    {/* F28: Supervisor / Enforcement Dashboard */}
                    <Route path="/enforcement/dashboard" element={<EnforcementDashboardPage />} />

                    {/* F29: Analytics: Violation Trends & Distribution */}
                    <Route path="/enforcement/analytics" element={<ViolationAnalyticsPage />} />

                    {/* F30: Manufacturer/Category Pattern Analytics */}
                    <Route path="/enforcement/patterns" element={<PatternsPage />} />

                    {/* F31: Geographic Risk Visualization */}
                    <Route path="/enforcement/map" element={<GeographicRiskPage />} />

                    {/* F32: Cases, Follow-Ups & Assignment Workflow */}
                    <Route path="/enforcement/cases" element={<CasesWorkflowPage />} />

                    {/* F33: Risk Dashboard & Inspect-Next Queue */}
                    <Route path="/enforcement/inspect-next" element={<InspectNextPage />} />

                    {/* F34: Manufacturer Dashboard */}
                    <Route path="/manufacturer/dashboard" element={<ManufacturerDashboardPage />} />

                    {/* F35: Manufacturer Product Library & Artwork Management */}
                    <Route path="/manufacturer/products" element={<ProductLibraryPage />} />
                    <Route path="/manufacturer/products/:id" element={<ProductLibraryPage />} />

                    {/* F36: Manufacturer Pre-Compliance Scan & Remediation Checklist */}
                    <Route path="/manufacturer/products/:id/scan" element={<PreComplianceScanPage />} />

                    {/* F37: Before/After Comparison & Rescan */}
                    <Route path="/manufacturer/products/:id/rescan" element={<BeforeAfterRescanPage />} />
                    <Route path="/manufacturer/products/:id/history" element={<ProductComplianceHistoryPage />} />

                    {/* F38: Offline Inspection Queue & Sync Status */}
                    <Route path="/inspections/offline-queue" element={<OfflineQueuePage />} />

                    {/* F39: Explainable Evidence Mode & Inspection Timeline */}
                    <Route path="/inspections/:id/explainable-evidence" element={<ExplainableEvidencePage />} />
                    <Route path="/inspections/:id/timeline" element={<InspectionTimelinePage />} />

                    {/* F40: Smart Report & Scan Quality Coach */}
                    <Route path="/inspections/:id/smart-report" element={<SmartReportPage />} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/inspections" replace />} />
                  </Routes>
                </Layout>
              </BrowserRouter>
            </SessionProvider>
          </AuthProvider>
        </AppStoreProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
};

export default App;


