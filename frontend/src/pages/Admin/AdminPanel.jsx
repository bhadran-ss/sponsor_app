import { useEffect, useState } from "react";
import api from "../../api/client";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get("/admin/users/pending")
      .then(({ data }) => setUsers(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const approve = async (id) => {
    setActioningId(id);
    try {
      await api.patch(`/admin/users/${id}/verify`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  const reject = async (id) => {
    if (!confirm("Reject and delete this signup? This can't be undone."))
      return;
    setActioningId(id);
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  if (loading)
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-5xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full rounded-[28px] border border-slate-200 bg-white p-6 text-center text-sm font-semibold text-slate-600 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.35)]">
          Loading…
        </div>
      </div>
    );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_40px_-24px_rgba(15,23,42,0.35)]">
        <div className="bg-slate-900 px-5 py-6 text-slate-50 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
            Admin
          </p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
            Pending verifications
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
            Review new signups and approve or reject accounts before they can
            access the platform.
          </p>
        </div>

        <div className="px-5 py-5 sm:px-8 sm:py-8">
          {users.length === 0 ? (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 text-slate-500">
              Nothing pending.
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-lg font-semibold text-slate-900 truncate">
                      {user.full_name}
                    </p>
                    <p className="text-sm text-slate-500 truncate">
                      {user.email} · {user.role}
                    </p>
                    {user.company_name && (
                      <p className="text-sm text-slate-500 truncate">
                        {user.company_name}
                      </p>
                    )}
                    {user.company_proof_url && (
                      <a
                        href={user.company_proof_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 underline"
                      >
                        View company proof
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 shrink-0">
                    <button
                      onClick={() => approve(user.id)}
                      disabled={actioningId === user.id}
                      className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reject(user.id)}
                      disabled={actioningId === user.id}
                      className="rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-red-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
