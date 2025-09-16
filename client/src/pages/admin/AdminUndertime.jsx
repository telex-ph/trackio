import { useState } from "react";
import Table from "../../components/Table";
import { Edit, Trash2 } from "lucide-react";
import { DateTime } from "luxon";
import { ChevronRight } from "lucide-react";
import { useAttendance } from "../../hooks/useAttendance";
import { Datepicker } from "flowbite-react";

const AdminUndertime = () => {
  const zone = "Asia/Manila";

  // Initialize with today in PH time
  const [dateRange, setDateRange] = useState({
    startDate: DateTime.now().setZone(zone).startOf("day").toUTC().toISO(),
    endDate: DateTime.now().setZone(zone).endOf("day").toUTC().toISO(),
  });

  const filter = {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    status: "undertime",
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
      headerName: "Shirt Start",
      field: "shiftEnd",
      sortable: true,
      filter: false,
      flex: 1,
    },
    {
      headerName: "Time Out",
      field: "timeOut",
      sortable: true,
      filter: false,
      flex: 1,
    },
    {
      headerName: "Undertime Duration",
      field: "undertime",
      flex: 1,
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
      <section className="flex flex-col mb-4">
        <div className="flex items-center gap-1">
          <h2>Tracking</h2> <ChevronRight className="w-6 h-6" />
          <h2>Undertime</h2>
        </div>
        <p className="text-light">
          Review employees who logged out earlier than their scheduled shift
          end. This helps track productivity impact, identify patterns, and
          maintain proper attendance records.
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

export default AdminUndertime;
