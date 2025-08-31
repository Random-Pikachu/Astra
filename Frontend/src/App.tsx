import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AuthProvider } from './contexts/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import OAuthCallback from './components/OAuthCallback';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import Dependencies from './pages/Dependencies';
import DependencyDetails from './pages/DependencyDetails';

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* OAuth callback route - handles Google OAuth redirect */}
            <Route path="/auth/callback" element={<OAuthCallback />} />

            {/* Public routes - redirect to dashboard if already logged in */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              }
            />

            {/* Protected routes - require authentication */}
            <Route
              path="/welcome"
              element={
                <ProtectedRoute>
                  <Welcome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dependencies/:repoId"
              element={
                <ProtectedRoute>
                  <Dependencies />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dependency-details/:repoCode/:dependencyCode"
              element={
                <ProtectedRoute>
                  <DependencyDetails />
                </ProtectedRoute>
              }
            />

            {/* Root route - redirect based on authentication status */}
            <Route
              path="/"
              element={<Navigate to="/dashboard" replace />}
            />
          </Routes>
        </Router>


      </AuthProvider>
    </Provider>
  );
}

export default App;