import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, UserRound, PencilLine } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { profile, isAuthenticated } = useAuth();

  const role = profile?.role || "sponsor";
  const initials =
    profile?.full_name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "P";

  const profileDetails = [
    { label: "Email", value: profile?.email },
    { label: "Phone", value: profile?.phone },
    { label: "City", value: profile?.city },
    { label: "Country", value: profile?.country },
    { label: "Role", value: profile?.role },
  ];

  const navItems = [
    { label: "Dashboard", to: `/dashboard/${role}` },
    { label: "My Ideas", to: `/dashboard/${role}/ideas` },
  ];

  const logout = async () => {
    await signOut(auth);
    setOpen(false);
    setProfileMenuOpen(false);
    navigate("/role", { replace: true });
  };

  return (
    <header className="relative z-50 shrink-0 border-b border-slate-800 bg-slate-900 text-slate-50 shadow-[0_8px_30px_-16px_rgba(15,23,42,0.9)]">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to={isAuthenticated ? `/dashboard/${role}` : "/role"}
          className="text-2xl font-black tracking-tight text-slate-50 sm:text-[2rem]"
        >
          <span className="text-slate-50">Sponsor</span>
          <span className="text-slate-300"> App</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {!isAuthenticated ? (
            <NavLink
              to="/role"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-slate-50 text-slate-900"
                    : "text-slate-300 hover:bg-slate-800 hover:text-slate-50"
                }`
              }
            >
              Role
            </NavLink>
          ) : (
            <>
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-slate-50 text-slate-900"
                        : "text-slate-300 hover:bg-slate-800 hover:text-slate-50"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="relative ml-4">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  className="flex items-center gap-3 rounded-full border border-slate-700 bg-slate-800/90 px-2 py-2 shadow-lg shadow-slate-950/30 backdrop-blur transition hover:border-slate-500"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-sm font-bold text-slate-900 ring-2 ring-slate-700">
                    {initials}
                  </div>

                  <div className="hidden min-w-0 xl:block">
                    <p className="truncate text-sm font-semibold text-slate-50">
                      {profile?.full_name || "Profile"}
                    </p>
                    <p className="text-xs capitalize tracking-wide text-slate-300">
                      {profile?.role || "profile"}
                    </p>
                  </div>
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+0.75rem)] w-88 rounded-3xl border border-slate-700 bg-slate-800 p-4 text-slate-50 shadow-2xl shadow-slate-950/60">
                    <div className="mb-4 flex items-center gap-3 rounded-2xl bg-slate-900/80 p-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-base font-bold text-slate-900">
                        {initials}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-50">
                          {profile?.full_name || "Profile"}
                        </p>
                        <p className="text-xs capitalize text-slate-300">
                          {profile?.role || "profile"}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-2 text-sm">
                      {profileDetails.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between gap-3 rounded-xl bg-slate-900/60 px-3 py-2"
                        >
                          <span className="text-slate-400">{item.label}</span>
                          <span className="truncate text-right font-medium text-slate-50">
                            {item.value || "—"}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <Link
                        to={`/dashboard/${role}/profile/edit`}
                        onClick={() => setProfileMenuOpen(false)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-200"
                      >
                        <PencilLine size={14} />
                        Edit profile
                      </Link>

                      <button
                        onClick={logout}
                        className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50 transition hover:border-rose-400 hover:bg-rose-500"
                        aria-label="Logout"
                      >
                        <LogOut size={17} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>

        <button
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-full border border-slate-700 bg-slate-800 p-2.5 text-slate-50 transition hover:bg-slate-700 md:hidden"
          aria-label="Toggle Menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-800 bg-slate-900 md:hidden">
          <div className="space-y-3 p-4">
            {!isAuthenticated ? (
              <NavLink
                to="/role"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-sm font-semibold ${
                    isActive
                      ? "bg-slate-50 text-slate-900"
                      : "text-slate-200 hover:bg-slate-800"
                  }`
                }
              >
                Role
              </NavLink>
            ) : (
              <>
                <div className="rounded-2xl border border-slate-800 bg-slate-800/80 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-base font-bold text-slate-900">
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-50">
                        {profile?.full_name || "Profile"}
                      </p>
                      <p className="text-xs capitalize text-slate-300">
                        {profile?.role || "profile"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 text-xs text-slate-200">
                    <div className="rounded-xl bg-slate-900/70 px-3 py-2">
                      <span className="text-slate-400">Email:</span>{" "}
                      <span>{profile?.email || "—"}</span>
                    </div>
                    <div className="rounded-xl bg-slate-900/70 px-3 py-2">
                      <span className="text-slate-400">Phone:</span>{" "}
                      <span>{profile?.phone || "—"}</span>
                    </div>
                  </div>
                </div>

                {navItems.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-2xl px-4 py-3 text-sm font-semibold ${
                        isActive
                          ? "bg-slate-50 text-slate-900"
                          : "text-slate-200 hover:bg-slate-800"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}

                <Link
                  to={`/dashboard/${role}/profile/edit`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-50"
                >
                  <UserRound size={16} />
                  Edit profile
                </Link>

                <button
                  onClick={logout}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-400 bg-rose-500 px-4 py-3 text-sm font-semibold text-white"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
