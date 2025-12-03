import { useState } from "react";
import Table from "../../components/Table";
import { FileDown, Edit, Trash2 } from "lucide-react";
import { DateTime } from "luxon";
import { Datepicker } from "flowbite-react";
import { useAttendance } from "../../hooks/useAttendance";
import { useRef } from "react";
import exportCSV from "../../utils/exportCSV";
import TableAction from "../../components/TableAction";
import EmployeeModal from "../../components/modals/EmployeeModal";

const SharedLate = () => {
  const zone = "Asia/Manila";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

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
    {
      headerName: "ID",
      field: "employeeId",
      sortable: true,
      filter: true,
      flex: 1,
    },
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
      headerName: "Email",
      field: "email",
      sortable: true,
      filter: true,
      flex: 2,
    },
    {
      headerName: "Account",
      field: "accounts",
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
      cellRenderer: (params) => (
        <TableAction action={() => actionClicked(params.data)} />
      ),
    },
  ];

  const handleModalOnClose = () => {
    setIsModalOpen(false);
  };

  const tableRef = useRef();
  const handleDownloadClick = () => {
    exportCSV(tableRef, "late-list");
  };

  const actionClicked = (rowData) => {
    setSelectedRow(rowData);
    setIsModalOpen(true);
  };

  return (
    <div>
      <section className="flex items-center justify-between">
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
              value={DateTime.fromISO(dateRange.endDate)
                .setZone(zone)
                .toJSDate()}
              onChange={(date) => handleDatePicker(date, "endDate")}
            />
          </div>
        </section>
        <section>
          <button
            className="px-4 py-3 flex items-center gap-2 rounded-md cursor-pointer bg-blue-700 text-white"
            onClick={handleDownloadClick}
          >
            <FileDown className="w-4 h-4" />
            <span>Export</span>
          </button>
        </section>
      </section>

      <Table data={attendancesByStatus} columns={columns} tableRef={tableRef} />

      {isModalOpen && (
        <EmployeeModal employee={selectedRow} onClose={handleModalOnClose} />
      )}
    </div>
  );
};

export default SharedLate;
