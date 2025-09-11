import React, { useState } from "react";
import Table from "../../components/Table";
import TableAction from "../../components/TableAction";
import TableModal from "../../components/TableModal";
import TableEmployeeDetails from "../../components/TableEmployeeDetails";
import TableCalendarModal from "../../components/TableCalendarModal";
import { ChevronRight, Clock, FileText, CalendarDays } from "lucide-react";
import { DateTime } from "luxon";

const AdminEmployeeStatus = () => {
  const [data, setData] = useState([
    {
      id: "EMP001",
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      account: "AliceJ123",
      workDuration: "8h 30m",
      status: "Working",
      role: "Developer",
      department: "IT",
      phone: "09123456789",
      notes: "Currently working on project A",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      employeeType: "Full-time",
      attendance: [
        { date: "2025-09-01", status: "Present" },
        { date: "2025-09-02", status: "Late" },
        { date: "2025-09-03", status: "Overtime" },
        { date: "2025-09-04", status: "Absent" },
      ],
    },
    {
      id: "EMP002",
      name: "Bob Smith",
      email: "bob.smith@example.com",
      account: "BobS456",
      workDuration: "7h 45m",
      status: "On Break",
      role: "HR Specialist",
      department: "HR",
      phone: "09987654321",
      notes: "On a short coffee break",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      employeeType: "Full-time",
      attendance: [
        { date: "2025-09-01", status: "Present" },
        { date: "2025-09-02", status: "Present" },
        { date: "2025-09-03", status: "Late" },
        { date: "2025-09-04", status: "Present" },
      ],
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

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
      field: "account",
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: "Work Duration",
      field: "workDuration",
      sortable: true,
      filter: false,
      flex: 1,
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
        <TableAction action={() => actionClicked(params.data)} />
      ),
      filter: false,
    },
  ];

  return (
    <div>
      <section className="flex flex-col mb-2">
        <div className="flex items-center gap-1">
          <h2>Tracking</h2> <ChevronRight className="w-6 h-6" />{" "}
          <h2>Employee Status</h2>
        </div>
        <p className="text-light">
          Any updates will reflect on the admin account profile.
        </p>
      </section>

      <Table columns={columns} data={data} />

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

export default AdminEmployeeStatus;
