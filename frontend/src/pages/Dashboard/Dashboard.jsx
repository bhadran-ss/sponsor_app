import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Lightbulb,
  Heart,
  Handshake,
  MessageCircle,
  FileText,
  ArrowUpRight,
  Plus,
  Compass,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/client";

const STAGE_LABELS = {
  interested: "Interested",
  in_discussion: "In discussion",
  term_sheet: "Term sheet",
  funded: "Funded",
  passed: "Passed",
};

const STAGE_DOT = {
  interested: "bg-slate-400",
  in_discussion: "bg-blue-500",
  term_sheet: "bg-amber-500",
  funded: "bg-emerald-500",
  passed: "bg-rose-400",
};

function initials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function StatCard({ icon: Icon, label, value, to, delay = 0 }) {
  const content = (
    <div className="group h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
          <Icon size={17} strokeWidth={2} />
        </div>
        {to && (
          <ArrowUpRight
            size={16}
            className="text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-500"
          />
        )}
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-0.5 text-sm text-slate-500">{label}</p>
    </div>
  );

  return (
    <div className="animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
      {to ? <Link to={to}>{content}</Link> : content}
    </div>
  );
}

function ActivityCard({
  title,
  emptyIcon: EmptyIcon,
  emptyText,
  emptyCta,
  children,
  isEmpty,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <p className="font-semibold text-slate-900">{title}</p>
      </div>
      <div className="p-6">
        {isEmpty ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <EmptyIcon size={20} />
            </div>
            <p className="text-sm text-slate-500 max-w-[220px]">{emptyText}</p>
            {emptyCta}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { profile } = useAuth();
  const { role } = useParams();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const isSponsor = profile?.role === "sponsor";

  useEffect(() => {
    api
      .get("/dashboard/summary")
      .then(({ data }) => setSummary(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      </div>
    );
  }

  const activeDeals =
    summary.deal_stage_counts.interested +
    summary.deal_stage_counts.in_discussion +
    summary.deal_stage_counts.term_sheet;

  const heroValue = isSponsor ? activeDeals : summary.total_likes_received;
  const heroLabel = isSponsor
    ? "Active deals in your pipeline"
    : "Likes on your ideas so far";

  return (
    <div className="w-full max-w-5xl flex flex-col gap-6 pb-10">
      {/* ---------- Hero ---------- */}
      <div className="relative overflow-hidden rounded-[28px] bg-slate-900 px-6 py-10 sm:px-10 sm:py-14">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(148,163,184,0.35), transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(100,116,139,0.35), transparent 70%)",
          }}
        />

        <div className="relative flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {isSponsor ? "Sponsor dashboard" : "Innovator dashboard"}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Welcome back, {profile?.full_name?.split(" ")[0] || "there"}
            </h1>
            <p className="mt-2 max-w-md text-sm text-slate-400 sm:text-base">
              {isSponsor
                ? "Here's where things stand with the ideas you're tracking."
                : "Here's how your ideas are landing with sponsors."}
            </p>

            <Link
              to={
                isSponsor
                  ? `/dashboard/${role}/browse`
                  : `/dashboard/${role}/ideas/new`
              }
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              {isSponsor ? <Compass size={16} /> : <Plus size={16} />}
              {isSponsor ? "Browse ideas" : "New idea"}
            </Link>
          </div>

          <div className="shrink-0 sm:text-right">
            <p className="text-6xl font-bold tracking-tight text-white sm:text-7xl">
              {heroValue}
            </p>
            <p className="mt-1 text-sm text-slate-400 max-w-[220px] sm:ml-auto">
              {heroLabel}
            </p>
          </div>
        </div>
      </div>

      {/* ---------- Stats ---------- */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {isSponsor ? (
          <>
            <StatCard
              icon={Heart}
              label="Liked ideas"
              value={summary.total_liked_ideas}
              to={`/dashboard/${role}/liked`}
              delay={0}
            />
            <StatCard
              icon={Handshake}
              label="Active deals"
              value={activeDeals}
              to={`/dashboard/${role}/deals`}
              delay={60}
            />
            <StatCard
              icon={FileText}
              label="Funded"
              value={summary.deal_stage_counts.funded}
              to={`/dashboard/${role}/deals`}
              delay={120}
            />
            <StatCard
              icon={MessageCircle}
              label="Unread messages"
              value={summary.unread_messages}
              to={`/dashboard/${role}/messages`}
              delay={180}
            />
          </>
        ) : (
          <>
            <StatCard
              icon={Lightbulb}
              label="Published ideas"
              value={summary.published_ideas}
              to={`/dashboard/${role}/ideas`}
              delay={0}
            />
            <StatCard
              icon={FileText}
              label="Drafts"
              value={summary.draft_ideas}
              to={`/dashboard/${role}/ideas`}
              delay={60}
            />
            <StatCard
              icon={Heart}
              label="Likes received"
              value={summary.total_likes_received}
              delay={120}
            />
            <StatCard
              icon={MessageCircle}
              label="Unread messages"
              value={summary.unread_messages}
              to={`/dashboard/${role}/messages`}
              delay={180}
            />
          </>
        )}
      </div>

      {/* ---------- Activity ---------- */}
      <div className="grid gap-6 sm:grid-cols-2">
        <ActivityCard
          title={isSponsor ? "Your pipeline" : "Interest received"}
          isEmpty={summary.recent_deals.length === 0}
          emptyIcon={Handshake}
          emptyText={
            isSponsor
              ? "No deals yet. Browse ideas and express interest to start one."
              : "No sponsor interest yet — it'll show up here."
          }
          emptyCta={
            isSponsor && (
              <Link
                to={`/dashboard/${role}/browse`}
                className="text-sm font-semibold text-slate-900 underline underline-offset-2"
              >
                Browse ideas
              </Link>
            )
          }
        >
          <div className="flex flex-col divide-y divide-slate-100">
            {summary.recent_deals.map((deal) => (
              <Link
                key={deal.id}
                to={`/dashboard/${role}/deals/${deal.id}`}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 transition hover:opacity-70"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                  {initials(deal.other_party_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {deal.idea_title}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {deal.other_party_name}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1.5 text-xs text-slate-500">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${STAGE_DOT[deal.stage]}`}
                  />
                  {STAGE_LABELS[deal.stage]}
                </span>
              </Link>
            ))}
          </div>
        </ActivityCard>

        {isSponsor ? (
          <ActivityCard
            title="Deal breakdown"
            isEmpty={
              activeDeals +
                summary.deal_stage_counts.funded +
                summary.deal_stage_counts.passed ===
              0
            }
            emptyIcon={FileText}
            emptyText="Your deal stages will break down here once you start one."
          >
            <div className="flex flex-col gap-4">
              {Object.entries(summary.deal_stage_counts).map(
                ([stage, count]) => (
                  <div key={stage} className="flex items-center gap-3">
                    <span
                      className={`h-2 w-2 rounded-full ${STAGE_DOT[stage]}`}
                    />
                    <p className="flex-1 text-sm text-slate-600">
                      {STAGE_LABELS[stage]}
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {count}
                    </p>
                  </div>
                ),
              )}
            </div>
          </ActivityCard>
        ) : (
          <ActivityCard
            title="Recent ideas"
            isEmpty={summary.recent_ideas.length === 0}
            emptyIcon={Lightbulb}
            emptyText="You haven't submitted an idea yet. Publish one to start getting noticed."
            emptyCta={
              <Link
                to={`/dashboard/${role}/ideas/new`}
                className="text-sm font-semibold text-slate-900 underline underline-offset-2"
              >
                Submit an idea
              </Link>
            }
          >
            <div className="flex flex-col divide-y divide-slate-100">
              {summary.recent_ideas.map((idea) => (
                <Link
                  key={idea.id}
                  to={`/dashboard/${role}/ideas/${idea.id}`}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 transition hover:opacity-70"
                >
                  <p className="truncate text-sm font-medium text-slate-900">
                    {idea.title}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                      idea.is_draft
                        ? "bg-slate-100 text-slate-500"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {idea.is_draft ? "Draft" : "Published"}
                  </span>
                </Link>
              ))}
            </div>
          </ActivityCard>
        )}
      </div>
    </div>
  );
}
