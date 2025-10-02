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
      <Table data={attendancesByStatus} columns={columns} />
    </div>
  );
};

export default AdminOnBreak;
