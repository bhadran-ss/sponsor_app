import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
