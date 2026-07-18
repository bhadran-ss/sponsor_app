import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Verify() {
  const { role } = useParams();
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const checkVerification = async () => {
    await refreshProfile();
    console.log("profile : ", { profile });
    if (profile?.is_verified) {
      navigate(`/dashboard/${role}`, { replace: true });
    } else {
      alert("Your account is still pending.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-3xl font-semibold">Verification pending</p>
      <p className="text-gray-500 max-w-md">
        Your {role} account ({profile?.email}) is under review. We'll email you
        once it's approved.
      </p>
      <button
        className="px-4 py-2 border rounded-lg hover:bg-gray-100"
        onClick={() => checkVerification()}
      >
        Check if verified
      </button>
    </div>
  );
}
