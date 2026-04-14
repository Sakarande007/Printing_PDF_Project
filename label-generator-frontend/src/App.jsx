import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import LabelGenerator from './pages/LabelGenerator';
import AdminDashboard from './pages/AdminDashboard';

function RequireAuth({ children }) {
  const { ready, user } = useAuth();
  const location = useLocation();
  if (!ready) {
    return (
      <div className="page center-msg">
        <p>Loading…</p>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function RequireAdmin({ children }) {
  const { ready, user, isAdmin } = useAuth();
  if (!ready) {
    return (
      <div className="page center-msg">
        <p>Loading…</p>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
}

import ThemeToggle from './components/ThemeToggle';

export default function App() {
  return (
    <>
      <ThemeToggle />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <LabelGenerator />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
