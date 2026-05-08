import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout.tsx';
import { ToastContainer } from './components/ui/ToastContainer.tsx';
import { AuthGuard } from './components/layout/AuthGuard.tsx';

// --- AUTH PAGES ---
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';

// --- CORE DASHBOARD (EAGER LOADED) ---
import Dashboard from './pages/Dashboard.tsx';

// --- HEAVY MODULES (LAZY LOADED) ---
const Analytics = lazy(() => import('./pages/Analytics.tsx'));
const SemesterVault = lazy(() => import('./pages/SemesterVault.tsx'));
const Recommendations = lazy(() => import('./pages/Recommendations.tsx'));
const Profile = lazy(() => import('./pages/Profile.tsx'));
const UploadCenter = lazy(() => import('./pages/UploadCenter.tsx'));
const Attendance = lazy(() => import('./pages/Attendance.tsx'));
const Assignments = lazy(() => import('./pages/Assignments.tsx'));
const IntelligenceDashboard = lazy(() => import('./pages/IntelligenceDashboard.tsx'));
const Architecture = lazy(() => import('./pages/Architecture.tsx'));
const AboutPage = lazy(() => import('./pages/About.tsx'));

// --- LEGAL PAGES ---
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy.tsx'));
const TermsOfUse = lazy(() => import('./pages/legal/TermsOfUse.tsx'));
const DataOwnership = lazy(() => import('./pages/legal/DataOwnership.tsx'));

import { Toaster } from 'react-hot-toast';
import { MotionConfig } from 'framer-motion';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { registerSW } from 'virtual:pwa-register';

// Register service worker with auto-update awareness
registerSW({
  onNeedRefresh() {
    // Refresh handled by autoUpdate
  },
  onOfflineReady() {
    // Ready for offline use
  },
});

function App() {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
      <Toaster position="bottom-right" />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#06030f]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin shadow-[0_0_15px_rgba(139,92,246,0.3)]" />
            <p className="text-sm font-black text-white/40 tracking-[0.2em] uppercase animate-pulse">Syncing Intelligence...</p>
          </div>
        </div>
      }>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={
            <AuthGuard requireAuth={false}>
              <Login />
            </AuthGuard>
          } />
          <Route path="/register" element={
            <AuthGuard requireAuth={false}>
              <Register />
            </AuthGuard>
          } />

          {/* Main Layout */}
          <Route path="/" element={
            <AuthGuard requireAuth={true}>
              <AppLayout />
            </AuthGuard>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="upload" element={<UploadCenter />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="semester-vault" element={<SemesterVault />} />
            <Route path="analytics" element={<Navigate to="/academic-intelligence" replace />} />
            <Route path="academic-intelligence" element={<IntelligenceDashboard />} />
            <Route path="recommendations" element={<Recommendations />} />
            <Route path="profile" element={<Profile />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="architecture" element={<Architecture />} />
            <Route path="legal/privacy" element={<PrivacyPolicy />} />
            <Route path="legal/terms" element={<TermsOfUse />} />
            <Route path="legal/data-ownership" element={<DataOwnership />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
      <ToastContainer />
      </MotionConfig>
    </ErrorBoundary>
  );
}

export default App;

