import { useState } from "react";
import Table from "../../components/Table";
import { ChevronRight, Clock, FileText } from "lucide-react";
import { DateTime } from "luxon";
import { Datepicker } from "flowbite-react";
import { useAttendance } from "../../hooks/useAttendance";

const SharedOnLunch = () => {
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
      headerName: "Email",
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
    // {
    //   headerName: "Status",
    //   field: "status",
    //   sortable: true,
    //   filter: true,
    //   flex: 1,
    // },
    // {
    //   headerName: "Extended Lunch Duration",
    //   field: "extendedLunch",
    //   sortable: true,
    //   filter: false,
    //   flex: 1,
    // },
  ];

  return (
    <div>
      <Table data={attendancesByStatus} columns={columns} />
    </div>
  );
};

export default SharedOnLunch;
