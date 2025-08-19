import { Link, Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-100 text-black p-4 space-y-4">
        <h2 className="text-xl font-bold">EMS</h2>
        <nav className="flex flex-col gap-2">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/tracking">Tracking</Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
