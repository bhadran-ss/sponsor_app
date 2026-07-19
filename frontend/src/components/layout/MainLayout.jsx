import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";

export default function MainLayout() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white text-slate-900">
      <Header />
      <main className="flex-1 overflow-hidden">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-center px-4 py-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
