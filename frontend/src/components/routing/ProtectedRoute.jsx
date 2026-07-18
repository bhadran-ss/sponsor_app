import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ProtectedRoute({
  children,
  role,
  requireVerified = false,
}) {
  const { loading, isAuthenticated, profile } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/role" replace />;
  if (!profile) return <Navigate to="/role" replace />;
  if (role && profile.role !== role) return <Navigate to="/role" replace />;
  if (requireVerified && !profile.is_verified)
    return <Navigate to={`/verify/${profile.role}`} replace />;

  return children;
}
