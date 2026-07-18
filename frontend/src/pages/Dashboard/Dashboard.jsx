import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/role", { replace: true });
  };

  return (
    <div className="min-h-screen p-10">
      <div className="flex justify-between items-center mb-8">
        <p className="text-2xl font-semibold">
          Welcome, {profile?.full_name} ({profile?.role})
        </p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 border rounded-lg hover:bg-gray-100"
        >
          Log out
        </button>
      </div>
      <p className="text-gray-500">Dashboard content goes here next.</p>
    </div>
  );
}
