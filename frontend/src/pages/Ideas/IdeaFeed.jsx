import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/client";

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

export default function IdeaFeed() {
  const { role } = useParams();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingLikeId, setPendingLikeId] = useState(null);
  const [filters, setFilters] = useState({
    category: "",
    dev_stage: "",
    idea_type: "",
  });

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.dev_stage) params.dev_stage = filters.dev_stage;
    if (filters.idea_type) params.idea_type = filters.idea_type;

    api
      .get("/ideas", { params })
      .then(({ data }) => setIdeas(data))
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.detail || "Failed to load ideas.");
      })
      .finally(() => setLoading(false));
  }, [filters]);

  const setFilter = (key) => (e) =>
    setFilters((f) => ({ ...f, [key]: e.target.value }));

  const hasActiveFilters =
    Boolean(filters.category) ||
    Boolean(filters.dev_stage) ||
    Boolean(filters.idea_type);

  const toggleLike = async (idea) => {
    const nextLikedState = !idea.is_liked;
    setPendingLikeId(idea.id);

    setIdeas((prev) =>
      prev.map((i) =>
        i.id === idea.id ? { ...i, is_liked: nextLikedState } : i,
      ),
    );

    try {
      if (idea.is_liked) {
        await api.delete(`/ideas/${idea.id}/like`);
      } else {
        await api.post(`/ideas/${idea.id}/like`);
      }
    } catch (err) {
      console.error(err);
      setIdeas((prev) =>
        prev.map((i) =>
          i.id === idea.id ? { ...i, is_liked: idea.is_liked } : i,
        ),
      );
    } finally {
      setPendingLikeId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl py-4 sm:py-6 lg:py-8">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_40px_-24px_rgba(15,23,42,0.35)]">
        <div className="bg-slate-900 px-5 py-6 text-slate-50 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
            Idea feed
          </p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Browse ideas</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Explore submitted innovations, filter by category or stage, and
            review the concepts that best match your interest.
          </p>
        </div>

        <div className="grid gap-4 px-5 py-5 sm:px-8 sm:py-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-700">Filters</p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() =>
                    setFilters({ category: "", dev_stage: "", idea_type: "" })
                  }
                  className="text-xs font-semibold text-slate-500 underline"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="mt-4 grid gap-3">
              <select
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-900"
                value={filters.category}
                onChange={setFilter("category")}
              >
                <option value="">Any industry</option>
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              <select
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-900"
                value={filters.dev_stage}
                onChange={setFilter("dev_stage")}
              >
                <option value="">Any stage</option>
                {STAGE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              <select
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-900"
                value={filters.idea_type}
                onChange={setFilter("idea_type")}
              >
                <option value="">Any type</option>
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </aside>

          <div className="min-w-0">
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-600">
                Loading…
              </div>
            ) : error ? (
              <div className="rounded-2xl bg-rose-50 px-4 py-4 text-sm text-rose-600">
                {error}
              </div>
            ) : ideas.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
                <p className="text-lg font-semibold text-slate-800">
                  No ideas match these filters.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Try clearing one of the filters to see more ideas.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {ideas.map((idea) => (
                  <div
                    key={idea.id}
                    className="group relative rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-slate-900 hover:shadow-sm"
                  >
                    <button
                      type="button"
                      disabled={pendingLikeId === idea.id}
                      onClick={() => toggleLike(idea)}
                      className="absolute right-4 top-4 rounded-full bg-slate-50 px-2.5 py-2 text-lg transition hover:bg-slate-100 disabled:opacity-50"
                      aria-label={idea.is_liked ? "Unlike" : "Like"}
                    >
                      {idea.is_liked ? "❤️" : "🤍"}
                    </button>

                    <Link
                      to={`/dashboard/${role}/ideas/${idea.id}`}
                      className="block pr-12"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-slate-900 sm:text-lg">
                            {idea.title}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {idea.dev_stage || "—"} · {idea.idea_type || "—"}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {idea.category?.slice(0, 3).map((c) => (
                            <span
                              key={c}
                              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="mt-3 text-sm text-slate-600">
                        {idea.problem?.slice(0, 160)}
                        {idea.problem?.length > 160 ? "…" : ""}
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
