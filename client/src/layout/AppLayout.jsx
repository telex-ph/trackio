import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout() {
  return (
    <div className="h-screen grid grid-cols-[auto_1fr] grid-rows-[60px_1fr] max-w-[200rem] mx-auto">
      <section className="col-start-1 col-end-3 row-start-1 row-end-2 border-b border-gray-200">
        <Topbar />
      </section>
      <section className="col-start-1 col-end-2 row-start-2 row-end-3 border-r border-l border-gray-200 overflow-y-auto">
        <Sidebar />
      </section>
      <main className="p-5 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
