import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "../../firebase/config";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext.jsx";
import googleImg from "../../assets/google_img.png";

const buildRegisterFormData = ({
  role,
  fullName,
  companyName,
  companyProof,
}) => {
  const formData = new FormData();
  formData.append("role", role);
  formData.append("full_name", fullName);

  if (companyName) {
    formData.append("company_name", companyName);
  }

  if (companyProof) {
    formData.append("company_proof", companyProof);
  }

  return formData;
};

export default function Signup() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyProof, setCompanyProof] = useState(null);
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

    if (isSponsor && !companyProof) {
      setError(
        "Please upload a proof of your company for sponsor registration.",
      );
      return;
    }

    setSubmitting(true);
    let createdFirebaseUser = false;

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      createdFirebaseUser = true;

      const formData = buildRegisterFormData({
        role,
        fullName,
        companyName: isSponsor ? companyName : "",
        companyProof: isSponsor ? companyProof : null,
      });

      await api.post("/auth/register", formData);
      await refreshProfile();
      navigate(`/verify/${role}`);
    } catch (err) {
      console.error(err);
      if (createdFirebaseUser && err?.config?.url?.includes("/auth/register")) {
        await signOut(auth);
      }
      setError(
        err.response?.data?.detail || "Failed to sign up. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSigninWithGoogle = async () => {
    setError(null);

    if (isSponsor && !companyName.trim()) {
      setError("Company name is required for sponsors.");
      return;
    }

    if (isSponsor && !companyProof) {
      setError(
        "Please upload a proof of your company before continuing with Google.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const displayName = firebaseUser.displayName?.trim() || fullName.trim();

      if (!displayName) {
        setError("Please enter your full name before continuing with Google.");
        await signOut(auth);
        return;
      }

      const formData = buildRegisterFormData({
        role,
        fullName: displayName,
        companyName: isSponsor ? companyName : "",
        companyProof: isSponsor ? companyProof : null,
      });

      await api.post("/auth/register", formData);
      await refreshProfile();
      navigate(`/verify/${role}`);
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 400) {
        await refreshProfile();
        navigate(`/verify/${role}`);
        return;
      }
      setError(err.response?.data?.detail || "Failed to sign in with Google.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSignup} className="flex flex-col gap-3">
          <p className="mb-2 text-center text-[2rem] font-bold text-slate-900">
            Sign up as {isSponsor ? "Sponsor" : "Innovator"}
          </p>

          <input
            placeholder="Full name"
            className="rounded-2xl border border-slate-200 px-4 py-2.5 focus:outline-none"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          {isSponsor && (
            <>
              <input
                placeholder="Company name"
                className="rounded-2xl border border-slate-200 px-4 py-2.5 focus:outline-none"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
              <label className="flex flex-col gap-2 text-sm text-slate-700">
                <span>Company proof image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCompanyProof(e.target.files?.[0] || null)}
                  className="rounded-2xl border border-slate-200 px-3 py-2"
                  required
                />
              </label>
            </>
          )}

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
            minLength={6}
            required
          />

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 rounded-xl bg-[#1D263A] px-4 py-2.5 font-semibold text-white transition hover:bg-[#2C3A4D] disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Sign up"}
          </button>

          {error && <p className="text-center text-sm text-red-600">{error}</p>}

          <Link
            to={`/login/${role}`}
            className="text-center text-sm text-blue-600"
          >
            Already have an account? Log in
          </Link>
        </form>

        <div className="mt-4 flex flex-col items-center gap-3">
          <div className="flex w-full items-center gap-3">
            <div className="h-px flex-1 bg-slate-200"></div>
            <span className="text-sm text-slate-500">Or</span>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>

          <button
            type="button"
            onClick={handleSigninWithGoogle}
            disabled={submitting}
            className="rounded-xl border border-slate-200 bg-white p-2 transition hover:shadow-sm disabled:opacity-60"
          >
            <img
              src={googleImg}
              alt="Continue with Google"
              className="h-10 w-10"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
