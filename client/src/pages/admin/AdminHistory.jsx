import React, { useState } from "react";
import Table from "../../components/Table";
import TableAction from "../../components/TableAction";
import TableModal from "../../components/TableModal";
import TableEmployeeDetails from "../../components/TableEmployeeDetails";
import TableCalendarModal from "../../components/TableCalendarModal";
import { Clock, FileText } from "lucide-react";

const AdminHistory = () => {
  const [data, setData] = useState([
    {
      id: "EMP501",
      name: "Alice Johnson",
      date: "2025-09-10",
      timeIn: "9:10 A.M.",
      timeOut: "6:15 P.M.",
      scheduledStart: "9:00 A.M.",
      scheduledEnd: "6:00 P.M.",
      workDuration: "8h 5m",
      status: "Present",
      notes: "Completed tasks on time",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      attendance: [
        { date: "2025-09-01", status: "Present" },
        { date: "2025-09-02", status: "Late" },
        { date: "2025-09-03", status: "Overtime" },
      ],
    },
    {
      id: "EMP502",
      name: "Bob Smith",
      date: "2025-09-10",
      timeIn: "8:55 A.M.",
      timeOut: "6:00 P.M.",
      scheduledStart: "9:00 A.M.",
      scheduledEnd: "6:00 P.M.",
      workDuration: "9h 5m",
      status: "Present",
      notes: "On time and completed report",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      attendance: [
        { date: "2025-09-01", status: "Present" },
        { date: "2025-09-02", status: "Present" },
        { date: "2025-09-03", status: "Late" },
      ],
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  const actionClicked = (row) => {
    setSelectedRow(row);
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

  const openCalendarModal = () => setIsCalendarModalOpen(true);

  const timeToMinutes = (timeStr) => {
    const [hourMin, period] = timeStr.split(" ");
    let [hour, min] = hourMin.split(":");
    hour = parseInt(hour, 10);
    min = min ? parseInt(min, 10) : 0;
    if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
    if (period.toUpperCase() === "AM" && hour === 12) hour = 0;
    return hour * 60 + min;
  };

  const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const calculateDurations = (row) => {
    const scheduledStart = timeToMinutes(row.scheduledStart);
    const scheduledEnd = timeToMinutes(row.scheduledEnd);
    const timeIn = timeToMinutes(row.timeIn);
    const timeOut = timeToMinutes(row.timeOut);

    const late = timeIn > scheduledStart ? timeIn - scheduledStart : 0;
    const undertime = timeOut < scheduledEnd ? scheduledEnd - timeOut : 0;
    const overtime = timeOut > scheduledEnd ? timeOut - scheduledEnd : 0;

    return {
      Late: formatDuration(late),
      Undertime: formatDuration(undertime),
      Overtime: formatDuration(overtime),
      "Work Duration": row.workDuration,
    };
  };

  const columns = [
    { headerName: "ID", field: "id", flex: 1 },
    { headerName: "Name", field: "name", flex: 2 },
    { headerName: "Date", field: "date", flex: 1 },
    { headerName: "Time In", field: "timeIn", flex: 1 },
    { headerName: "Time Out", field: "timeOut", flex: 1 },
    { headerName: "Work Duration", field: "workDuration", flex: 1 },
    {
      headerName: "Action",
      field: "action",
      flex: 1,
      cellRenderer: (params) => (
        <TableAction action={() => actionClicked(params.data)} />
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Admin History</h2>
      <Table data={data} columns={columns} />

      {/* Employee Details Modal */}
      <TableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Details for ${selectedRow?.name}`}
        editable={true}
        onSave={handleUpdate}
      >
        {(isEditing) =>
          selectedRow && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Employee Details Card */}
              <div className="xl:col-span-1 space-y-6">
                <TableEmployeeDetails employee={selectedRow} />
              </div>

              {/* Work Details + Notes + Calendar */}
              <div className="xl:col-span-2 space-y-6">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <Clock className="w-5 h-5 text-gray-700" />
                    <h3 className="text-xl font-bold text-gray-900">
                      Work Details
                    </h3>
                  </div>

                  {/* Durations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {Object.entries(calculateDurations(selectedRow)).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
                        >
                          <p className="text-sm font-bold text-gray-500 uppercase mb-2">
                            {key}
                          </p>
                          <p className="text-2xl font-bold text-gray-900 font-mono">
                            {value}
                          </p>
                        </div>
                      )
                    )}
                  </div>

                  {/* Notes */}
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

                  {/* Calendar */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6 shadow-sm">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      Attendance Calendar
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">
                      View this employee’s attendance in a monthly calendar
                      format.
                    </p>
                    <button
                      onClick={openCalendarModal}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow transition-colors duration-200"
                    >
                      View Attendance Calendar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </TableModal>

      {/* Attendance Calendar Modal */}
      <TableCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        data={selectedRow?.attendance || []}
      />
    </div>
  );
};

export default AdminHistory;
