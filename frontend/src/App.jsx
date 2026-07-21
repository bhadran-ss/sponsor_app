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
import IdeaDetail from "./pages/Ideas/IdeaDetail.jsx";
import IdeaFeed from "./pages/Ideas/IdeaFeed.jsx";
import LikedIdeas from "./pages/Ideas/LikedIdeas.jsx";
import AdminPanel from "./pages/Admin/AdminPanel.jsx";
import ConversationsList from "./pages/Chat/ConversationsList.jsx";
import ChatWindow from "./pages/Chat/ChatWindow.jsx";

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
            <ProtectedRoute requireVerified role="innovator">
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
            <ProtectedRoute requireVerified>
              <IdeaDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:role/ideas/:ideaId/edit"
          element={
            <ProtectedRoute requireVerified role="innovator">
              <IdeaForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:role/browse"
          element={
            <ProtectedRoute requireVerified role="sponsor">
              <IdeaFeed />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/:role/liked"
          element={
            <ProtectedRoute requireVerified role="sponsor">
              <LikedIdeas />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requireVerified adminOnly>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/:role/messages"
          element={
            <ProtectedRoute requireVerified>
              <ConversationsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:role/messages/:conversationId"
          element={
            <ProtectedRoute requireVerified>
              <ChatWindow />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/role" replace />} />
      </Route>
    </Routes>
  );
}
