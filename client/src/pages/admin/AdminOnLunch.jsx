import { useState } from "react";
import Table from "../../components/Table";
import { ChevronRight, Clock, FileText } from "lucide-react";
import { DateTime } from "luxon";
import { Datepicker } from "flowbite-react";
import { useAttendance } from "../../hooks/useAttendance";

const AdminOnLunch = () => {
  const zone = "Asia/Manila";
  // Initialize with today in PH time
  const [dateRange, setDateRange] = useState({
    startDate: DateTime.now().setZone(zone).startOf("day").toUTC().toISO(),
    endDate: DateTime.now().setZone(zone).endOf("day").toUTC().toISO(),
  });

  const filter = {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    status: "onLunch",
  };

  const { attendancesByStatus, loading } = useAttendance(null, filter);

  // handle date picker changes
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
      field: "account",
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: "Lunch Start",
      field: "lunchStart",
      sortable: true,
      filter: false,
      flex: 1,
    },
    {
      headerName: "Lunch End",
      field: "lunchEnd",
      sortable: true,
      filter: false,
      flex: 1,
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: "Extended Lunch Duration",
      field: "extendedLunch",
      sortable: true,
      filter: false,
      flex: 1,
    },
  ];

  return (
    <div>
      <section className="flex flex-col mb-4">
        <div className="flex items-center gap-1">
          <h2>Monitoring</h2> <ChevronRight className="w-6 h-6" />{" "}
          <h2>On Lunch</h2>
        </div>
        <p className="text-light">
          View employees who are currently on their lunch break and monitor the
          duration. This helps manage overall team availability throughout the
          day.
        </p>
      </section>

      <Table data={attendancesByStatus} columns={columns} />
    </div>
  );
};

export default AdminOnLunch;
