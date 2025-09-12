import React, { useState } from "react";
import Table from "../../components/Table";
import TableAction from "../../components/TableAction";
import TableModal from "../../components/TableModal";
import TableEmployeeDetails from "../../components/TableEmployeeDetails";
import { FileText, Clock } from "lucide-react";
import { DateTime } from "luxon";
import { Datepicker } from "flowbite-react";

const TeamLeaderOvertime = () => {
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr || timeStr === "-") return 0;
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "P.M." && hours !== 12) hours += 12;
    if (modifier === "A.M." && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  // Date Range State
  const [dateRange, setDateRange] = useState({
    startDate: DateTime.now()
      .setZone("Asia/Manila")
      .startOf("day")
      .toUTC()
      .toISO(),
    endDate: DateTime.now()
      .setZone("Asia/Manila")
      .endOf("day")
      .toUTC()
      .toISO(),
  });

  const handleDatePicker = (date, field) => {
    if (!date) return;
    const isoDate =
      field === "startDate"
        ? DateTime.fromJSDate(date)
            .setZone("Asia/Manila")
            .startOf("day")
            .toUTC()
            .toISO()
        : DateTime.fromJSDate(date)
            .setZone("Asia/Manila")
            .endOf("day")
            .toUTC()
            .toISO();
    setDateRange((prev) => ({ ...prev, [field]: isoDate }));
  };

  const [data, setData] = useState([
    {
      id: "EMP001",
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      scheduledOut: "6:00 P.M.",
      actualOut: "8:15 P.M.",
      undertimeDuration:
        parseTimeToMinutes("6:00 P.M.") - parseTimeToMinutes("6:00 P.M."),
      paidOvertime:
        parseTimeToMinutes("8:15 P.M.") - parseTimeToMinutes("6:00 P.M."),
      notes: "Stayed late to finish project tasks",
      image:
        "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=150&h=150&fit=crop&crop=face",
      date: "2025-09-11",
    },
    {
      id: "EMP002",
      name: "Michael Smith",
      email: "michael.smith@example.com",
      scheduledOut: "6:00 P.M.",
      actualOut: "7:05 P.M.",
      undertimeDuration:
        parseTimeToMinutes("6:00 P.M.") - parseTimeToMinutes("6:00 P.M."),
      paidOvertime:
        parseTimeToMinutes("7:05 P.M.") - parseTimeToMinutes("6:00 P.M."),
      notes: "Handled client meeting",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
      date: "2025-09-11",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

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

  const columns = [
    { headerName: "ID", field: "id", flex: 1 },
    { headerName: "Name", field: "name", flex: 2 },
    { headerName: "Email", field: "email", flex: 2 },
    { headerName: "Scheduled Time Out", field: "scheduledOut", flex: 2 },
    { headerName: "Actual Time Out", field: "actualOut", flex: 2 },
    { headerName: "Undertime Duration", field: "undertimeDuration", flex: 2 },
    { headerName: "Paid Overtime", field: "paidOvertime", flex: 2 },
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
      <section className="flex flex-col mb-2">
        <div className="flex items-center gap-1">
          <h2>Overtime Logs</h2>
        </div>
        <p className="text-light">
          Records of employees with undertime and overtime.
        </p>
      </section>

      {/* Date Picker Section */}
      <section className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <Datepicker
            value={DateTime.fromISO(dateRange.startDate)
              .setZone("Asia/Manila")
              .toJSDate()}
            onChange={(date) => handleDatePicker(date, "startDate")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <Datepicker
            value={DateTime.fromISO(dateRange.endDate)
              .setZone("Asia/Manila")
              .toJSDate()}
            onChange={(date) => handleDatePicker(date, "endDate")}
          />
        </div>
      </section>

      <Table data={data} columns={columns} />

      {/* Main Modal */}
      <TableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Details for ${selectedRow?.name}`}
        editable={true}
        onSave={handleUpdate}
      >
        {(isEditing) =>
          selectedRow && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Employee Info */}
                <div className="xl:col-span-1 space-y-6">
                  <TableEmployeeDetails employee={selectedRow} />
                </div>

                {/* Overtime Details */}
                <div className="xl:col-span-2 space-y-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-6 h-6 text-gray-700" />
                    <h3 className="text-xl font-bold text-gray-900">
                      Overtime Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Scheduled Out */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Scheduled Out
                      </h4>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedRow.scheduledOut}
                      </p>
                    </div>

                    {/* Actual Out */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Actual Out
                      </h4>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedRow.actualOut}
                      </p>
                    </div>

                    {/* Undertime Duration */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Undertime Duration
                      </h4>
                      <p className="text-lg font-semibold text-red-600">
                        {selectedRow.undertimeDuration} mins
                      </p>
                    </div>

                    {/* Paid Overtime */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Paid Overtime
                      </h4>
                      <p className="text-lg font-semibold text-green-600">
                        {selectedRow.paidOvertime} mins
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
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

export default TeamLeaderOvertime;
