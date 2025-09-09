import React from "react";
import Table from "../../components/Table"; // your reusable Table component

const AdminOnLunch = () => {
  // Mock Data
  const data = [
    {
      id: "EMP301",
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      account: "AliceJ123",
      lunchStart: "12:00 P.M.",
      lunchEnd: "12:30 P.M.",
      status: "On Lunch",
      extendedLunch: "5 min",
    },
    {
      id: "EMP302",
      name: "Bob Smith",
      email: "bob.smith@example.com",
      account: "BobS456",
      lunchStart: "12:15 P.M.",
      lunchEnd: "12:45 P.M.",
      status: "On Lunch",
      extendedLunch: "0 min",
    },
    {
      id: "EMP303",
      name: "Charlie Brown",
      email: "charlie.brown@example.com",
      account: "CharlieB789",
      lunchStart: "12:30 P.M.",
      lunchEnd: "1:00 P.M.",
      status: "On Lunch",
      extendedLunch: "10 min",
    },
  ];

  // Columns
  const columns = [
    { headerName: "ID", field: "id", sortable: true, filter: true, flex: 1 },
    { headerName: "Name", field: "name", sortable: true, filter: true, flex: 2 },
    { headerName: "Email Address", field: "email", sortable: true, filter: true, flex: 2 },
    { headerName: "Account", field: "account", sortable: true, filter: true, flex: 1 },
    { headerName: "Lunch Start", field: "lunchStart", sortable: true, filter: false, flex: 1 },
    { headerName: "Lunch End", field: "lunchEnd", sortable: true, filter: false, flex: 1 },
    { headerName: "Status", field: "status", sortable: true, filter: true, flex: 1 },
    { headerName: "Extended Lunch Duration", field: "extendedLunch", sortable: true, filter: false, flex: 1 },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Admin On Lunch</h2>
      <Table data={data} columns={columns} />
    </div>
  );
};

export default AdminOnLunch;
