import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/client";

export default function ConversationsList() {
  const { role } = useParams();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    console.log("Loading conversations...");
    api
      .get("/chat/conversations")
      .then(({ data }) => setConversations(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000); // simple polling — no websockets yet
    return () => clearInterval(interval);
  }, []);

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
            Messages
          </p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Conversations</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
            Open a conversation to continue the chat with another user.
          </p>
        </div>

        <div className="px-5 py-5 sm:px-8 sm:py-8">
          {conversations.length === 0 ? (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 text-slate-500">
              No conversations yet.
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((c) => (
                <Link
                  key={c.id}
                  to={`/dashboard/${role}/messages/${c.id}`}
                  className="block rounded-[24px] border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-900 hover:bg-slate-100"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-lg font-semibold text-slate-900 truncate">
                        {c.other_user_name || "Unknown"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500 truncate">
                        {c.last_message_preview || "No messages yet"}
                      </p>
                    </div>
                    {c.unread_count > 0 && (
                      <span className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-slate-900 px-2 text-xs font-semibold text-white">
                        {c.unread_count}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
