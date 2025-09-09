import React from "react";
import Table from "../../components/Table"; // your reusable Table component
import { Edit, Trash2 } from "lucide-react";

const AdminHistory = () => {
  // Mock Data
  const data = [
    {
      id: "EMP501",
      name: "Alice Johnson",
      timeIn: "9:10 A.M.",
      timeOut: "6:15 P.M.",
      scheduledStart: "9:00 A.M.",
      scheduledEnd: "6:00 P.M.",
    },
    {
      id: "EMP502",
      name: "Bob Smith",
      timeIn: "8:55 A.M.",
      timeOut: "6:00 P.M.",
      scheduledStart: "9:00 A.M.",
      scheduledEnd: "6:00 P.M.",
    },
    {
      id: "EMP503",
      name: "Charlie Brown",
      timeIn: "9:00 A.M.",
      timeOut: "5:45 P.M.",
      scheduledStart: "9:00 A.M.",
      scheduledEnd: "6:00 P.M.",
    },
  ];

  // Helper to convert time string to minutes
  const timeToMinutes = (timeStr) => {
    const [hourMin, period] = timeStr.split(" ");
    let [hour, min] = hourMin.split(":");
    hour = parseInt(hour, 10);
    min = min ? parseInt(min, 10) : 0;
    if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
    if (period.toUpperCase() === "AM" && hour === 12) hour = 0;
    return hour * 60 + min;
  };

  // Calculate Late, Undertime, Overtime, Work Duration
  const calculateMinutes = (row) => {
    const scheduledStart = timeToMinutes(row.scheduledStart);
    const scheduledEnd = timeToMinutes(row.scheduledEnd);
    const timeIn = timeToMinutes(row.timeIn);
    const timeOut = timeToMinutes(row.timeOut);

    const late = timeIn > scheduledStart ? timeIn - scheduledStart : 0;
    const undertime = timeOut < scheduledEnd ? scheduledEnd - timeOut : 0;
    const overtime = timeOut > scheduledEnd ? timeOut - scheduledEnd : 0;
    const workDuration = timeOut - timeIn;

    return { late, undertime, overtime, workDuration };
  };

  const columns = [
    { headerName: "ID", field: "id", sortable: true, filter: true, flex: 1 },
    { headerName: "Name", field: "name", sortable: true, filter: true, flex: 2 },
    { headerName: "Time In", field: "timeIn", sortable: true, filter: false, flex: 1 },
    { headerName: "Time Out", field: "timeOut", sortable: true, filter: false, flex: 1 },
    {
      headerName: "Late",
      field: "late",
      flex: 1,
      renderCell: (row) => {
        const { late } = calculateMinutes(row);
        return late > 0 ? `${late} min` : "";
      },
    },
    {
      headerName: "Undertime",
      field: "undertime",
      flex: 1,
      renderCell: (row) => {
        const { undertime } = calculateMinutes(row);
        return undertime > 0 ? `${undertime} min` : "";
      },
    },
    {
      headerName: "Overtime",
      field: "overtime",
      flex: 1,
      renderCell: (row) => {
        const { overtime } = calculateMinutes(row);
        return overtime > 0 ? `${overtime} min` : "";
      },
    },
    {
      headerName: "Work Duration",
      field: "workDuration",
      flex: 1,
      renderCell: (row) => {
        const { workDuration } = calculateMinutes(row);
        const hours = Math.floor(workDuration / 60);
        const minutes = workDuration % 60;
        return `${hours}h ${minutes}m`;
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
      <h2 className="text-xl font-semibold mb-4">Admin History</h2>
      <Table data={data} columns={columns} />
    </div>
  );
};

export default AdminHistory;
