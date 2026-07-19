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
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <p className="mb-2 text-center text-[2.25rem] font-bold text-slate-900">
            Log in as {role}
          </p>
          <input
            type="email"
            placeholder="Email"
            className="rounded-2xl border border-slate-200 px-4 py-2.5 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="rounded-2xl border border-slate-200 px-4 py-2.5 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="mt-1 rounded-xl bg-[#1D263A] px-4 py-2.5 font-semibold text-white transition hover:bg-[#2C3A4D] disabled:opacity-60"
          >
            {submitting ? "Logging in…" : "Login"}
          </button>
          {error && <p className="text-center text-sm text-red-600">{error}</p>}
          <Link
            to={`/signup/${role}`}
            className="text-center text-sm text-blue-600"
          >
            Don't have an account? Register
          </Link>
        </form>
      </div>
    </div>
  );
}
