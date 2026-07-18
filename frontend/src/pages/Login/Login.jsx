import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Login() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const profile = await refreshProfile();
      if (!profile) {
        setError("No profile found for this account.");
        return;
      }
      if (profile.role !== role) {
        setError(
          `This account is registered as a ${profile.role}, not a ${role}.`,
        );
        return;
      }
      navigate(profile.is_verified ? `/dashboard/${role}` : `/verify/${role}`);
    } catch (err) {
      console.error(err);
      setError("Failed to log in. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-4 w-full max-w-sm"
      >
        <p className="text-3xl font-semibold text-center mb-4">
          Log in as {role}
        </p>
        <input
          type="email"
          placeholder="Email"
          className="px-4 py-2 border rounded-2xl focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="px-4 py-2 border rounded-2xl focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="py-2 bg-[#1D263A] hover:bg-[#2C3A4D] disabled:opacity-50 text-white font-bold rounded-lg"
        >
          {submitting ? "Logging in…" : "Login"}
        </button>
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        <Link
          to={`/signup/${role}`}
          className="text-blue-600 text-sm text-center"
        >
          Don't have an account? Register
        </Link>
      </form>
    </div>
  );
}
