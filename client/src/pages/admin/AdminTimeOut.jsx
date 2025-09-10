import React, { useEffect, useState } from "react";
import api from "../../utils/axios";
import Table from "../../components/Table";
import { DateTime } from "luxon";
import { Datepicker } from "flowbite-react";
import { ChevronRight, Clock, FileText, CheckCircle } from "lucide-react";
import TableAction from "../../components/TableAction";
import TableModal from "../../components/TableModal";
import TableEmployeeDetails from "../../components/TableEmployeeDetails";

const AdminTimeOut = () => {
  const [data, setData] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: DateTime.utc().startOf("day").toISO(),
    endDate: DateTime.utc().endOf("day").toISO(),
  });
  const [selectedRow, setSelectedRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Example schedule: workday ends at 5:30 PM
  const scheduledEndTime = DateTime.fromFormat("05:30 PM", "hh:mm a");

  const handleDatePicker = (date, field) => {
    if (!date) return;
    const isoDate =
      field === "startDate"
        ? DateTime.fromJSDate(date).toUTC().startOf("day").toISO()
        : DateTime.fromJSDate(date).toUTC().endOf("day").toISO();
    setDateRange((prev) => ({ ...prev, [field]: isoDate }));
  };

  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        // Replace with API call if needed
        // const response = await api.get("/attendance/get-attendances", { params: dateRange });
        // const attendances = response.data;

        // Sample data
        const attendances = [
          {
            user: { firstName: "Juan", lastName: "Dela Cruz", email: "juan@example.com", role: "Engineer", department: "IT", phone: "09123456789" },
            accounts: [{ name: "Account A" }],
            timeOut: "18:00", // 6:00 PM
            notes: "Worked late on project",
            timeOutLocation: "Office",
          },
          {
            user: { firstName: "Maria", lastName: "Santos", email: "maria@example.com", role: "HR", department: "Human Resources", phone: "09987654321" },
            accounts: [{ name: "Account B" }],
            timeOut: "16:45", // 4:45 PM
            notes: "Left early for appointment",
            timeOutLocation: "Remote",
          },
          {
            user: { firstName: "Pedro", lastName: "Reyes", email: "pedro@example.com", role: "Support", department: "Customer Service", phone: "09234567890" },
            accounts: [{ name: "Account C" }],
            timeOut: null, // not logged out
            notes: "",
            timeOutLocation: "Office",
          },
        ];

        const formattedData = attendances.map((item, index) => {
          let timeOut = item.timeOut
            ? DateTime.fromFormat(item.timeOut, "HH:mm").toFormat("hh:mm a")
            : "Not Logged Out";

          // Determine status
          let status = "Not Logged Out";
          if (item.timeOut) {
            const timeOutDT = DateTime.fromFormat(item.timeOut, "HH:mm");
            if (timeOutDT > scheduledEndTime) status = "Overtime";
            else if (timeOutDT < scheduledEndTime) status = "Undertime";
            else status = "On Time";
          }

          return {
            id: index + 1,
            name: `${item.user.firstName} ${item.user.lastName}`,
            email: item.user.email,
            timeOut,
            status,
            accounts: item.accounts.map((a) => a.name).join(", "),
            notes: item.notes || "",
            role: item.user.role || "",
            department: item.user.department || "",
            phone: item.user.phone || "",
            timeOutLocation: item.timeOutLocation || "",
          };
        });

        setData(formattedData);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    fetchAttendances();
  }, [dateRange]);

  const actionClicked = (rowData) => {
    setSelectedRow(rowData);
    setIsModalOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedRow) return;
    setData((prev) =>
      prev.map((item) =>
        item.id === selectedRow.id ? { ...item, notes: selectedRow.notes } : item
      )
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "overtime":
        return "bg-green-100 text-green-800 border border-green-300";
      case "undertime":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "on time":
        return "bg-gray-100 text-gray-800 border border-gray-300";
      case "not logged out":
        return "bg-red-100 text-red-800 border border-red-300";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200";
    }
  };

  const columns = [
    { headerName: "ID", field: "id", sortable: true, filter: true, flex: 1 },
    { headerName: "Name", field: "name", sortable: true, filter: true, flex: 2 },
    { headerName: "Email", field: "email", sortable: true, filter: true, flex: 2 },
    { headerName: "Account", field: "accounts", sortable: true, filter: true, flex: 2 },
    { headerName: "Time Out", field: "timeOut", sortable: true, filter: false, flex: 1 },
    { headerName: "Status", field: "status", sortable: true, filter: true, flex: 1 },
    {
      headerName: "Action",
      field: "action",
      flex: 1,
      cellRenderer: (params) => <TableAction action={() => actionClicked(params.data)} />,
      filter: false,
    },
  ];

  return (
    <div>
      <section className="flex flex-col mb-2">
        <div className="flex items-center gap-1">
          <h2>Tracking</h2> <ChevronRight className="w-6 h-6" /> <h2>Time Out</h2>
        </div>
        <p className="text-light">Any updates will reflect on the admin account profile.</p>
      </section>

      {/* Date Picker */}
      <section className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <Datepicker
            value={DateTime.fromISO(dateRange.startDate).toJSDate()}
            onChange={(date) => handleDatePicker(date, "startDate")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <Datepicker
            value={DateTime.fromISO(dateRange.endDate).toJSDate()}
            onChange={(date) => handleDatePicker(date, "endDate")}
          />
        </div>
      </section>

      <Table columns={columns} data={data} />

      {/* Modal */}
      <TableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Employee Time Out Details"
        editable={true}
        onSave={handleUpdate}
      >
        {(isEditing) =>
          selectedRow && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Employee Details */}
              <div className="xl:col-span-1 space-y-6">
                <TableEmployeeDetails employee={selectedRow} />
              </div>

              {/* Time Out & Notes */}
              <div className="xl:col-span-2 space-y-6">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <Clock className="w-5 h-5 text-gray-700" />
                    <h3 className="text-xl font-bold text-gray-900">Time Out & Status</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Time Out */}
                    <div className="bg-white rounded-xl p-6 border-2 border-gray-900 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <Clock className="w-6 h-6 text-gray-700" />
                        <p className="text-sm font-bold text-gray-500 uppercase">Time Out</p>
                      </div>
                      <p className="text-4xl font-bold text-gray-900 font-mono">{selectedRow.timeOut}</p>
                    </div>

                    {/* Status */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle className="w-6 h-6 text-gray-700" />
                        <p className="text-sm font-bold text-gray-500 uppercase">Status</p>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-lg text-lg font-bold ${getStatusColor(
                          selectedRow.status
                        )}`}
                      >
                        {selectedRow.status}
                      </span>
                    </div>
                  </div>

                  {/* Daily Notes (editable) */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <h4 className="text-lg font-bold text-gray-900">Daily Notes</h4>
                    </div>
                    {isEditing ? (
                      <textarea
                        className="w-full bg-white border border-blue-500 rounded-lg p-3 text-gray-800 font-medium resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        value={selectedRow.notes}
                        onChange={(e) =>
                          setSelectedRow((prev) => ({ ...prev, notes: e.target.value }))
                        }
                        placeholder="Enter daily notes here..."
                      />
                    ) : (
                      <p className="text-gray-800">{selectedRow.notes || "No notes provided."}</p>
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

export default AdminTimeOut;
