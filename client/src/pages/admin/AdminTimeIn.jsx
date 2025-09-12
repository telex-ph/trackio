import React, { useEffect, useState } from "react";
import Table from "../../components/Table";
import { DateTime } from "luxon";
import { Datepicker } from "flowbite-react";
import { ChevronRight, Clock, FileText, CheckCircle } from "lucide-react";
import TableAction from "../../components/TableAction";
import TableModal from "../../components/TableModal";
import TableEmployeeDetails from "../../components/TableEmployeeDetails";
import api from "../../utils/axios";

const AdminTimeIn = () => {
  const fmt = "hh:mm a";
  const zone = "Asia/Manila";

  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [dateRange, setDateRange] = useState({
    startDate: DateTime.now().setZone(zone).startOf("day").toUTC().toISO(),
    endDate: DateTime.now().setZone(zone).endOf("day").toUTC().toISO(),
  });

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

  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const response = await api.get("/attendance/get-attendances", {
          params: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            status: "timeIn",
          },
        });

        const formattedData = response.data.map((item) => {
          const timeIn = item.timeIn
            ? DateTime.fromISO(item.timeIn).setZone(zone).toFormat(fmt)
            : "Not Logged In";

          const shiftStart = item.shiftStart
            ? DateTime.fromISO(item.shiftStart).setZone(zone).toFormat(fmt)
            : "Not Logged In";

          const createdAt = item.createdAt
            ? DateTime.fromISO(item.createdAt)
                .setZone(zone)
                .toFormat("yyyy-MM-dd")
            : "Not Logged In";

          const accounts = item.accounts.map((acc) => acc.name).join(",");

          // Calculating if the user is late or not
          const shift = DateTime.fromISO(item.shiftStart);
          const time = DateTime.fromISO(item.timeIn);
          const punctuality = time <= shift ? "On Time" : "Late";

          return {
            id: item.user._id,
            date: createdAt,
            name: `${item.user.firstName} ${item.user.lastName}`,
            email: item.user.email,
            shiftStart,
            timeIn,
            punctuality,
            accounts,
          };
        });

        setData(formattedData);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    fetchAttendances();
  }, [dateRange]);

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

  return (
    <div>
      {/* Page Header */}
      <section className="flex flex-col mb-2">
        <div className="flex items-center gap-1">
          <h2>Tracking</h2> <ChevronRight className="w-6 h-6" />{" "}
          <h2>Time In</h2>
        </div>
        <p className="text-light">
          This page displays employee attendance records within the selected
          date range, providing an overview of time in activities.
        </p>
      </section>

      {/* Date Picker */}
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
            value={DateTime.fromISO(dateRange.endDate).setZone(zone).toJSDate()}
            onChange={(date) => handleDatePicker(date, "endDate")}
          />
        </div>
      </section>

      {/* Table */}
      <Table columns={columns} data={data} />

      {/* Modal */}
      <TableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Employee Details"
        editable={true}
        onSave={handleUpdate}
      >
        {(isEditing) =>
          selectedRow && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Employee Details (read-only) */}
              <div className="xl:col-span-1 space-y-6">
                <TableEmployeeDetails employee={selectedRow} />
              </div>

              {/* Time & Notes */}
              <div className="xl:col-span-2 space-y-6">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <Clock className="w-5 h-5 text-gray-700" />
                    <h3 className="text-xl font-bold text-gray-900">
                      Time & Status Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Time In */}
                    <div className="bg-white rounded-xl p-6 border-2 border-gray-900 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <Clock className="w-6 h-6 text-gray-700" />
                        <p className="text-sm font-bold text-gray-500 uppercase">
                          Time In
                        </p>
                      </div>
                      <p className="text-4xl font-bold text-gray-900 font-mono">
                        {selectedRow.timeIn}
                      </p>
                    </div>

                    {/* Attendance Status */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle className="w-6 h-6 text-gray-700" />
                        <p className="text-sm font-bold text-gray-500 uppercase">
                          Attendance Status
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-4 py-2 rounded-lg text-lg font-bold ${getStatusColor(
                            selectedRow.status
                          )}`}
                        >
                          {selectedRow.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Daily Notes (editable) */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <h4 className="text-lg font-bold text-gray-900">
                        Daily Notes
                      </h4>
                    </div>

                    {isEditing ? (
                      <textarea
                        className="w-full bg-white border border-blue-500 rounded-lg p-3 text-gray-800 font-medium resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        value={selectedRow.notes}
                        onChange={(e) =>
                          setSelectedRow((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        placeholder="Enter daily notes here..."
                      />
                    ) : (
                      <p className="text-gray-800">
                        {selectedRow.notes || "No notes provided."}
                      </p>
                    )}
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

export default AdminTimeIn;
