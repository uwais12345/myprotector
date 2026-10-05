// ============================================================
// ConnectDesk — Enterprise Contact Directory Application
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/stores/ThemeContext';
import { AuthProvider } from '@/stores/AuthContext';
import { ContactsProvider } from '@/stores/ContactsContext';
import { ToastProvider } from '@/stores/ToastContext';
import { ToastContainer } from '@/components/ui';
import {
  LoginPage,
  ForgotPasswordPage,
  RequireAuth,
} from '@/components/auth/AuthPages';
import {
  ContactsPage,
  FavoritesPage,
  EmergencyPage,
  ImportPageWrapper,
  SettingsPageWrapper,
} from '@/pages';
import { ROUTES } from '@/constants';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ContactsProvider>
            <ToastProvider>
              <ToastContainer />
              <Routes>
                {/* Public Authentication Routes */}
                <Route path={ROUTES.login} element={<LoginPage />} />
                <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />

                {/* Protected Application Workspace */}
                <Route
                  path={ROUTES.contacts}
                  element={
                    <RequireAuth>
                      <ContactsPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path={ROUTES.contactDetail}
                  element={
                    <RequireAuth>
                      <ContactsPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path={ROUTES.favorites}
                  element={
                    <RequireAuth>
                      <FavoritesPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path={ROUTES.emergency}
                  element={
                    <RequireAuth>
                      <EmergencyPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path={ROUTES.importContacts}
                  element={
                    <RequireAuth>
                      <ImportPageWrapper />
                    </RequireAuth>
                  }
                />
                <Route
                  path={ROUTES.settings}
                  element={
                    <RequireAuth>
                      <SettingsPageWrapper />
                    </RequireAuth>
                  }
                />

                {/* Default redirect to contacts */}
                <Route path="/" element={<Navigate to={ROUTES.contacts} replace />} />
                <Route path="*" element={<Navigate to={ROUTES.contacts} replace />} />
              </Routes>
            </ToastProvider>
          </ContactsProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
