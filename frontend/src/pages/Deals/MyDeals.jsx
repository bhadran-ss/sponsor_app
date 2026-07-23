import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/client";

const STAGE_LABELS = {
  interested: "Interested",
  in_discussion: "In discussion",
  term_sheet: "Term sheet",
  funded: "Funded",
  passed: "Passed",
};
const STAGE_COLORS = {
  interested: "bg-slate-100 text-slate-600",
  in_discussion: "bg-slate-200 text-slate-700",
  term_sheet: "bg-slate-300 text-slate-800",
  funded: "bg-slate-900 text-white",
  passed: "bg-rose-50 text-rose-600",
};

export default function MyDeals() {
  const { role } = useParams();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/deals/mine")
      .then(({ data }) => setDeals(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-5xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full rounded-[28px] border border-slate-200 bg-white p-6 text-center text-sm font-semibold text-slate-600 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.35)]">
          Loading…
        </div>
      </div>
    );

  return (
    <div className="mx-auto w-full max-w-5xl py-4 sm:py-6 lg:py-8">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_40px_-24px_rgba(15,23,42,0.35)]">
        <div className="bg-slate-900 px-5 py-6 text-slate-50 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
            Deal workspace
          </p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">My pipeline</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Track your active opportunities and keep every conversation moving
            forward.
          </p>
        </div>

        <div className="px-5 py-5 sm:px-8 sm:py-8">
          {deals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
              <p className="text-lg font-semibold text-slate-800">
                No deals yet.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Express interest in an idea to start your first opportunity.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {deals.map((deal) => (
                <Link
                  key={deal.id}
                  to={`/dashboard/${role}/deals/${deal.id}`}
                  className="group flex min-w-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-slate-900 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-slate-900 sm:text-lg">
                      {deal.idea_title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {deal.innovator_name}
                    </p>
                  </div>
                  <span
                    className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${STAGE_COLORS[deal.stage]}`}
                  >
                    {STAGE_LABELS[deal.stage]}
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
