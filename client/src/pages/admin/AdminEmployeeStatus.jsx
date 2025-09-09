import React from "react";
import Table from "../../components/Table"; // your reusable Table component
import { Edit, Trash2 } from "lucide-react";

const AdminEmployeeStatus = () => {
  // Mock Data
  const data = [
    {
      id: "EMP001",
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      account: "AliceJ123",
      workDuration: "8h 30m",
      status: "Working",
    },
    {
      id: "EMP002",
      name: "Bob Smith",
      email: "bob.smith@example.com",
      account: "BobS456",
      workDuration: "7h 45m",
      status: "On Break",
    },
    {
      id: "EMP003",
      name: "Charlie Brown",
      email: "charlie.brown@example.com",
      account: "CharlieB789",
      workDuration: "8h 15m",
      status: "Shift Ended",
    },
  ];

  // Columns
  const columns = [
    { headerName: "ID", field: "id", sortable: true, filter: true, flex: 1 },
    { headerName: "Name", field: "name", sortable: true, filter: true, flex: 2 },
    { headerName: "Email Address", field: "email", sortable: true, filter: true, flex: 2 },
    { headerName: "Account", field: "account", sortable: true, filter: true, flex: 1 },
    { headerName: "Work Duration", field: "workDuration", sortable: true, filter: false, flex: 1 },
    { headerName: "Status", field: "status", sortable: true, filter: true, flex: 1 },
    {
      headerName: "Action",
      field: "action",
      flex: 1,
      renderCell: (row) => (
        <div className="flex gap-2">
          <button
            className="p-1 rounded hover:bg-yellow-200"
            onClick={() => alert(`Edit ${row.name}`)}
          >
            <Edit className="w-5 h-5 text-blue-500" />
          </button>
          <button
            className="p-1 rounded hover:bg-red-200"
            onClick={() => alert(`Delete ${row.name}`)}
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Admin Employee Status</h2>
      <Table data={data} columns={columns} />
    </div>
  );
};

export default AdminEmployeeStatus;
