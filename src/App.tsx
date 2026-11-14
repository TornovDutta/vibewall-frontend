import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ChatBot from './components/ChatBot';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPage from './pages/AdminPage';
import DashboardPage from './pages/DashboardPage';
import FeedPage from './pages/FeedPage';
import LoginPage from './pages/LoginPage';
import PollsPage from './pages/PollsPage';
import RegisterPage from './pages/RegisterPage';
import SafetyPrivacyPage from './pages/SafetyPrivacyPage';
import QAPage from './pages/QAPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth pages – no navbar */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Admin panel – no shared navbar (has its own sidebar) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="ADMIN">
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            {/* App pages – with navbar */}
            <Route
              path="/*"
              element={
                <div className="flex min-h-screen flex-col bg-vw-bg text-vw-text">
                  <Navbar />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<FeedPage />} />
                      <Route path="/polls" element={<PollsPage />} />
                      <Route path="/qa" element={<ProtectedRoute><QAPage /></ProtectedRoute>} />
                      <Route path="/wall" element={<ProtectedRoute><QAPage /></ProtectedRoute>} />
                      <Route path="/wall/:userId" element={<QAPage />} />
                      <Route path="/privacy" element={<SafetyPrivacyPage />} />
                      <Route path="/security" element={<SafetyPrivacyPage />} />
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <DashboardPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <ProfilePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </div>
              }
            />
          </Routes>

          {/* Global Floating AI Chatbot */}
          <ChatBot />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
