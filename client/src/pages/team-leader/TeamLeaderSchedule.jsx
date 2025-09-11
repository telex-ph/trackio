import React, { useState } from "react";
import Table from "../../components/Table";
import TableAction from "../../components/TableAction";
import TableModal from "../../components/TableModal";
import TableEmployeeDetails from "../../components/TableEmployeeDetails";
import { FileText, CalendarDays, Clock, Briefcase } from "lucide-react";

const TeamLeaderSchedule = () => {
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr || timeStr === "-") return 0;
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "P.M." && hours !== 12) hours += 12;
    if (modifier === "A.M." && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const [data, setData] = useState([
    {
      id: "AG001",
      date: "2025-09-11",
      name: "John Reyes",
      email: "john.reyes@example.com",
      group: "Team Alpha",
      category: "Agent",
      timeIn: "9:00 A.M.",
      timeOut: "6:00 P.M.",
      notes: "Regular shift",
      image:
        "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "HR101",
      date: "2025-09-11",
      name: "Maria Santos",
      email: "maria.santos@example.com",
      group: "HR Dept",
      category: "HR Officer",
      timeIn: "8:00 A.M.",
      timeOut: "5:00 P.M.",
      notes: "Conducted interviews",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "IT301",
      date: "2025-09-11",
      name: "Carlo Cruz",
      email: "carlo.cruz@example.com",
      group: "IT Dept",
      category: "IT Support",
      timeIn: "10:00 P.M.",
      timeOut: "7:00 A.M.",
      notes: "Handled overnight server monitoring",
      image:
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "MG201",
      date: "2025-09-11",
      name: "Anna Lopez",
      email: "anna.lopez@example.com",
      group: "Operations",
      category: "Manager",
      timeIn: "9:00 A.M.",
      timeOut: "6:00 P.M.",
      notes: "Weekly performance review",
      image:
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop&crop=face",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [filterGroup, setFilterGroup] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");

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

  const filteredData = data.filter(
    (item) =>
      (filterGroup === "All" || item.group === filterGroup) &&
      (filterCategory === "All" || item.category === filterCategory)
  );

  const columns = [
    { headerName: "Date", field: "date", flex: 2 },
    { headerName: "ID", field: "id", flex: 1 },
    { headerName: "Name", field: "name", flex: 2 },
    { headerName: "Group", field: "group", flex: 2 },
    { headerName: "Category", field: "category", flex: 2 },
    { headerName: "Time In", field: "timeIn", flex: 2 },
    { headerName: "Time Out", field: "timeOut", flex: 2 },
    {
      headerName: "Action",
      field: "action",
      flex: 1,
      cellRenderer: (params) => (
        <TableAction action={() => actionClicked(params.data)} />
      ),
    },
  ];

  const calculateShiftDuration = (timeIn, timeOut) => {
    const duration =
      parseTimeToMinutes(timeOut) - parseTimeToMinutes(timeIn);
    return duration > 0 ? duration : 0;
  };

  return (
    <div>
      {/* Header */}
      <section className="flex flex-col mb-4">
        <div className="flex items-center gap-1">
          <h2>Schedule Logs</h2>
        </div>
        <p className="text-light">Employee schedules across departments.</p>
      </section>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          className="border border-gray-300 rounded-lg px-3 py-2"
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
        >
          <option value="All">All Groups</option>
          <option value="Team Alpha">Team Alpha</option>
          <option value="HR Dept">HR Dept</option>
          <option value="IT Dept">IT Dept</option>
          <option value="Operations">Operations</option>
        </select>

        <select
          className="border border-gray-300 rounded-lg px-3 py-2"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Agent">Agent</option>
          <option value="HR Officer">HR Officer</option>
          <option value="IT Support">IT Support</option>
          <option value="Manager">Manager</option>
        </select>
      </div>

      {/* Table */}
      <Table data={filteredData} columns={columns} />

      {/* Modal */}
      <TableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Schedule for ${selectedRow?.name}`}
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

                {/* Schedule Details */}
                <div className="xl:col-span-2 space-y-6">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-6 h-6 text-gray-700" />
                    <h3 className="text-xl font-bold text-gray-900">
                      Schedule Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Date
                      </h4>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedRow.date}
                      </p>
                    </div>

                    {/* Group */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Department / Group
                      </h4>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedRow.group}
                      </p>
                    </div>

                    {/* Category */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Role / Category
                      </h4>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedRow.category}
                      </p>
                    </div>

                    {/* Time In */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Time In
                      </h4>
                      <p className="text-lg font-semibold text-green-600">
                        {selectedRow.timeIn}
                      </p>
                    </div>

                    {/* Time Out */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Time Out
                      </h4>
                      <p className="text-lg font-semibold text-red-600">
                        {selectedRow.timeOut}
                      </p>
                    </div>

                    {/* Shift Duration */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm md:col-span-2">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Shift Duration
                      </h4>
                      <p className="text-lg font-semibold text-blue-600">
                        {calculateShiftDuration(
                          selectedRow.timeIn,
                          selectedRow.timeOut
                        )}{" "}
                        mins
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

export default TeamLeaderSchedule;
