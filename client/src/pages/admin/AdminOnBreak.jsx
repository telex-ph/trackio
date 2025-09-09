import React from "react";
import Table from "../../components/Table"; // your reusable Table component

const AdminOnBreak = () => {
  // Mock Data
  const data = [
    {
      id: "EMP201",
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      account: "AliceJ123",
      breakStart: "12:00 P.M.",
      breakEnd: "12:30 P.M.",
      status: "On Break",
      extendedBreak: "5 min",
    },
    {
      id: "EMP202",
      name: "Bob Smith",
      email: "bob.smith@example.com",
      account: "BobS456",
      breakStart: "1:00 P.M.",
      breakEnd: "1:20 P.M.",
      status: "On Break",
      extendedBreak: "0 min",
    },
    {
      id: "EMP203",
      name: "Charlie Brown",
      email: "charlie.brown@example.com",
      account: "CharlieB789",
      breakStart: "12:15 P.M.",
      breakEnd: "12:45 P.M.",
      status: "On Break",
      extendedBreak: "10 min",
    },
  ];

  // Columns
  const columns = [
    { headerName: "ID", field: "id", sortable: true, filter: true, flex: 1 },
    { headerName: "Name", field: "name", sortable: true, filter: true, flex: 2 },
    { headerName: "Email Address", field: "email", sortable: true, filter: true, flex: 2 },
    { headerName: "Account", field: "account", sortable: true, filter: true, flex: 1 },
    { headerName: "Break Start", field: "breakStart", sortable: true, filter: false, flex: 1 },
    { headerName: "Break End", field: "breakEnd", sortable: true, filter: false, flex: 1 },
    { headerName: "Status", field: "status", sortable: true, filter: true, flex: 1 },
    { headerName: "Extended Break Duration", field: "extendedBreak", sortable: true, filter: false, flex: 1 },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Admin On Break</h2>
      <Table data={data} columns={columns} />
    </div>
  );
};

export default AdminOnBreak;
