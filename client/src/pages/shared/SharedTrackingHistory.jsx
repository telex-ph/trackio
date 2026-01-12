import { useRef, useState } from "react";
import Table from "../../components/Table";
import TableAction from "../../components/TableAction";
import { FileDown } from "lucide-react";
import { Datepicker } from "flowbite-react";
import { DateTime, Duration } from "luxon";
import { useAttendance } from "../../hooks/useAttendance";
import exportCSV from "../../utils/exportCSV";
import EmployeeModal from "../../components/modals/EmployeeModal";

const SharedTrackingHistory = () => {
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

  const actionClicked = (row) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  const columns = [
    { headerName: "ID", field: "employeeId", flex: 1 },
    { headerName: "Date", field: "date", flex: 1 },
    { headerName: "Name", field: "name", flex: 1 },
    {
      headerName: "Shift",
      field: "shift",
      flex: 2,
      filter: false,
      cellRenderer: (params) => {
        const data = params.data;
        return `${data.shiftStart} - ${data.shiftEnd}`;
      },
    },
    { headerName: "Time In", field: "timeIn", filter: false, flex: 1 },
    { headerName: "Time Out", field: "timeOut", filter: false, flex: 1 },
    {
      headerName: "Overall Break Duration",
      filter: false,
      flex: 1,
      cellRenderer: (params) => {
        const totalBreak = params.data.totalBreak;
        const formattedTotalBreak =
          Duration.fromMillis(totalBreak).toFormat("hh:mm:ss");
        return `${formattedTotalBreak}`;
      },
    },

    { headerName: "Notes", field: "notes", filter: false, flex: 1 },
    {
      headerName: "Action",
      field: "action",
      flex: 1,
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
    exportCSV(tableRef, "history-list");
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
      </section>
      <Table data={attendancesByStatus} columns={columns} tableRef={tableRef} />

      {isModalOpen && (
        <EmployeeModal employee={selectedRow} onClose={handleModalOnClose} />
      )}
    </div>
  );
};

export default SharedTrackingHistory;
