import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function ChatWindow() {
  const { conversationId } = useParams();
  const { profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const load = () => {
    api
      .get(`/chat/conversations/${conversationId}/messages`)
      .then(({ data }) => setMessages(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const content = text;
    setText("");
    try {
      const { data } = await api.post(
        `/chat/conversations/${conversationId}/messages`,
        { content },
      );
      setMessages((prev) => [...prev, data]);
    } catch (err) {
      console.error(err);
      setText(content); // put it back if sending failed
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
      <div className="flex min-h-[60vh] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_40px_-24px_rgba(15,23,42,0.35)]">
        <div className="bg-slate-900 px-5 py-6 text-slate-50 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
            Messages
          </p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Chat</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-3">
          {messages.length === 0 ? (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 text-slate-500">
              No messages yet.
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.sender_id === profile?.id;
              return (
                <div
                  key={m.id}
                  className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm shadow-sm ${
                    isMine
                      ? "ml-auto bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-900"
                  }`}
                >
                  {m.content}
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={send}
          className="border-t border-slate-200 px-5 py-4 sm:px-8 sm:py-6"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 min-w-0 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
            />
            <button
              type="submit"
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
