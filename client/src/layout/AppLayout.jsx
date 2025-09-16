import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import Topbar from "./Topbar";
import { useState, useEffect } from "react";

export default function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="h-screen grid grid-cols-[auto_1fr] grid-rows-[60px_1fr] max-w-[200rem] mx-auto bg-gray-100">
      <section className="col-start-1 col-end-3 row-start-1 row-end-2 border-b border-gray-200">
        <Topbar
          toggleSidebar={toggleSidebar}
          isCollapsed={isSidebarCollapsed}
        />
      </section>
      <section className="col-start-1 col-end-2 row-start-2 row-end-3 border-r border-gray-200 overflow-y-auto">
        <Sidebar isCollapsed={isSidebarCollapsed} />
      </section>
      <main
        className="p-5 overflow-y-auto bg-gray-50"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23F0F2F5'/%3E%3Cpath d='M0 0 L50 50 L100 0 Z' fill='%23E0E7FF' opacity='0.1'/%3E%3Cpath d='M0 100 L50 50 L100 100 Z' fill='%23E0E7FF' opacity='0.1'/%3E%3C/svg%3E\")",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
