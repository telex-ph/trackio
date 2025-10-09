import { useRef, useState } from "react";
import Table from "../../components/Table";
import { DateTime } from "luxon";
import { Datepicker } from "flowbite-react";
import { Clock, FileDown, FileText, CheckCircle } from "lucide-react";
import TableAction from "../../components/TableAction";
import EmployeeModal from "../../components/modals/EmployeeModal";
import TableModal from "../../components/TableModal";
import TableEmployeeDetails from "../../components/TableEmployeeDetails";
import { useAttendance } from "../../hooks/useAttendance";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { CsvExportModule } from "@ag-grid-community/csv-export";
import exportCSV from "../../utils/exportCSV";

ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);

const SharedTimeIn = () => {
  const zone = "Asia/Manila";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [dateRange, setDateRange] = useState({
    startDate: DateTime.now().setZone(zone).startOf("day").toUTC().toISO(),
    endDate: DateTime.now().setZone(zone).endOf("day").toUTC().toISO(),
  });

  const filter = {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    status: "timeIn",
  };

  const { attendancesByStatus, loading } = useAttendance(null, filter);

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

  const handleUpdate = () => {
    if (!selectedRow) return;
    setData((prev) =>
      prev.map((item) =>
        item.id === selectedRow.id
          ? { ...item, notes: selectedRow.notes }
          : item
      )
    );
  };

  const actionClicked = (rowData) => {
    setSelectedRow(rowData);
    setIsModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "working":
        return "bg-green-100 text-green-800 border border-green-300";
      case "on break":
        return "bg-yellow-100 text-yellow-800 border border-yellow-400";
      case "shift ended":
        return "bg-gray-100 text-gray-800 border border-gray-300";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200";
    }
  };

  const handleModalOnClose = () => {
    setIsModalOpen(false);
  };

  // Columns
  const columns = [
    {
      headerName: "ID",
      field: "id",
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
      sortable: true,
      filter: true,
      flex: 2,
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
      headerName: "Punctuality",
      field: "punctuality",
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: "Action",
      field: "action",
      flex: 1,
      cellRenderer: (params) => (
        <TableAction action={() => actionClicked(params.data)} />
      ),
      filter: false,
    },
  ];

  const tableRef = useRef();
  const handleDownloadClick = () => {
    exportCSV(tableRef, "time-in-list");
  };

  return (
    <div>
      {/* Date Picker */}
      <section className="flex items-center justify-between">
        <section className="flex gap-4 mb-4 items-center">
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
      {/* Table */}
      <Table columns={columns} data={attendancesByStatus} tableRef={tableRef} />

      {isModalOpen && (
        <EmployeeModal employee={selectedRow} onClose={handleModalOnClose} />
      )}
    </div>
  );
};

export default SharedTimeIn;
