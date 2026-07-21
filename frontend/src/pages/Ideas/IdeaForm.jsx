import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";

const CATEGORY_OPTIONS = [
  "Healthcare",
  "Agriculture",
  "Technology",
  "Education",
  "Tourism",
  "Automobile",
];
const STAGE_OPTIONS = [
  "Ideation",
  "Development",
  "Prototype",
  "Commercialisable",
];
const TYPE_OPTIONS = ["Product", "Service", "Design", "Process"];

export default function IdeaForm() {
  const { ideaId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isEditing = !!ideaId;

  const [form, setForm] = useState({
    title: "",
    problem: "",
    solution: "",
    business_model: "",
    funding_requirement: "",
    category: [],
    dev_stage: "",
    idea_type: "",
    team_details: "",
    is_patented: false,
  });
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEditing) return;

    api
      .get(`/ideas/${ideaId}`)
      .then(({ data }) => {
        setForm({
          title: data.title,
          problem: data.problem,
          solution: data.solution,
          business_model: data.business_model || "",
          funding_requirement: data.funding_requirement || "",
          category: data.category || [],
          dev_stage: data.dev_stage || "",
          idea_type: data.idea_type || "",
          team_details: data.team_details?.join(", ") || "",
          is_patented: data.is_patented,
        });
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.detail || "Failed to load idea.");
      })
      .finally(() => setLoading(false));
  }, [ideaId, isEditing]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggleCategory = (option) => {
    setForm((f) => ({
      ...f,
      category: f.category.includes(option)
        ? f.category.filter((c) => c !== option)
        : [...f.category, option],
    }));
  };

  const buildPayload = (draft) => ({
    title: form.title.trim(),
    problem: form.problem.trim(),
    solution: form.solution.trim(),
    business_model: form.business_model.trim(),
    funding_requirement: form.funding_requirement
      ? Number(form.funding_requirement)
      : null,
    category: form.category,
    dev_stage: form.dev_stage,
    idea_type: form.idea_type,
    team_details: form.team_details
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    is_patented: form.is_patented,
    is_draft: draft,
  });

  const validateForm = () => {
    if (!form.title.trim()) {
      setError("Please enter a title for your idea.");
      return false;
    }

    if (!form.problem.trim()) {
      setError("Please describe the problem your idea solves.");
      return false;
    }

    if (!form.solution.trim()) {
      setError("Please describe your solution.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (draft) => {
    if (!validateForm()) return;

    setSaving(true);
    setError(null);
    try {
      if (isEditing) {
        await api.put(`/ideas/${ideaId}`, buildPayload(draft));
      } else {
        await api.post("/ideas", buildPayload(draft));
      }
      navigate(`/dashboard/${profile.role}/ideas`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to save idea.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-5xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full rounded-[28px] border border-slate-200 bg-white p-6 text-center text-sm font-semibold text-slate-600 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.35)]">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl py-4 sm:py-6 lg:py-8">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_40px_-24px_rgba(15,23,42,0.35)]">
        <div className="bg-slate-900 px-5 py-6 text-slate-50 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
            Idea details
          </p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
            {isEditing ? "Edit idea" : "Submit an idea"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Capture the problem, the solution, and the commercial context of
            your innovation in a structured form.
          </p>
        </div>

        <div className="grid gap-4 px-5 py-5 sm:px-8 sm:py-8 lg:grid-cols-2">
          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-semibold text-slate-700">
              Title
            </label>
            <input
              required
              placeholder="Title"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
              value={form.title}
              onChange={set("title")}
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-semibold text-slate-700">
              Problem
            </label>
            <textarea
              required
              placeholder="Problem"
              className="h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
              value={form.problem}
              onChange={set("problem")}
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-semibold text-slate-700">
              Solution
            </label>
            <textarea
              required
              placeholder="Solution"
              className="h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
              value={form.solution}
              onChange={set("solution")}
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-semibold text-slate-700">
              Business model
            </label>
            <textarea
              placeholder="Business model"
              className="h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
              value={form.business_model}
              onChange={set("business_model")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Funding requirement
            </label>
            <input
              type="number"
              placeholder="Funding requirement"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
              value={form.funding_requirement}
              onChange={set("funding_requirement")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Stage of development
            </label>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
              value={form.dev_stage}
              onChange={set("dev_stage")}
            >
              <option value="">Select stage</option>
              {STAGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Idea type
            </label>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
              value={form.idea_type}
              onChange={set("idea_type")}
            >
              <option value="">Select type</option>
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-semibold text-slate-700">
              Team details
            </label>
            <input
              placeholder="Team details (comma separated)"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
              value={form.team_details}
              onChange={set("team_details")}
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <p className="text-sm font-semibold text-slate-700">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => toggleCategory(opt)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                    form.category.includes(opt)
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-900"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 lg:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.is_patented}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_patented: e.target.checked }))
                }
              />
              This idea is patented
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit(true)}
              className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 disabled:opacity-50"
            >
              Save as draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit(false)}
              className="flex-1 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? "Publishing…" : "Publish"}
            </button>
          </div>

          {error && (
            <div className="lg:col-span-2">
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
