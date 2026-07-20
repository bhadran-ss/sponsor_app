import { Routes, Route, Navigate } from "react-router-dom";
import Roleselector from "./pages/Roleselector/Roleselector.jsx";
import Signup from "./pages/Signup/Signup.jsx";
import Login from "./pages/Login/Login.jsx";
import Verify from "./pages/Verify/Verify.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import EditProfile from "./pages/Dashboard/EditProfile.jsx";
import ProtectedRoute from "./components/routing/ProtectedRoute.jsx";
import MainLayout from "./components/layout/MainLayout.jsx";
import MyIdeas from "./pages/Ideas/MyIdeas.jsx";
import IdeaForm from "./pages/Ideas/IdeaForm.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/role" replace />} />
        <Route path="/role" element={<Roleselector />} />
        <Route path="/signup/:role" element={<Signup />} />
        <Route path="/login/:role" element={<Login />} />
        <Route
          path="/verify/:role"
          element={
            <ProtectedRoute>
              <Verify />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:role"
          element={
            <ProtectedRoute requireVerified>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:role/profile/edit"
          element={
            <ProtectedRoute requireVerified>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:role/ideas"
          element={
            <ProtectedRoute requireVerified>
              <MyIdeas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:role/ideas/new"
          element={
            <ProtectedRoute requireVerified role="innovator">
              <IdeaForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:role/ideas/:ideaId"
          element={
            <ProtectedRoute requireVerified role="innovator">
              <IdeaForm />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/role" replace />} />
      </Route>
    </Routes>
  );
}
