import React from "react";
import { Link } from "react-router-dom";

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-100 text-black p-4 space-y-4">
      <h2 className="text-xl font-bold">EMS</h2>
      <nav className="flex flex-col gap-2">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/tracking">Tracking</Link>
      </nav>
    </aside>
  );
};
