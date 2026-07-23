import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";

function Field({ label, value, className = "" }) {
  return (
    <div className={className}>
      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
        {label}
      </span>
      <p className="mt-2 text-sm text-slate-700 sm:text-base">{value || "—"}</p>
    </div>
  );
}

export default function IdeaDetail() {
  const { ideaId, role } = useParams();
  const { profile } = useAuth();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingLike, setPendingLike] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get(`/ideas/${ideaId}`)
      .then(({ data }) => setIdea(data))
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.detail || "Idea not found.");
      })
      .finally(() => setLoading(false));
  }, [ideaId]);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-4xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full rounded-[28px] border border-slate-200 bg-white p-6 text-center text-sm font-semibold text-slate-600 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.35)]">
          Loading…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-4xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-center text-sm font-semibold text-rose-600 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.35)]">
          {error}
        </div>
      </div>
    );
  }

  const isOwner = idea.innovator_id === profile?.id;
  const isSponsor = profile?.role === "sponsor";
  const backPath =
    role === "sponsor"
      ? `/dashboard/${role}/browse`
      : `/dashboard/${role}/ideas`;

  const toggleLike = async () => {
    if (!isSponsor || !idea) return;

    const nextLikedState = !idea.is_liked;
    setPendingLike(true);
    setIdea((prev) => ({ ...prev, is_liked: nextLikedState }));

    try {
      if (idea.is_liked) {
        await api.delete(`/ideas/${idea.id}/like`);
      } else {
        await api.post(`/ideas/${idea.id}/like`);
      }
    } catch (err) {
      console.error(err);
      setIdea((prev) => ({ ...prev, is_liked: !nextLikedState }));
    } finally {
      setPendingLike(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl py-4 sm:py-6 lg:py-8">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_40px_-24px_rgba(15,23,42,0.35)]">
        <div className="bg-slate-900 px-5 py-6 text-slate-50 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
            Innovation details
          </p>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">{idea.title}</h1>
              <p className="mt-2 text-sm text-slate-300">
                {idea.dev_stage || "—"} · {idea.idea_type || "—"}
                {idea.is_draft && (
                  <span className="ml-2 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-50">
                    Draft
                  </span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                to={backPath}
                className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-50 transition hover:border-slate-500"
              >
                Back
              </Link>

              {isSponsor && (
                <button
                  type="button"
                  disabled={pendingLike}
                  onClick={toggleLike}
                  className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  {idea.is_liked ? "❤️ Unlike" : "🤍 Like"}
                </button>
              )}

              {isOwner && (
                <Link
                  to={`/dashboard/${role}/ideas/${idea.id}/edit`}
                  className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Edit
                </Link>
              )}

              {!isOwner && profile?.role === "sponsor" && (
                <button
                  onClick={async () => {
                    const { data } = await api.post("/chat/conversations", {
                      other_user_id: idea.innovator_id,
                    });
                    navigate(`/dashboard/${role}/messages/${data.id}`);
                  }}
                  className="inline-flex w-full items-center justify-center rounded-full bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 sm:w-auto"
                >
                  Message innovator
                </button>
              )}
              {!isOwner && profile?.role === "sponsor" && (
                <button
                  onClick={async () => {
                    const { data } = await api.post("/deals", {
                      idea_id: idea.id,
                    });
                    navigate(`/dashboard/${role}/deals/${data.id}`);
                  }}
                  className="inline-flex w-full items-center justify-center rounded-full border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-50 transition hover:border-slate-500 hover:bg-slate-700 sm:w-auto"
                >
                  Express interest
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 px-5 py-5 sm:px-8 sm:py-8 lg:grid-cols-2">
          <Field
            label="Problem"
            value={idea.problem}
            className="lg:col-span-2"
          />
          <Field
            label="Solution"
            value={idea.solution}
            className="lg:col-span-2"
          />
          <Field
            label="Business model"
            value={idea.business_model}
            className="lg:col-span-2"
          />

          <Field
            label="Funding requirement"
            value={
              idea.funding_requirement ? `₹${idea.funding_requirement}` : null
            }
          />
          <Field label="Patented" value={idea.is_patented ? "Yes" : "No"} />
          <Field label="Category" value={idea.category?.join(", ")} />
          <Field label="Team" value={idea.team_details?.join(", ")} />
        </div>
      </div>
    </div>
  );
}
