import React from "react";
import Table from "../../components/Table"; // your reusable Table component
import { Edit, Trash2 } from "lucide-react";

const AdminLate = () => {
  // Mock Data
  const data = [
    {
      id: "EMP101",
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      account: "AliceJ123",
      scheduledTime: "9:00 A.M.",
      timeIn: "9:15 A.M.",
      tardiness: 15,
    },
    {
      id: "EMP102",
      name: "Bob Smith",
      email: "bob.smith@example.com",
      account: "BobS456",
      scheduledTime: "9:00 A.M.",
      timeIn: "9:05 A.M.",
      tardiness: 5,
    },
    {
      id: "EMP103",
      name: "Charlie Brown",
      email: "charlie.brown@example.com",
      account: "CharlieB789",
      scheduledTime: "9:00 A.M.",
      timeIn: "9:30 A.M.",
      tardiness: 30,
    },
  ];

  // Columns
  const columns = [
    { headerName: "ID", field: "id", sortable: true, filter: true, flex: 1 },
    { headerName: "Name", field: "name", sortable: true, filter: true, flex: 2 },
    { headerName: "Email Address", field: "email", sortable: true, filter: true, flex: 2 },
    { headerName: "Account", field: "account", sortable: true, filter: true, flex: 1 },
    { headerName: "Scheduled Time", field: "scheduledTime", sortable: true, filter: false, flex: 1 },
    { headerName: "Time In", field: "timeIn", sortable: true, filter: false, flex: 1 },
    { headerName: "Minutes of Tardiness", field: "tardiness", sortable: true, filter: false, flex: 1 },
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
      <h2 className="text-xl font-semibold mb-4">Admin Late Employees</h2>
      <Table data={data} columns={columns} />
    </div>
  );
};

export default AdminLate;
