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

  const actionClicked = (rowData) => {
    setSelectedRow(rowData);
    setIsModalOpen(true);
  };

  const handleModalOnClose = () => {
    setIsModalOpen(false);
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
      flex: 1,
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
<button
  onClick={handleDownloadClick}
  className="group flex items-center px-6 py-2.5 rounded-xl border border-[#800000]/30 bg-white text-[#800000] font-bold text-sm transition-all hover:bg-[#800000] hover:text-white active:scale-95 shadow-sm hover:shadow-[0_0_20px_rgba(128,0,0,0.15)] cursor-pointer"
>
  <FileDown className="w-4 h-4 mr-2 transition-all duration-300 group-hover:-translate-y-1 group-active:translate-y-0.5 stroke-[2.5px]" />
  
  <span className="relative">
    Export
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full opacity-30"></span>
  </span>
</button>
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
