import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  const { profile, isAuthenticated } = useAuth();

  const role = profile?.role || "sponsor";

  const navItems = [
    {
      label: "Dashboard",
      to: `/dashboard/${role}`,
    },
  ];

  const logout = async () => {
    await signOut(auth);
    setOpen(false);
    navigate("/role", { replace: true });
  };

  return (
    <header className="relative z-50 shrink-0 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        {/* Logo */}
        <Link
          to={isAuthenticated ? `/dashboard/${role}` : "/role"}
          className="text-[2rem] font-bold tracking-tight text-slate-900"
        >
          Sponsor App
        </Link>

        {/* Desktop */}
        <nav className="hidden items-center gap-2 md:flex">
          {!isAuthenticated ? (
            <NavLink
              to="/role"
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
                    `rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="ml-5 flex items-center gap-3 border-l border-slate-200 pl-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                  {profile?.full_name?.charAt(0).toUpperCase()}
                </div>

                <div className="leading-tight">
                  <p className="font-medium text-slate-900">
                    {profile?.full_name}
                  </p>

                  <p className="text-xs capitalize text-slate-500">
                    {profile?.role}
                  </p>
                </div>

                <button
                  onClick={logout}
                  className="ml-3 rounded-lg border border-slate-900 bg-slate-900 p-2 text-white transition hover:border-red-500 hover:bg-red-500"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          )}
        </nav>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-lg border border-slate-200 p-2 text-slate-900 transition hover:bg-slate-100 md:hidden"
          aria-label="Toggle Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="space-y-2 p-4">
            {!isAuthenticated ? (
              <NavLink
                to="/role"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block rounded-lg px-4 py-3 text-sm font-medium ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
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
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-lg px-4 py-3 text-sm font-medium ${
                        isActive
                          ? "bg-slate-900 text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}

                <div className="mt-4 flex items-center gap-3 border-t border-slate-200 pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 font-semibold text-white">
                    {profile?.full_name?.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <p className="font-medium text-slate-900">
                      {profile?.full_name}
                    </p>

                    <p className="text-xs capitalize text-slate-500">
                      {profile?.role}
                    </p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-3 text-red-600 transition hover:bg-red-50"
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
