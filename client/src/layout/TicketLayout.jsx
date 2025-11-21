import React from "react";
import { Outlet } from "react-router-dom";

const TicketLayout = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default TicketLayout;
