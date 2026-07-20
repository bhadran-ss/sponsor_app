import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function EditProfile() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const isSponsor = role === "sponsor";

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    city: "",
    address_line1: "",
    address_line2: "",
    state: "",
    postal_code: "",
    country: "",
    bio: "",
    date_of_birth: "",
    interests: "",
    company_name: "",
    website: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/profile/me").then(({ data }) => {
      setForm({
        full_name: data.full_name || "",
        phone: data.phone || "",
        city: data.city || "",
        address_line1: data.address_line1 || "",
        address_line2: data.address_line2 || "",
        state: data.state || "",
        postal_code: data.postal_code || "",
        country: data.country || "",
        bio: data.bio || "",
        date_of_birth: data.date_of_birth || "",
        interests: data.interests?.join(", ") || "",
        company_name: data.company_name || "",
        website: data.website || "",
      });
      setLoading(false);
    });
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        full_name: form.full_name,
        phone: form.phone,
        city: form.city,
        address_line1: form.address_line1,
        address_line2: form.address_line2,
        state: form.state,
        postal_code: form.postal_code,
        country: form.country,
        bio: form.bio,
      };
      if (isSponsor) {
        payload.company_name = form.company_name;
        payload.website = form.website;
      } else {
        payload.date_of_birth = form.date_of_birth || null;
        payload.interests = form.interests
          ? form.interests
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
      }
      await api.put("/profile/me", payload);
      await refreshProfile();
      navigate(`/dashboard/${role}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );

  return (
    <div className="mx-auto w-full max-w-5xl py-4 sm:py-6 lg:py-8">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_40px_-24px_rgba(15,23,42,0.35)]">
        <div className="bg-slate-900 px-5 py-6 text-slate-50 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
            Profile settings
          </p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Edit profile</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Update your personal information and keep your public profile
            accurate.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 px-5 py-5 sm:px-8 sm:py-8 lg:grid-cols-2"
        >
          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-semibold text-slate-700">
              Full name
            </label>
            <input
              placeholder="Full name"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
              value={form.full_name}
              onChange={set("full_name")}
            />
          </div>

          {isSponsor && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Company name
                </label>
                <input
                  placeholder="Company name"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
                  value={form.company_name}
                  onChange={set("company_name")}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Website
                </label>
                <input
                  placeholder="Website"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
                  value={form.website}
                  onChange={set("website")}
                />
              </div>
            </>
          )}

          {!isSponsor && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Date of birth
                </label>
                <input
                  type="date"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
                  value={form.date_of_birth}
                  onChange={set("date_of_birth")}
                />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-semibold text-slate-700">
                  Interests
                </label>
                <input
                  placeholder="Interests (comma separated)"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
                  value={form.interests}
                  onChange={set("interests")}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Phone
            </label>
            <input
              placeholder="Phone"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
              value={form.phone}
              onChange={set("phone")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">City</label>
            <input
              placeholder="City"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
              value={form.city}
              onChange={set("city")}
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-semibold text-slate-700">
              Address line 1
            </label>
            <input
              placeholder="Address line 1"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
              value={form.address_line1}
              onChange={set("address_line1")}
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-semibold text-slate-700">
              Address line 2
            </label>
            <input
              placeholder="Address line 2 (optional)"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
              value={form.address_line2}
              onChange={set("address_line2")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              State
            </label>
            <input
              placeholder="State"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
              value={form.state}
              onChange={set("state")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Postal code
            </label>
            <input
              placeholder="Postal code"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
              value={form.postal_code}
              onChange={set("postal_code")}
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-semibold text-slate-700">
              Country
            </label>
            <input
              placeholder="Country"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
              value={form.country}
              onChange={set("country")}
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Bio</label>
            <textarea
              placeholder="Bio"
              className="min-h-30 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
              value={form.bio}
              onChange={set("bio")}
            />
          </div>

          <div className="flex flex-col gap-3 pt-2 lg:col-span-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-500">
              Make your profile details current and easy to find.
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 sm:w-auto"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>

          {error && (
            <p className="text-sm font-medium text-red-600 lg:col-span-2">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
