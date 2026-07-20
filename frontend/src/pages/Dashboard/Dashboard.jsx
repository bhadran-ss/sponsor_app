import { useAuth } from "../../context/AuthContext.jsx";

export default function Dashboard() {
  const { profile: authProfile } = useAuth();
  const isSponsor = authProfile?.role === "sponsor";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center p-4 sm:p-8">
      <div className="w-full rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
          Dashboard
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
          Welcome, {authProfile?.full_name || "User"}
        </h1>

        <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
          {isSponsor
            ? "Manage your sponsor account from the header profile panel where you can view your details and edit your profile."
            : "Manage your innovator account from the header profile panel where you can view your details and edit your profile."}
        </p>
      </div>
    </div>
  );
}
