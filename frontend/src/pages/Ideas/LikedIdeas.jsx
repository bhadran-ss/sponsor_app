import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/client";

export default function LikedIdeas() {
  const { role } = useParams();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/ideas/liked/list")
      .then(({ data }) => setIdeas(data))
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.detail || "Failed to load liked ideas.");
      })
      .finally(() => setLoading(false));
  }, []);

  const unlike = async (idea) => {
    setIdeas((prev) => prev.filter((i) => i.id !== idea.id));
    try {
      await api.delete(`/ideas/${idea.id}/like`);
    } catch (err) {
      console.error(err);
      setError("Failed to unlike this idea. Please try again.");
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
            Saved ideas
          </p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Liked ideas</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Review the ideas you have liked and open them again when you want to
            revisit the details.
          </p>
        </div>

        <div className="px-5 py-5 sm:px-8 sm:py-8">
          {error ? (
            <div className="rounded-2xl bg-rose-50 px-4 py-4 text-sm text-rose-600">
              {error}
            </div>
          ) : ideas.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
              <p className="text-lg font-semibold text-slate-800">
                No liked ideas yet.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Browse ideas and tap the heart on any card you want to save.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {ideas.map((idea) => (
                <div
                  key={idea.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-900 hover:shadow-sm"
                >
                  <Link
                    to={`/dashboard/${role}/ideas/${idea.id}`}
                    className="min-w-0 flex-1"
                  >
                    <p className="truncate text-base font-semibold text-slate-900 sm:text-lg">
                      {idea.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {idea.dev_stage || "—"} · {idea.idea_type || "—"}
                    </p>
                  </Link>

                  <button
                    type="button"
                    onClick={() => unlike(idea)}
                    className="rounded-full bg-slate-50 px-3 py-2 text-lg transition hover:bg-slate-100"
                    aria-label="Unlike"
                  >
                    ❤️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
