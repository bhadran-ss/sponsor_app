import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";

const STAGE_LABELS = {
  interested: "Interested",
  in_discussion: "In discussion",
  term_sheet: "Term sheet",
  funded: "Funded",
  passed: "Passed",
};

const SPONSOR_NEXT = {
  interested: ["in_discussion", "passed"],
  in_discussion: ["term_sheet", "passed"],
  term_sheet: ["passed"],
};
const INNOVATOR_NEXT = {
  term_sheet: ["funded", "passed"],
  in_discussion: ["passed"],
  interested: ["passed"],
};

export default function DealDetail() {
  const { dealId, role } = useParams();
  const { profile } = useAuth();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    offered_amount: "",
    equity_percentage: "",
    terms: "",
  });

  const load = () => {
    api
      .get(`/deals/${dealId}`)
      .then(({ data }) => {
        setDeal(data);
        setForm({
          offered_amount: data.offered_amount || "",
          equity_percentage: data.equity_percentage || "",
          terms: data.terms || "",
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [dealId]);

  if (loading)
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-600 shadow-sm">
          Loading…
        </div>
      </div>
    );

  const isSponsor = profile?.id === deal.sponsor_id;
  const nextStages =
    (isSponsor ? SPONSOR_NEXT : INNOVATOR_NEXT)[deal.stage] || [];

  const moveStage = async (stage) => {
    setSaving(true);
    try {
      const { data } = await api.patch(`/deals/${dealId}`, { stage });
      setDeal(data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to update stage.");
    } finally {
      setSaving(false);
    }
  };

  const saveTerms = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch(`/deals/${dealId}`, {
        offered_amount: form.offered_amount
          ? Number(form.offered_amount)
          : null,
        equity_percentage: form.equity_percentage
          ? Number(form.equity_percentage)
          : null,
        terms: form.terms,
      });
      setDeal(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl py-4 sm:py-6 lg:py-8">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_40px_-24px_rgba(15,23,42,0.35)]">
        <div className="bg-slate-900 px-5 py-6 text-slate-50 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
            Deal details
          </p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
            {deal.idea_title}
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            {isSponsor ? deal.innovator_name : deal.sponsor_name} · Stage:{" "}
            <strong className="text-slate-50">
              {STAGE_LABELS[deal.stage]}
            </strong>
          </p>
        </div>

        <div className="p-5 sm:p-8">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
              Terms
            </p>

            {isSponsor ? (
              <div className="mt-4 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="number"
                    placeholder="Offered amount"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
                    value={form.offered_amount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, offered_amount: e.target.value }))
                    }
                  />
                  <input
                    type="number"
                    placeholder="Equity %"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
                    value={form.equity_percentage}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        equity_percentage: e.target.value,
                      }))
                    }
                  />
                </div>
                <textarea
                  placeholder="Terms / notes"
                  className="min-h-30 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
                  value={form.terms}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, terms: e.target.value }))
                  }
                />
                <button
                  onClick={saveTerms}
                  disabled={saving}
                  className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 sm:w-fit"
                >
                  {saving ? "Saving…" : "Save terms"}
                </button>
              </div>
            ) : (
              <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <p className="rounded-2xl bg-white px-4 py-3">
                  <span className="text-slate-500">Offered:</span>{" "}
                  {deal.offered_amount
                    ? `₹${deal.offered_amount}`
                    : "Not yet set"}
                </p>
                <p className="rounded-2xl bg-white px-4 py-3">
                  <span className="text-slate-500">Equity:</span>{" "}
                  {deal.equity_percentage
                    ? `${deal.equity_percentage}%`
                    : "Not yet set"}
                </p>
                <p className="rounded-2xl bg-white px-4 py-3 sm:col-span-2">
                  {deal.terms || "No terms provided yet."}
                </p>
              </div>
            )}
          </div>

          {nextStages.length > 0 && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {nextStages.map((stage) => (
                <button
                  key={stage}
                  onClick={() => moveStage(stage)}
                  disabled={saving}
                  className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:opacity-50 sm:w-auto ${
                    stage === "passed"
                      ? "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                      : "bg-slate-900 text-white hover:bg-slate-700"
                  }`}
                >
                  Move to {STAGE_LABELS[stage]}
                </button>
              ))}
            </div>
          )}

          <Link
            to={`/dashboard/${role}/ideas/${deal.idea_id}`}
            className="mt-6 inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
          >
            View idea
          </Link>
        </div>
      </div>
    </div>
  );
}
