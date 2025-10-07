import React, { useState } from "react";
import Table from "../../components/Table";
import TableModal from "../../components/TableModal";
import TableEmployeeDetails from "../../components/TableEmployeeDetails";
import { FileText, CalendarDays, Eye } from "lucide-react";
import useUser from "../../hooks/useUser";
import { useNavigate } from "react-router-dom";
import Spinner from "../../assets/loaders/Spinner";

const SharedSchedule = ({ role }) => {
  const navigate = useNavigate();
  const { userByRoleScope, loading } = useUser();

  const [filterGroup, setFilterGroup] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleDetailsClicked = (row) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  const handleViewClick = (id) => {
    navigate(`${id}`);
  };

  const handleUpdate = () => {
    if (!selectedRow) return;
    // update logic here
  };

  const calculateShiftDuration = (timeIn, timeOut) => {
    const duration = parseTimeToMinutes(timeOut) - parseTimeToMinutes(timeIn);
    return duration > 0 ? duration : 0;
  };

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr || timeStr === "-") return 0;
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "P.M." && hours !== 12) hours += 12;
    if (modifier === "A.M." && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  // Separate users by department presence
  const backoffice = userByRoleScope?.filter((u) => u.department);
  const frontoffice = userByRoleScope?.filter((u) => !u.department);

  // Columns for Frontoffice (without department)
  const frontofficeColumns = [
    { headerName: "ID", field: "id", flex: 1 },
    { headerName: "Name", field: "name", flex: 2 },
    { headerName: "Accounts", field: "accounts", flex: 2 },
    { headerName: "Group", field: "groupName", flex: 2 },
    {
      headerName: "Upcoming Schedules",
      field: "upcomingScheduleCount",
      flex: 1,
      cellRenderer: (params) => {
        const count = params.data.upcomingScheduleCount;
        return `${count} schedule(s)`;
      },
    },
    {
      headerName: "Action",
      field: "action",
      flex: 1,
      cellRenderer: (params) => {
        const id = params.data.id;
        return (
          <section className="flex h-full items-center justify-center gap-5">
            <div
              className="flex justify-center items-center h-full cursor-pointer"
              onClick={() => handleViewClick(id)}
            >
              <CalendarDays className="w-5 h-5" />
            </div>
            <div
              className="flex justify-center items-center h-full cursor-pointer"
              onClick={() => handleDetailsClicked(params.data)}
            >
              <Eye className="w-5 h-5" />
            </div>
          </section>
        );
      },
    },
  ];

  // Columns for Backoffice (with department)
  const backofficeColumns = [
    { headerName: "ID", field: "id", flex: 1 },
    { headerName: "Name", field: "name", flex: 2 },
    {
      headerName: "Upcoming Schedules",
      field: "upcomingScheduleCount",
      flex: 1,
      cellRenderer: (params) => {
        const count = params.data.upcomingScheduleCount;
        return `${count} schedule(s)`;
      },
    },
    { headerName: "Department", field: "department", flex: 2 },
    {
      headerName: "Action",
      field: "action",
      flex: 1,
      cellRenderer: (params) => {
        const id = params.data.id;
        return (
          <section className="flex h-full items-center justify-center gap-5">
            <div
              className="flex justify-center items-center h-full cursor-pointer"
              onClick={() => handleViewClick(id)}
            >
              <CalendarDays className="w-5 h-5" />
            </div>
            <div
              className="flex justify-center items-center h-full cursor-pointer"
              onClick={() => handleDetailsClicked(params.data)}
            >
              <Eye className="w-5 h-5" />
            </div>
          </section>
        );
      },
    },
  ];

  return (
    <div>
      {/* Header */}
      <section className="flex flex-col mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2>Schedule</h2>
            <p className="text-light">
              Centralized schedule management for employees.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          className="border border-gray-300 rounded-lg px-3 py-2"
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
        >
          <option value="All">All Groups</option>
        </select>

        <select
          className="border border-gray-300 rounded-lg px-3 py-2"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="All">All Departments</option>
        </select>
      </div>

      {loading ? (
        <div>
          <Spinner />
        </div>
      ) : (
        <>
          {/* Frontoffice Table */}
          {frontoffice?.length > 0 && (
            <div>
              <h3 className="text-lg font-bold my-2">Frontoffice</h3>
              <Table data={frontoffice} columns={frontofficeColumns} />
            </div>
          )}

          {/* Backoffice Table */}
          {backoffice?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold my-2">Backoffice</h3>
              <Table data={backoffice} columns={backofficeColumns} />
            </div>
          )}
        </>
      )}

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
                <div className="xl:col-span-1 space-y-6">
                  <TableEmployeeDetails employee={selectedRow} />
                </div>
                <div className="xl:col-span-2 space-y-6">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-6 h-6 text-gray-700" />
                    <h3 className="text-xl font-bold text-gray-900">
                      Schedule Details
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Date
                      </h4>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedRow.date}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Group
                      </h4>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedRow.groupName}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Role / Category
                      </h4>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedRow.category}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Scheduled Time In
                      </h4>
                      <p className="text-lg font-semibold text-green-600">
                        {selectedRow.timeIn}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Scheduled Time Out
                      </h4>
                      <p className="text-lg font-semibold text-red-600">
                        {selectedRow.timeOut}
                      </p>
                    </div>
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

export default SharedSchedule;
