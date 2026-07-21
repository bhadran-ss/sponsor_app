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
      <div className="flex items-center justify-center w-full">Loading…</div>
    );

  return (
    <div className="w-full max-w-3xl">
      <p className="text-2xl font-semibold mb-6">Pending verifications</p>

      {users.length === 0 && <p className="text-slate-500">Nothing pending.</p>}

      <div className="flex flex-col gap-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="border rounded-2xl p-4 bg-white flex justify-between items-center gap-4"
          >
            <div className="min-w-0">
              <p className="font-semibold truncate">{user.full_name}</p>
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
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => approve(user.id)}
                disabled={actioningId === user.id}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-full text-sm font-semibold disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => reject(user.id)}
                disabled={actioningId === user.id}
                className="px-3 py-1.5 border border-red-300 text-red-600 rounded-full text-sm font-semibold disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
