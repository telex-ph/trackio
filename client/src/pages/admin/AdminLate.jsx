import { useState } from "react";
import Table from "../../components/Table";
import { ChevronRight } from "lucide-react";
import { DateTime } from "luxon";
import { Datepicker } from "flowbite-react";
import { useAttendance } from "../../hooks/useAttendance";

const AdminLate = () => {
  const zone = "Asia/Manila";

  // Initialize with today in PH time
  const [dateRange, setDateRange] = useState({
    startDate: DateTime.now().setZone(zone).startOf("day").toUTC().toISO(),
    endDate: DateTime.now().setZone(zone).endOf("day").toUTC().toISO(),
  });

  const filter = {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    status: "late",
  };

  const { attendancesByStatus, loading } = useAttendance(null, filter);

  // handle datepicker
  const handleDatePicker = (date, field) => {
    if (!date) return;

    const isoDate =
      field === "startDate"
        ? DateTime.fromJSDate(date).setZone(zone).startOf("day").toUTC().toISO()
        : DateTime.fromJSDate(date).setZone(zone).endOf("day").toUTC().toISO();

    setDateRange((prev) => ({
      ...prev,
      [field]: isoDate,
    }));
  };

  // Columns
  const columns = [
    { headerName: "ID", field: "id", sortable: true, filter: true, flex: 1 },
    {
      headerName: "Date",
      field: "date",
      sortable: true,
      filter: true,
      flex: 2,
    },
    {
      headerName: "Name",
      field: "name",
      sortable: true,
      filter: true,
      flex: 2,
    },
    {
      headerName: "Email Address",
      field: "email",
      sortable: true,
      filter: true,
      flex: 2,
    },
    {
      headerName: "Account",
      field: "accounts",
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: "Shift Start",
      field: "shiftStart",
      sortable: true,
      filter: false,
      flex: 1,
    },
    {
      headerName: "Time In",
      field: "timeIn",
      sortable: true,
      filter: false,
      flex: 1,
    },
    {
      headerName: "Tardiness",
      field: "tardiness",
      sortable: true,
      filter: false,
      flex: 1,
      cellRenderer: (row) => {
        const value = row.data.tardiness;
        return `${value} minutes`;
      },
    },
    {
      headerName: "Action",
      field: "action",
      flex: 1,
      sortable: false,
      filter: false,
      // TODO: remove and improve this
      // cellRenderer: (row) => (
      //   <div className="flex gap-2">
      //     <button
      //       className="p-1 rounded hover:bg-yellow-200"
      //       onClick={() => alert(`Edit ${row.name}`)}
      //     >
      //       <Edit className="w-5 h-5 text-blue-500" />
      //     </button>
      //     <button
      //       className="p-1 rounded hover:bg-red-200"
      //       onClick={() => alert(`Delete ${row.name}`)}
      //     >
      //       <Trash2 className="w-5 h-5 text-red-500" />
      //     </button>
      //   </div>
      // ),
    },
  ];

  return (
    <div>
      <section className="flex flex-col mb-2">
        <div className="flex items-center gap-1">
          <h2>Monitoring</h2> <ChevronRight className="w-6 h-6" />
          <h2>Late</h2>
        </div>
        <p className="text-light">
          This page displays employee attendance records within the selected
          date range, providing an overview of time out activities.
        </p>
      </section>
      <section className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <Datepicker
            value={DateTime.fromISO(dateRange.startDate)
              .setZone(zone)
              .toJSDate()}
            onChange={(date) => handleDatePicker(date, "startDate")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <Datepicker
            value={DateTime.fromISO(dateRange.endDate).setZone(zone).toJSDate()}
            onChange={(date) => handleDatePicker(date, "endDate")}
          />
        </div>
      </section>

      <Table data={attendancesByStatus} columns={columns} />
    </div>
  );
};

export default AdminLate;
