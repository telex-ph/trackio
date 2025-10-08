import React, { useState } from "react";
import Table from "../../components/Table";
import TableAction from "../../components/TableAction";
import TableModal from "../../components/TableModal";
import TableEmployeeDetails from "../../components/TableEmployeeDetails";
import { ChevronRight, Clock, FileText } from "lucide-react";
import { DateTime } from "luxon";
import { Datepicker } from "flowbite-react";
import { useAttendance } from "../../hooks/useAttendance";
import { STATUS_COLORS } from "../../constants/status";

const SharedStatus = () => {
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

  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  const actionClicked = (rowData) => {
    setSelectedRow(rowData);
    setIsModalOpen(true);
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

  const openCalendarModal = () => {
    setIsCalendarModalOpen(true);
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
      headerName: "Email Address",
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
      headerName: "Status",
      field: "status",
      sortable: true,
      filter: true,
      flex: 1,
      cellRenderer: (params) => {
        const status = params.data.status;
        const color = STATUS_COLORS[status].textColor;
        return (
          <section className="w-full flex items-center justify-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            ></div>
            <span style={{ color: color }}>{status}</span>
          </section>
        );
      },
    },
    // {
    //   headerName: "Action",
    //   field: "action",
    //   flex: 1,
    //   cellRenderer: (params) => (
    //     <TableAction action={() => actionClicked(params.data)} />
    //   ),
    //   filter: false,
    // },
  ];

  return (
    <div>
      <Table columns={columns} data={attendancesByStatus} />

      {/* Employee Details Modal */}
      <TableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Employee Details"
        editable={true}
        onSave={handleUpdate}
        recordedAt={selectedRow?.attendance?.[0]?.date}
      >
        {(isEditing) =>
          selectedRow && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-1 space-y-6">
                <TableEmployeeDetails employee={selectedRow} />
              </div>

              <div className="xl:col-span-2 space-y-6">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <Clock className="w-5 h-5 text-gray-700" />
                    <h3 className="text-xl font-bold text-gray-900">
                      Work Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-xl p-6 border-2 border-gray-900 shadow-sm">
                      <p className="text-sm font-bold text-gray-500 uppercase mb-2">
                        Work Duration
                      </p>
                      <p className="text-4xl font-bold text-gray-900 font-mono">
                        {selectedRow.workDuration}
                      </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <p className="text-sm font-bold text-gray-500 uppercase mb-2">
                        Status
                      </p>
                      <span
                        className={`px-4 py-2 rounded-lg text-lg font-bold ${getStatusColor(
                          selectedRow.status
                        )}`}
                      >
                        {selectedRow.status}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <h4 className="text-lg font-bold text-gray-900">Notes</h4>
                    </div>
                    <textarea
                      className={`w-full border rounded-lg p-3 font-medium resize-none focus:outline-none focus:ring-2 ${
                        isEditing
                          ? "border-blue-500 bg-white"
                          : "border-gray-300 bg-gray-50"
                      }`}
                      rows={4}
                      value={selectedRow.notes}
                      onChange={(e) =>
                        setSelectedRow((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                      placeholder="Enter notes here..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </TableModal>
    </div>
  );
};

export default SharedStatus;
