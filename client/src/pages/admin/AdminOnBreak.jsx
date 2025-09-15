import React, { useState } from "react";
import Table from "../../components/Table"; // your reusable Table component
import { DateTime } from "luxon";
import { Datepicker } from "flowbite-react";
import { useAttendance } from "../../hooks/useAttendance";

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
      flex: 2,
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
      headerName: "1st Break Start",
      field: "firstBreakStart",
      sortable: true,
      filter: false,
      flex: 1,
    },
    {
      headerName: "1st Break End",
      field: "firstBreakEnd",
      sortable: true,
      filter: false,
      flex: 1,
    },
    {
      headerName: "2nd Break Start",
      field: "secondBreakStart",
      sortable: true,
      filter: false,
      flex: 1,
    },
    {
      headerName: "2nd Break End",
      field: "secondBreakEnd",
      sortable: true,
      filter: false,
      flex: 1,
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
      <h2 className="text-xl font-semibold mb-4">Admin On Break</h2>

      {/* Date Picker */}
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

export default AdminOnBreak;
