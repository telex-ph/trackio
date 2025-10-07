import React, { useState } from "react";
import Table from "../../components/Table";
import { DateTime } from "luxon";
import { useAttendance } from "../../hooks/useAttendance";

const SharedOnBreak = () => {
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
        console.log(params.data);

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
    // {
    //   headerName: "Extended Break Duration",
    //   field: "extendedBreak",
    //   sortable: true,
    //   filter: false,
    //   flex: 1,
    //   cellRenderer: (params) => {
    //     const record = params.data;

    //     const parseBreak = (start, end) => {
    //       if (!start || !end || start === "---" || end === "---") return 0;
    //       const startTime = DateTime.fromFormat(start, "hh:mm a");
    //       const endTime = DateTime.fromFormat(end, "hh:mm a");
    //       const diff = endTime.diff(startTime, "minutes").minutes;
    //       return diff > 0 ? diff : 0;
    //     };

    //     const firstBreak = parseBreak(
    //       record.firstBreakStart,
    //       record.firstBreakEnd
    //     );
    //     const secondBreak = parseBreak(
    //       record.secondBreakStart,
    //       record.secondBreakEnd
    //     );

    //     const calculateExtended = (duration) =>
    //       duration > 30 ? duration - 30 : 0;

    //     const extendedTotal =
    //       calculateExtended(firstBreak) + calculateExtended(secondBreak);

    //     const color =
    //       extendedTotal > 0 ? "text-red-600 font-semibold" : "text-gray-700";

    //     return <span className={color}>{extendedTotal} mins</span>;
    //   },
    // },
  ];

  return (
    <div>
      <Table data={attendancesByStatus} columns={columns} />
    </div>
  );
};

export default SharedOnBreak;
