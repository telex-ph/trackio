import React, { useState } from "react";
import Table from "../../components/Table";
import TableAction from "../../components/TableAction";
import TableModal from "../../components/TableModal";
import TableEmployeeDetails from "../../components/TableEmployeeDetails";
import { FileText, Clock, Phone } from "lucide-react";
import { DateTime } from "luxon";
import { Datepicker } from "flowbite-react";

const TeamLeaderLate = () => {
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
      id: "CPH235",
      name: "Christine Brooks",
      email: "christine.brooks@example.com",
      scheduledIn: "9:00 A.M.",
      actualIn: "9:15 A.M.",
      tardyMinutes:
        parseTimeToMinutes("9:15 A.M.") - parseTimeToMinutes("9:00 A.M."),
      notes: "Traffic on the way",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      date: "2025-09-11",
    },
    {
      id: "CPH999",
      name: "John Doe",
      email: "john.doe@example.com",
      scheduledIn: "9:00 A.M.",
      actualIn: "9:05 A.M.",
      tardyMinutes:
        parseTimeToMinutes("9:05 A.M.") - parseTimeToMinutes("9:00 A.M."),
      notes: "Arrived slightly late",
      image:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
      date: "2025-09-11",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // Call Attempts Modal
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

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

  const sendNotification = async (minutes) => {
    if (!selectedRow) return;

    try {
      const response = await fetch("/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selectedRow.email,
          name: selectedRow.name,
          minutes,
        }),
      });

      if (response.ok) {
        alert(
          `✅ Email sent to ${selectedRow.name} for ${minutes} mins call attempt!`
        );
      } else {
        alert("❌ Failed to send email.");
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Error sending notification.");
    }
  };

  const columns = [
    { headerName: "ID", field: "id", flex: 1 },
    { headerName: "Name", field: "name", flex: 2 },
    { headerName: "Email", field: "email", flex: 2 },
    { headerName: "Scheduled Time In", field: "scheduledIn", flex: 2 },
    { headerName: "Actual Time In", field: "actualIn", flex: 2 },
    { headerName: "Minutes Late", field: "tardyMinutes", flex: 1 },
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

                {/* Late Details */}
                <div className="xl:col-span-2 space-y-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-6 h-6 text-gray-700" />
                    <h3 className="text-xl font-bold text-gray-900">
                      Tardiness Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Scheduled In */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Scheduled In
                      </h4>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedRow.scheduledIn}
                      </p>
                    </div>

                    {/* Actual In */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Actual In
                      </h4>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedRow.actualIn}
                      </p>
                    </div>

                    {/* Minutes Late */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Minutes Late
                      </h4>
                      <p className="text-lg font-semibold text-red-600">
                        {selectedRow.tardyMinutes} mins
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

                  {/* Call Attempts Card */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6 shadow-sm">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      Call Attempts
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">
                      View the employee’s call attempt history and details.
                    </p>
                    <button
                      onClick={() => setIsCallModalOpen(true)}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" /> View Call Attempts
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </TableModal>

      {/* Call Attempts Modal */}
      <TableModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        title="Call Attempts"
      >
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6 shadow-sm">
          <h4 className="text-lg font-bold text-gray-900 mb-2">
            Call Attempts
          </h4>
          <p className="text-sm text-gray-500 mb-4">
            Notify this employee by sending a call attempt reminder (3, 10, or
            30 minutes).
          </p>

          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => sendNotification(3)}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow"
            >
              3 mins
            </button>
            <button
              onClick={() => sendNotification(10)}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow"
            >
              10 mins
            </button>
            <button
              onClick={() => sendNotification(30)}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow"
            >
              30 mins
            </button>
          </div>
        </div>
      </TableModal>
    </div>
  );
};

export default TeamLeaderLate;
