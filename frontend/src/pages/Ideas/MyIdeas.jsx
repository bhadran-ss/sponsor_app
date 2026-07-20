import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";

export default function MyIdeas() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/ideas/mine")
      .then(({ data }) => setIdeas(data))
      .finally(() => setLoading(false));
  }, []);

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
            Idea workspace
          </p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">My ideas</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Manage your submitted concepts and keep track of drafts or
                published ideas in one place.
              </p>
            </div>

            <Link
              to="new"
              className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              + New idea
            </Link>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-8 sm:py-8">
          {ideas.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
              <p className="text-lg font-semibold text-slate-800">
                No ideas submitted yet.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Start by creating your first idea and publish it when you're
                ready.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {ideas.map((idea) => (
                <Link
                  key={idea.id}
                  to={idea.id}
                  className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-slate-900 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-slate-900 sm:text-lg">
                      {idea.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {idea.dev_stage || "—"} · {idea.idea_type || "—"}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      idea.is_draft
                        ? "bg-slate-100 text-slate-600"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {idea.is_draft ? "Draft" : "Published"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
