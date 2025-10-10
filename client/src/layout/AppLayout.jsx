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
    // <div className="h-screen grid grid-cols-[auto_1fr] grid-rows-[70px_1fr] max-w-[200rem] mx-auto border-x border-gray-200">
    <div className="h-screen grid grid-cols-[auto_1fr] grid-rows-[90px_1fr] max-w-[200rem] mx-auto border-x border-gray-200">
      <section className="col-start-1 col-end-3 row-start-1 row-end-2 border-b border-gray-200">
        <Topbar
          toggleSidebar={toggleSidebar}
          isCollapsed={isSidebarCollapsed}
        />
      </section>
      <section className="col-start-1 col-end-2 row-start-2 row-end-3 border-r border-gray-200 overflow-y-auto">
        <Sidebar isCollapsed={isSidebarCollapsed} />
      </section>
      <main className="p-5 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
