import React from "react";
import Table from "../../components/Table"; // your reusable Table component
import { Trash2, Edit } from "lucide-react"; // action icons

const AdminAbsentees = () => {
  // Mock Data
  const data = [
    {
      id: "ADM001",
      name: "John Doe",
      email: "john.doe@example.com",
      account: "JDoe123",
      status: "Absent",
      validity: "Invalid",
    },
    {
      id: "ADM002",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      account: "JSmith456",
      status: "Absent",
      validity: "Valid",
    },
    {
      id: "ADM003",
      name: "Mark Johnson",
      email: "mark.johnson@example.com",
      account: "MJohn789",
      status: "Absent",
      validity: "Invalid",
    },
  ];

  // Columns
  const columns = [
    { headerName: "ID", field: "id", sortable: true, filter: true, flex: 1 },
    { headerName: "Name", field: "name", sortable: true, filter: true, flex: 2 },
    { headerName: "Email Address", field: "email", sortable: true, filter: true, flex: 2 },
    { headerName: "Account", field: "account", sortable: true, filter: true, flex: 1 },
    { headerName: "Status", field: "status", sortable: true, filter: true, flex: 1 },
    { headerName: "Valid / Invalid", field: "validity", sortable: true, filter: true, flex: 1 },
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
      <h2 className="text-xl font-semibold mb-4">Admin Absentees</h2>
      <Table data={data} columns={columns} />
    </div>
  );
};

export default AdminAbsentees;
