import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout.tsx';
import { ToastContainer } from './components/ui/ToastContainer.tsx';
import { AuthGuard } from './components/layout/AuthGuard.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Analytics from './pages/Analytics.tsx';
import SemesterVault from './pages/SemesterVault.tsx';
import Recommendations from './pages/Recommendations.tsx';
import Profile from './pages/Profile.tsx';
import UploadCenter from './pages/UploadCenter.tsx';
import Attendance from './pages/Attendance.tsx';
import Assignments from './pages/Assignments.tsx';
import IntelligenceDashboard from './pages/IntelligenceDashboard.tsx';
import PrivacyPolicy from './pages/legal/PrivacyPolicy.tsx';
import TermsOfUse from './pages/legal/TermsOfUse.tsx';
import DataOwnership from './pages/legal/DataOwnership.tsx';
import Architecture from './pages/Architecture.tsx';
import AboutPage from './pages/About.tsx';

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
      <ToastContainer />
      </MotionConfig>
    </ErrorBoundary>
  );
}

export default App;

