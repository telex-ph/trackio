import React, { useState } from "react";
import Table from "../../components/Table"; // your reusable Table component
import { DateTime } from "luxon";
import { Datepicker } from "flowbite-react";
import { useAttendance } from "../../hooks/useAttendance";
import { ChevronRight } from "lucide-react";

const AdminOnBreak = () => {
  const fmt = "hh:mm a";
  const zone = "Asia/Manila";

  const [dateRange, setDateRange] = useState({
    startDate: DateTime.now().setZone(zone).startOf("day").toUTC().toISO(),
    endDate: DateTime.now().setZone(zone).endOf("day").toUTC().toISO(),
  });

  const filter = {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    status: "onBreak",
  };

  const { attendancesByStatus, loading } = useAttendance(null, filter);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

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

  console.log(attendancesByStatus);

  if (loading) return <p>Loading...</p>;

  // Columns
  const columns = [
    { headerName: "ID", field: "id", sortable: true, filter: true, flex: 1 },
    {
      headerName: "Name",
      field: "name",
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: "Email",
      field: "email",
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: "Account",
      field: "accounts",
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: "Morning Break",
      filter: false,
      flex: 1,
      cellRenderer: (params) => {
        const breakStart = params.data.firstBreakStart;
        const breakEnd = params.data.firstBreakEnd;
        return `${breakStart} - ${breakEnd}`;
      },
    },
    {
      headerName: "Afternoon Break",
      filter: false,
      flex: 1,
      cellRenderer: (params) => {
        const breakStart = params.data.secondBreakStart;
        const breakEnd = params.data.secondBreakEnd;
        return `${breakStart} - ${breakEnd}`;
      },
    },
    {
      headerName: "Extended Break Duration",
      field: "extendedBreak",
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
          <h2>On Break</h2>
        </div>
        <p className="text-light">
          Track which employees' are currently on break and monitor their break
          durations. This helps ensure compliance with company policies and
          better visibility of team availability.
        </p>
      </section>

      <Table data={attendancesByStatus} columns={columns} />
    </div>
  );
};

export default AdminOnBreak;
