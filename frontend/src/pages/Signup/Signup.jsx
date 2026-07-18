import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Signup() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const isSponsor = role === "sponsor";

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    if (isSponsor && !companyName.trim()) {
      setError("Company name is required for sponsors.");
      return;
    }
    setSubmitting(true);
    let createdFirebaseUser = false;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      createdFirebaseUser = true;
      await api.post("/auth/register", {
        role,
        full_name: fullName,
        company_name: isSponsor ? companyName : null,
      });
      await refreshProfile();
      navigate(`/verify/${role}`);
    } catch (err) {
      console.error(err);
      if (createdFirebaseUser && err?.config?.url?.includes("/auth/register")) {
        await signOut(auth); // don't leave an orphaned Firebase account with no profile
      }
      setError(
        err.response?.data?.detail || "Failed to sign up. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form
        onSubmit={handleSignup}
        className="flex flex-col gap-4 w-full max-w-sm"
      >
        <p className="text-3xl font-semibold text-center mb-4">
          Sign up as {isSponsor ? "sponsor" : "innovator"}
        </p>
        <input
          placeholder="Full name"
          className="px-4 py-2 border rounded-2xl focus:outline-none"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        {isSponsor && (
          <input
            placeholder="Company name"
            className="px-4 py-2 border rounded-2xl focus:outline-none"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        )}
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
          minLength={6}
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="py-2 bg-[#1D263A] hover:bg-[#2C3A4D] disabled:opacity-50 text-white font-bold rounded-lg"
        >
          {submitting ? "Creating account…" : "Sign up"}
        </button>
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        <Link
          to={`/login/${role}`}
          className="text-blue-600 text-sm text-center"
        >
          Already have an account? Log in
        </Link>
      </form>
    </div>
  );
}
