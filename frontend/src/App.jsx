import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import UserManagement from './pages/UserManagement';
import ActivityLogs from './pages/ActivityLogs';
import Dashboard from './pages/Dashboard';
import Products from './pages/products';
import Sales from './pages/Sales';
import LowStocks from './pages/LowStocks';
import Popular from './pages/Popular';
import Cart from './pages/cart';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RoleRoute requiredRole="admin">
                  <Dashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales"
            element={
              <ProtectedRoute>
                <RoleRoute requiredRole="admin">
                  <Sales />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/lowStocks"
            element={
              <ProtectedRoute>
                <LowStocks />
              </ProtectedRoute>
            }
          />

          <Route
            path="/popular"
            element={
              <ProtectedRoute>
                <RoleRoute requiredRole="admin">
                  <Popular />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <RoleRoute requiredRole="admin">
                  <UserManagement />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/activity-logs"
            element={
              <ProtectedRoute>
                <RoleRoute requiredRole="admin">
                  <ActivityLogs />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
