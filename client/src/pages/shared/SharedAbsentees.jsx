import React, { useRef, useState, useCallback, useMemo } from "react";
import Table from "../../components/Table";
import { DateTime } from "luxon";
import { Datepicker } from "flowbite-react";
import { FileDown } from "lucide-react";
import TableAction from "../../components/TableAction";
import { useAttendance } from "../../hooks/useAttendance";
import exportCSV from "../../utils/exportCSV";
import AbsenteeModal from "../../components/modals/AbsenteeModal";

const TIMEZONE = "Asia/Manila";

const SharedAbsentees = () => {
  const tableRef = useRef();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // Date range state
  const [dateRange, setDateRange] = useState(() => ({
    startDate: DateTime.now().setZone(TIMEZONE).startOf("day").toUTC().toISO(),
    endDate: DateTime.now().setZone(TIMEZONE).endOf("day").toUTC().toISO(),
  }));

  // Fetch absentees data
  const filter = useMemo(
    () => ({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }),
    [dateRange.startDate, dateRange.endDate]
  );

  const { absentees, loading } = useAttendance(null, filter);

  // Date picker handler
  const handleDatePicker = useCallback((date, field) => {
    if (!date) return;

    const isoDate =
      field === "startDate"
        ? DateTime.fromJSDate(date)
            .setZone(TIMEZONE)
            .startOf("day")
            .toUTC()
            .toISO()
        : DateTime.fromJSDate(date)
            .setZone(TIMEZONE)
            .endOf("day")
            .toUTC()
            .toISO();

    setDateRange((prev) => ({
      ...prev,
      [field]: isoDate,
    }));
  }, []);

  // Modal handlers
  const handleActionClick = useCallback((rowData) => {
    setSelectedRow(rowData);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedRow(null);
  }, []);

  // Export handler
  const handleExportClick = useCallback(() => {
    try {
      exportCSV(tableRef, "absentees-list");
    } catch (error) {
      console.error("Failed to export CSV:", error);
      // You can add toast notification here
    }
  }, []);

  // Table columns configuration
  const columns = useMemo(
    () => [
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
        headerName: "Status",
        field: "status",
        sortable: true,
        filter: true,
        flex: 1,
      },
      {
        headerName: "Action",
        field: "action",
        flex: 1,
        cellRenderer: (params) => (
          <TableAction action={() => handleActionClick(params.data)} />
        ),
      },
    ],
    [handleActionClick]
  );

  // Convert ISO dates to JS Date for Datepicker
  const startDateValue = useMemo(
    () => DateTime.fromISO(dateRange.startDate).setZone(TIMEZONE).toJSDate(),
    [dateRange.startDate]
  );

  const endDateValue = useMemo(
    () => DateTime.fromISO(dateRange.endDate).setZone(TIMEZONE).toJSDate(),
    [dateRange.endDate]
  );

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <section className="flex items-center justify-between">
        {/* Date Range Filters */}
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <Datepicker
              value={startDateValue}
              onChange={(date) => handleDatePicker(date, "startDate")}
              maxDate={new Date()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <Datepicker
              value={endDateValue}
              onChange={(date) => handleDatePicker(date, "endDate")}
              maxDate={new Date()}
              minDate={startDateValue}
            />
          </div>
        </div>

        {/* Export Button */}
        <button
          className="px-4 py-3 flex items-center gap-2 rounded-md cursor-pointer bg-blue-700 hover:bg-blue-800 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleExportClick}
          disabled={loading || !absentees?.length}
          title={!absentees?.length ? "No data to export" : "Export to CSV"}
        >
          <FileDown className="w-4 h-4" />
          <span>Export</span>
        </button>
      </section>

      {/* Table Section */}
      <Table
        columns={columns}
        data={absentees || []}
        tableRef={tableRef}
        loading={loading}
      />

      {/* Modal */}
      {isModalOpen && selectedRow && (
        <AbsenteeModal employee={selectedRow} onClose={handleModalClose} />
      )}
    </div>
  );
};

export default SharedAbsentees;
