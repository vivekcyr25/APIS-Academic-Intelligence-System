import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout.tsx';
import { AuthGuard } from './components/layout/AuthGuard.tsx';

// --- AUTH PAGES ---
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';

// --- CORE DASHBOARD (EAGER LOADED) ---
import Dashboard from './pages/Dashboard.tsx';

// --- HEAVY MODULES (LAZY LOADED) ---
const SemesterVault = lazy(() => import('./pages/SemesterVault.tsx'));
const Recommendations = lazy(() => import('./pages/Recommendations.tsx'));
const Profile = lazy(() => import('./pages/Profile.tsx'));
const UploadCenter = lazy(() => import('./pages/UploadCenter.tsx'));
const Attendance = lazy(() => import('./pages/Attendance.tsx'));
const Assignments = lazy(() => import('./pages/Assignments.tsx'));
const LMS = lazy(() => import('./pages/LMS.tsx'));
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

function App() {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'text-sm',
            duration: 3500,
          }}
        />
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
              <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
                <div
                  className="w-10 h-10 rounded-full border-2 border-primary/25 border-t-primary animate-spin"
                  aria-hidden
                />
                <p className="text-sm font-medium text-muted-foreground">Loading…</p>
              </div>
            </div>
          }
        >
          <Routes>
            <Route
              path="/login"
              element={
                <AuthGuard requireAuth={false}>
                  <Login />
                </AuthGuard>
              }
            />
            <Route
              path="/register"
              element={
                <AuthGuard requireAuth={false}>
                  <Register />
                </AuthGuard>
              }
            />

            <Route
              path="/"
              element={
                <AuthGuard requireAuth={true}>
                  <AppLayout />
                </AuthGuard>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="upload" element={<UploadCenter />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="lms" element={<LMS />} />
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
      </MotionConfig>
    </ErrorBoundary>
  );
}

export default App;
