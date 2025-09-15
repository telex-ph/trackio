import React, { useState, useMemo } from "react";
import { Send, X } from "lucide-react";
import Table from "../../components/Table";

const AgentRequest = () => {
  const requestTypes = ["Overtime", "Undertime", "Leave"];
  const leaveTypes = ["Vacation", "Sick", "Emergency", "Others"];
  const departments = ["HR", "IT", "Operations", "Sales"];
  const agents = ["Juan Dela Cruz", "Maria Santos", "Carlos Reyes"];

  const [requests, setRequests] = useState([
    {
      id: "1",
      agent: "Juan Dela Cruz",
      type: "Overtime",
      date: "2025-09-14",
      timeFrom: "18:00",
      timeTo: "21:00",
      reason: "Finish project tasks",
      supervisor: "Maria Santos",
      department: "IT",
      notes: "Need to complete before deadline",
      status: "Approved",
      attachment: null,
    },
    {
      id: "2",
      agent: "Carlos Reyes",
      type: "Leave",
      date: "2025-09-15",
      endDate: "2025-09-16",
      leaveType: "Vacation",
      reason: "Family trip",
      supervisor: "Maria Santos",
      department: "HR",
      notes: "",
      status: "Pending",
      attachment: null,
    },
  ]);

  const initialFormState = {
    agent: "",
    type: "",
    date: "",
    timeFrom: "",
    timeTo: "",
    reason: "",
    leaveType: "",
    endDate: "",
    supervisor: "",
    department: "",
    notes: "",
    status: "Pending",
    attachment: null,
  };

  const [formState, setFormState] = useState(initialFormState);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormState({ ...formState, attachment: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      setRequests(
        requests.map((req) =>
          req.id === selectedRequest.id ? { ...formState, id: req.id } : req
        )
      );
      setIsEditing(false);
      setSelectedRequest(null);
    } else {
      setRequests([...requests, { ...formState, id: Date.now().toString() }]);
    }
    setFormState(initialFormState);
  };

  const handleEdit = (request) => {
    setFormState(request);
    setSelectedRequest(request);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormState(initialFormState);
    setSelectedRequest(null);
  };

  const openModal = (request) => setSelectedRequest(request);
  const closeModal = () => setSelectedRequest(null);

  const columns = useMemo(
    () => [
      { headerName: "ID", field: "id", minWidth: 80 },
      { headerName: "Agent", field: "agent", minWidth: 150 },
      { headerName: "Type", field: "type", minWidth: 130 },
      { headerName: "Date", field: "date", minWidth: 130 },
      { headerName: "End Date", field: "endDate", minWidth: 130 },
      { headerName: "Time From", field: "timeFrom", minWidth: 100 },
      { headerName: "Time To", field: "timeTo", minWidth: 100 },
      { headerName: "Leave Type", field: "leaveType", minWidth: 120 },
      { headerName: "Reason", field: "reason", minWidth: 200 },
      { headerName: "Supervisor", field: "supervisor", minWidth: 150 },
      { headerName: "Department", field: "department", minWidth: 120 },
      { headerName: "Notes", field: "notes", minWidth: 200 },
      { headerName: "Status", field: "status", minWidth: 120 },
      {
        headerName: "Attachment",
        field: "attachment",
        minWidth: 120,
        valueGetter: (params) => params.data.attachment?.name || "-",
      },
      {
        headerName: "Action",
        field: "action",
        minWidth: 120,
        cellRenderer: (params) => (
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(params.data)}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={() => openModal(params.data)}
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
            >
              View
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="p-10 bg-gray-50 min-h-screen space-y-12">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Employee Requests</h2>
        <p className="text-gray-600 mt-1">
          Submit, edit, and track requests for overtime, undertime, or leave.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Request Form */}
        <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-200 relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold">
              {isEditing ? "Edit Request" : "New Request"}
            </h3>
            {isEditing && (
              <button
                className="text-red-500 hover:text-red-700"
                onClick={handleCancelEdit}
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <select
              name="agent"
              value={formState.agent}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:ring-1 focus:ring-blue-500"
              required
            >
              <option value="">Select Agent</option>
              {agents.map((a, i) => (
                <option key={i} value={a}>
                  {a}
                </option>
              ))}
            </select>

            <select
              name="type"
              value={formState.type}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:ring-1 focus:ring-blue-500"
              required
            >
              <option value="">Select Request Type</option>
              {requestTypes.map((t, i) => (
                <option key={i} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Dynamic Fields */}
            {(formState.type === "Overtime" || formState.type === "Undertime") && (
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  name="date"
                  value={formState.date}
                  onChange={handleChange}
                  className="border p-3 rounded-lg focus:ring-1 focus:ring-blue-500"
                  required
                />
                <input
                  type="time"
                  name="timeFrom"
                  value={formState.timeFrom}
                  onChange={handleChange}
                  className="border p-3 rounded-lg focus:ring-1 focus:ring-blue-500"
                  required
                />
                <input
                  type="time"
                  name="timeTo"
                  value={formState.timeTo}
                  onChange={handleChange}
                  className="border p-3 rounded-lg focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            {formState.type === "Leave" && (
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  name="date"
                  value={formState.date}
                  onChange={handleChange}
                  className="border p-3 rounded-lg focus:ring-1 focus:ring-blue-500"
                  required
                />
                <input
                  type="date"
                  name="endDate"
                  value={formState.endDate}
                  onChange={handleChange}
                  className="border p-3 rounded-lg focus:ring-1 focus:ring-blue-500"
                  required
                />
                <select
                  name="leaveType"
                  value={formState.leaveType}
                  onChange={handleChange}
                  className="border p-3 rounded-lg focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((lt, i) => (
                    <option key={i} value={lt}>
                      {lt}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <select
              name="department"
              value={formState.department}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:ring-1 focus:ring-blue-500"
              required
            >
              <option value="">Select Department</option>
              {departments.map((d, i) => (
                <option key={i} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <input
              type="text"
              name="supervisor"
              value={formState.supervisor}
              onChange={handleChange}
              placeholder="Supervisor"
              className="w-full border p-3 rounded-lg focus:ring-1 focus:ring-blue-500"
              required
            />

            <textarea
              name="reason"
              value={formState.reason}
              onChange={handleChange}
              placeholder="Reason..."
              className="w-full border p-3 rounded-lg focus:ring-1 focus:ring-blue-500"
              required
            />

            <textarea
              name="notes"
              value={formState.notes}
              onChange={handleChange}
              placeholder="Additional Notes..."
              className="w-full border p-3 rounded-lg focus:ring-1 focus:ring-blue-500"
            />

            <input
              type="file"
              onChange={handleFileChange}
              className="w-full border p-3 rounded-lg focus:ring-1 focus:ring-blue-500"
            />

            <button
              type="submit"
              className="bg-blue-600 text-white w-full py-3 rounded-xl flex justify-center items-center gap-2 hover:bg-blue-700 transition"
            >
              <Send className="w-4 h-4" />
              {isEditing ? "Save Changes" : "Submit Request"}
            </button>
          </form>
        </div>

        {/* Upcoming Requests */}
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-gray-800">Upcoming Requests</h3>
          {requests
            .filter((r) => r.status === "Pending" || r.status === "Approved")
            .map((req) => (
              <div
                key={req.id}
                className="bg-white p-4 rounded-2xl shadow border border-gray-200 hover:shadow-md transition"
              >
                <p className="font-semibold text-gray-700">
                  {req.type} - {req.agent} • {req.date}{" "}
                  {req.timeFrom && `| ${req.timeFrom} - ${req.timeTo}`}
                </p>
                <p className="text-gray-600">
                  <strong>Supervisor:</strong> {req.supervisor}
                </p>
                <p className="text-gray-600">
                  <strong>Department:</strong> {req.department}
                </p>
                {req.leaveType && (
                  <p className="text-gray-600">
                    <strong>Leave Type:</strong> {req.leaveType}
                  </p>
                )}
                <p className="text-gray-600">
                  <strong>Status:</strong>{" "}
                  <span className={req.status === "Approved" ? "text-green-600" : "text-yellow-600"}>
                    {req.status}
                  </span>
                </p>
                <p className="text-gray-600">
                  <strong>Notes:</strong> {req.notes || "-"}
                </p>
                <div className="flex gap-2 mt-2">
                  <button className="bg-red-100 text-red-600 px-3 py-1 rounded-xl hover:bg-red-200">
                    Cancel
                  </button>
                  <button
                    onClick={() => handleEdit(req)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-xl hover:bg-blue-700"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Request History Table */}
      <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-200">
        <h3 className="text-2xl font-semibold mb-4 text-gray-800">Request History</h3>
        <Table data={requests} columns={columns} />
      </div>

      {/* Modal */}
      {selectedRequest && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={closeModal}
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-semibold mb-4">Request Details</h3>
            {Object.entries(selectedRequest).map(([key, value]) => (
              <p key={key} className="text-gray-700">
                <strong>{key}:</strong> {value?.name || value || "-"}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentRequest;
