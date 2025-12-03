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

export default SharedTrackingHistory;
