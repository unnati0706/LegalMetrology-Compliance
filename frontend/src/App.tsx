import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './shared/auth/AuthContext.js';
import { Layout } from './shared/components/Layout.js';

// Module Pages F21 - F25
import { HeatmapPage } from './modules/f21/HeatmapPage.js';
import { ManualReviewPage } from './modules/f22/ManualReviewPage.js';
import { NotesPage } from './modules/f23/NotesPage.js';
import { FinalizePage } from './modules/f24/FinalizePage.js';
import { InspectionsPage } from './modules/f25/InspectionsPage.js';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/inspections" replace />} />
            
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

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/inspections" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
