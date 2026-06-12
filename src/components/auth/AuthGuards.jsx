import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "../shared";

export function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export function RoleRoute({ children, role }) {
  const { user, userDoc, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (userDoc && userDoc.role !== role) {
    return <Navigate to={`/dashboard/${userDoc.role}`} replace />;
  }
  return children;
}

export function PublicOnlyRoute({ children }) {
  const { user, userDoc, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  if (user && userDoc) return <Navigate to={`/dashboard/${userDoc.role}`} replace />;
  return children;
}
