import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function RootRedirect() {
  const { loading, isAuthenticated, profile } = useAuth();

  if (loading) return null; // same pattern as ProtectedRoute — don't guess before Firebase resolves

  if (!isAuthenticated || !profile) {
    return <Navigate to="/role" replace />;
  }

  if (!profile.is_verified) {
    return <Navigate to={`/verify/${profile.role}`} replace />;
  }

  return <Navigate to={`/dashboard/${profile.role}`} replace />;
}
