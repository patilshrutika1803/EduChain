import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';

// Public
import { LandingPage } from './features/public/LandingPage';
import { VerifyPage } from './features/public/VerifyPage';
import { VerificationResultPage } from './features/public/VerificationResultPage';
import { VerificationReportPage } from './features/public/VerificationReportPage';
import { NotFoundPage } from './features/public/NotFoundPage';

// Institution
import { InstitutionLoginPage } from './features/institution/LoginPage';
import { InstitutionDashboardPage } from './features/institution/DashboardPage';
import { CredentialsPage } from './features/institution/pages/CredentialsPage';
import { IssueCredentialPage } from './features/institution/pages/IssueCredentialPage';
import { CredentialDetailPage } from './features/institution/pages/CredentialDetailPage';
import { BlockchainProofPage } from './features/institution/pages/BlockchainProofPage';
import { LifecyclePage } from './features/institution/pages/LifecyclePage';
import { BatchIssuancePage } from './features/institution/pages/BatchIssuancePage';
import { RegistryPage } from './features/institution/pages/RegistryPage';
import { AnalyticsPage } from './features/institution/pages/AnalyticsPage';
import { AuditLogsPage } from './features/institution/pages/AuditLogsPage';
import { SettingsPage } from './features/institution/pages/SettingsPage';
import { BlockchainPage } from './features/institution/pages/BlockchainPage';

// Student
import { StudentLoginPage } from './features/student/LoginPage';
import { StudentDashboardPage } from './features/student/DashboardPage';
import { StudentCredentialDetailPage } from './features/student/pages/CredentialDetailPage';
import { QRSharePage } from './features/student/pages/QRSharePage';
import { StudentWalletPage } from './features/student/pages/WalletPage';
import { RequireDemoRole } from './components/auth/RequireDemoRole';

// Layout
import { AppShell } from './components/layout/AppShell';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/verify/:id" element={<VerificationResultPage />} />
          <Route path="/verify/:id/report" element={<VerificationReportPage />} />

          {/* Institution auth */}
          <Route path="/institution/login" element={<InstitutionLoginPage />} />

          {/* Institution app (sidebar shell) */}
          <Route path="/institution" element={<RequireDemoRole role="institution" />}>
            <Route element={<AppShell />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<InstitutionDashboardPage />} />
              <Route path="credentials" element={<CredentialsPage />} />
              <Route path="credentials/issue" element={<IssueCredentialPage />} />
              <Route path="credentials/batch" element={<BatchIssuancePage />} />
              <Route path="credentials/:id" element={<CredentialDetailPage />} />
              <Route path="credentials/:id/blockchain" element={<BlockchainProofPage />} />
              <Route path="credential/:id" element={<CredentialDetailPage />} />
              <Route path="credential/:id/blockchain" element={<BlockchainProofPage />} />
              <Route path="lifecycle" element={<LifecyclePage />} />
              <Route path="batch" element={<BatchIssuancePage />} />
              <Route path="registry" element={<RegistryPage />} />
              <Route path="institution-registry" element={<RegistryPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="audit" element={<AuditLogsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="blockchain" element={<BlockchainPage />} />
              <Route path="verify" element={<Navigate to="/verify" replace />} />
            </Route>
          </Route>

          {/* Student auth */}
          <Route path="/student/login" element={<StudentLoginPage />} />

          {/* Student app */}
          <Route path="/student" element={<RequireDemoRole role="student" />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboardPage />} />
            <Route path="wallet" element={<StudentWalletPage />} />
            <Route path="credentials/:id" element={<StudentCredentialDetailPage />} />
            <Route path="credentials/:id/share" element={<QRSharePage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
