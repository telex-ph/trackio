import React from "react";
import Table from "../../components/Table"; // your reusable Table component
import { Edit, Trash2 } from "lucide-react";

const AdminUndertime = () => {
  // Mock Data
  const data = [
    {
      id: "EMP401",
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      account: "AliceJ123",
      scheduledTimeOut: "6:00 P.M.",
      timeOut: "5:45 P.M.",
    },
    {
      id: "EMP402",
      name: "Bob Smith",
      email: "bob.smith@example.com",
      account: "BobS456",
      scheduledTimeOut: "6:00 P.M.",
      timeOut: "6:00 P.M.",
    },
    {
      id: "EMP403",
      name: "Charlie Brown",
      email: "charlie.brown@example.com",
      account: "CharlieB789",
      scheduledTimeOut: "6:00 P.M.",
      timeOut: "5:30 P.M.",
    },
  ];

  // Helper to calculate undertime in minutes
  const calculateUndertime = (scheduled, actual) => {
    if (!actual) return null;
    const parseTime = (time) => {
      const [hourMin, period] = time.split(" ");
      let [hour, min] = hourMin.split(":");
      hour = parseInt(hour, 10);
      min = min ? parseInt(min, 10) : 0;
      if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
      if (period.toUpperCase() === "AM" && hour === 12) hour = 0;
      return hour * 60 + min;
    };
    const diff = parseTime(scheduled) - parseTime(actual);
    return diff > 0 ? diff : 0; // only positive undertime
  };

  const columns = [
    { headerName: "ID", field: "id", sortable: true, filter: true, flex: 1 },
    { headerName: "Name", field: "name", sortable: true, filter: true, flex: 2 },
    { headerName: "Email Address", field: "email", sortable: true, filter: true, flex: 2 },
    { headerName: "Account", field: "account", sortable: true, filter: true, flex: 1 },
    { headerName: "Scheduled Time Out", field: "scheduledTimeOut", sortable: true, filter: false, flex: 1 },
    { headerName: "Time Out", field: "timeOut", sortable: true, filter: false, flex: 1 },
    {
      headerName: "Undertime Duration",
      field: "undertime",
      flex: 1,
      renderCell: (row) => {
        const minutes = calculateUndertime(row.scheduledTimeOut, row.timeOut);
        return minutes > 0 ? `${minutes} min` : "";
      },
    },
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
      <h2 className="text-xl font-semibold mb-4">Admin Undertime</h2>
      <Table data={data} columns={columns} />
    </div>
  );
};

export default AdminUndertime;
