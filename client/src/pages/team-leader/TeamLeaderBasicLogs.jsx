import React, { useState } from "react";
import Table from "../../components/Table";
import TableAction from "../../components/TableAction";
import TableModal from "../../components/TableModal";
import TableEmployeeDetails from "../../components/TableEmployeeDetails";
import { Clock, FileText, Briefcase } from "lucide-react";
import { DateTime } from "luxon";
import { Datepicker } from "flowbite-react";

const TeamLeaderBasicLogs = () => {
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr || timeStr === "-") return 0;
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "P.M." && hours !== 12) hours += 12;
    if (modifier === "A.M." && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const STANDARD_BREAK_MINUTES = 15;

  // Date Range
  const [dateRange, setDateRange] = useState({
    startDate: DateTime.now()
      .setZone("Asia/Manila")
      .startOf("day")
      .toUTC()
      .toISO(),
    endDate: DateTime.now().setZone("Asia/Manila").endOf("day").toUTC().toISO(),
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
      date: "2025-09-11",
      timeIn: "9:00 A.M.",
      timeOut: "-",
      status: "Working",
      notes: "Currently working",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      breaks: [
        { type: "Morning Break", start: "10:30 A.M.", end: "10:40 A.M." },
        { type: "Lunch Break", start: "12:00 P.M.", end: "12:30 P.M." },
        { type: "Afternoon Break", start: "3:00 P.M.", end: "3:15 P.M." },
      ],
    },
    {
      id: "CPH999",
      name: "John Doe",
      email: "john.doe@example.com",
      date: "2025-09-11",
      timeIn: "9:05 A.M.",
      timeOut: "-",
      status: "Working",
      notes: "Currently working",
      image:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
      breaks: [
        { type: "Morning Break", start: "10:20 A.M.", end: "10:40 A.M." }, // overbreak 5m
        { type: "Lunch Break", start: "12:10 P.M.", end: "12:25 P.M." }, // within 15m
        { type: "Afternoon Break", start: "3:10 P.M.", end: "3:25 P.M." }, // within 15m
      ],
    },
    {
      id: "CPH123",
      name: "Alice Smith",
      email: "alice.smith@example.com",
      date: "2025-09-11",
      timeIn: "9:00 A.M.",
      timeOut: "-",
      status: "Working",
      notes: "Currently working",
      image:
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop&crop=face",
      breaks: [
        { type: "Morning Break", start: "10:00 A.M.", end: "10:20 A.M." }, // overbreak 5m
        { type: "Lunch Break", start: "12:00 P.M.", end: "12:25 P.M." }, // overbreak 10m
        { type: "Afternoon Break", start: "3:00 P.M.", end: "3:15 P.M." }, // exactly 15m
      ],
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
    { headerName: "Date", field: "date", flex: 1 },
    { headerName: "Time In", field: "timeIn", flex: 1 },
    { headerName: "Time Out", field: "timeOut", flex: 1 },
    { headerName: "Status", field: "status", flex: 1 },
    {
      headerName: "View Break",
      field: "viewBreak",
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
          <h2>Basic Logs</h2>
        </div>
        <p className="text-light">
          Any updates will reflect on the admin account profile.
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

      {/* Modal */}
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
              {/* Title inside modal body */}
              <h2 className="text-2xl font-bold text-gray-900">
                Details for {selectedRow.name}
              </h2>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Employee Info */}
                <div className="xl:col-span-1 space-y-6">
                  <TableEmployeeDetails employee={selectedRow} />
                </div>

                {/* Work & Break Details */}
                <div className="xl:col-span-2 space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Briefcase className="w-5 h-5 text-gray-700" />
                    <h3 className="text-xl font-bold text-gray-900">
                      Work Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Time In */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <p className="text-sm font-bold text-gray-500 uppercase mb-2">
                        Time In
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedRow.timeIn}
                      </p>
                    </div>

                    {/* Time Out */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <p className="text-sm font-bold text-gray-500 uppercase mb-2">
                        Time Out
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedRow.timeOut}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <p className="text-sm font-bold text-gray-500 uppercase mb-2">
                        Status
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-lg font-semibold text-sm ${
                          selectedRow.status === "Working"
                            ? "bg-green-100 text-green-800 border border-green-300"
                            : selectedRow.status === "On Break"
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                            : selectedRow.status === "Offline"
                            ? "bg-red-100 text-red-800 border border-red-300"
                            : "bg-gray-100 text-gray-800 border border-gray-300"
                        }`}
                      >
                        {selectedRow.status}
                      </span>
                    </div>

                    {/* Remarks for overbreak only */}
                    {selectedRow.breaks &&
                      selectedRow.breaks.some(
                        (b) =>
                          parseTimeToMinutes(b.end) -
                            parseTimeToMinutes(b.start) >
                          STANDARD_BREAK_MINUTES
                      ) && (
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                          <p className="text-sm font-bold text-gray-500 uppercase mb-2">
                            Remarks
                          </p>
                          <span className="inline-block px-3 py-1 rounded-lg font-semibold text-sm bg-red-100 text-red-800 border border-red-300">
                            {selectedRow.breaks
                              .filter(
                                (b) =>
                                  parseTimeToMinutes(b.end) -
                                    parseTimeToMinutes(b.start) >
                                  STANDARD_BREAK_MINUTES
                              )
                              .map((b) => {
                                const overMinutes =
                                  parseTimeToMinutes(b.end) -
                                  parseTimeToMinutes(b.start) -
                                  STANDARD_BREAK_MINUTES;
                                return `${b.type} extended +${overMinutes}m`;
                              })
                              .join(", ")}
                          </span>
                        </div>
                      )}
                  </div>

                  {/* Break Details */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <Clock className="w-5 h-5 text-gray-700" />
                      <h3 className="text-xl font-bold text-gray-900">
                        Break Details
                      </h3>
                    </div>

                    {selectedRow.breaks && selectedRow.breaks.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedRow.breaks.map((b, idx) => {
                          const startTime = b.start || "-";
                          const endTime = b.end || "-";
                          const durationMin =
                            parseTimeToMinutes(b.end) -
                            parseTimeToMinutes(b.start);
                          const hours = Math.floor(durationMin / 60);
                          const minutes = durationMin % 60;
                          const durationStr =
                            durationMin > 0
                              ? `${hours > 0 ? hours + "h " : ""}${minutes}m`
                              : "-";

                          return (
                            <li
                              key={idx}
                              className="flex flex-col md:flex-row justify-between p-2 rounded bg-gray-50"
                            >
                              <span className="font-medium">{b.type}</span>
                              <div className="flex gap-2 mt-1 md:mt-0 items-center">
                                <input
                                  type="text"
                                  value={startTime}
                                  readOnly
                                  className="border border-gray-300 rounded px-2 py-1 text-sm w-24 bg-gray-100"
                                />
                                <span>-</span>
                                <input
                                  type="text"
                                  value={endTime}
                                  readOnly
                                  className="border border-gray-300 rounded px-2 py-1 text-sm w-24 bg-gray-100"
                                />
                              </div>
                              <div className="mt-1 md:mt-0 text-sm font-semibold">
                                {durationStr}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-gray-400">No breaks recorded</p>
                    )}
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

export default TeamLeaderBasicLogs;
