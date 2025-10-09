import {
  Users,
  Clock,
  XCircle,
  User,
  Hash,
  Mail,
  Phone,
  Building,
  Briefcase,
  FileText,
  Pen,
} from "lucide-react";
import { dateFormatter } from "../../utils/formatDateTime";
import { useState, useRef, useEffect } from "react";
import { STATUS_COLORS } from "../../constants/status";
import { useAttendance } from "../../hooks/useAttendance";
import api from "../../utils/axios";
import { useStore } from "../../store/useStore";
import toast from "react-hot-toast";

const EmployeeModal = ({ employee, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState(employee.notes || "");
  const [isEdit, setEdit] = useState(false);
  const noteRef = useRef();

  const handleButtonSave = async () => {
    const field = "notes";
    try {
      setLoading(true);
      const response = await api.patch("/attendance/update-attendance-field", {
        id: employee.doc_id,
        field: field,
        newValue: notes,
      });
      console.log(response);
      toast.success("Notes updated successfully!");
      setEdit(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update notes.");
    } finally {
      setLoading(false);
    }
  };

  const handleNoteOnChange = (e) => {
    setNotes(e.target.value);
  };

  const handleOnClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleEdit = () => {
    setEdit((prev) => !prev);
  };

  useEffect(() => {
    if (isEdit && noteRef.current) {
      noteRef.current.focus();
    }
  }, [isEdit]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center h-screen w-screen bg-black/60">
      <div className="relative bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden shadow-xl z-10">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Employee Details
          </h3>
          <button
            onClick={handleOnClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Section - Employee Details */}
            <div className="col-span-4">
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {employee.name}
                  </h4>
                  <p className="text-gray-600 text-sm">{employee.role}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 tracking-wide">
                        Full Name
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {employee.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Hash className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 tracking-wide">
                        Doc ID
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {employee.doc_id?.toString().padStart(3, "0") || "001"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Hash className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 tracking-wide">
                        Employee ID
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {employee.id?.toString().padStart(3, "0") || "001"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 tracking-wide">
                        Email Address
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {employee.email ||
                          `${employee.name
                            .toLowerCase()
                            .replace(" ", ".")}@company.com`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 tracking-wide">
                        Phone Number
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        09123456789
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 tracking-wide">
                        Assigned Accounts
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {employee.accounts?.toString().slice(0, 20) || "None"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 tracking-wide">
                        Position
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {employee.role}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 tracking-wide">
                        Department
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {employee.department}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Work Details */}
            <div className="col-span-8">
              <div className="flex items-center space-x-2 mb-6">
                <Clock className="w-5 h-5 text-gray-600" />
                <h4 className="text-lg font-semibold text-gray-900">
                  Work Details
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Work Duration Card */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-light font-bold">Duration</p>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {employee.workHours}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Time In:</span>
                      <span className="font-medium">
                        {employee.timeIn || "Not yet"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time Out:</span>
                      <span className="font-medium">
                        {employee.timeOut || "Not yet"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Card */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <p className="text-light font-bold mb-3"> Status</p>
                  </div>

                  <div className="space-y-2">
                    <div
                      className="inline-flex px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor:
                          STATUS_COLORS[employee.status]?.bgColor || "#E5E7EB", // fallback gray
                        color:
                          STATUS_COLORS[employee.status]?.textColor ||
                          "#111827",
                      }}
                    >
                      {employee.status}
                    </div>
                    {employee.isLate && (
                      <div className="block">
                        <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                          Late Arrival
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between space-x-2 mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <h4 className="text-lg font-semibold text-gray-900">
                      Notes
                    </h4>
                  </div>

                  <div>
                    <Pen
                      onClick={handleEdit}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg border border-gray-200">
                  {isEdit ? (
                    <textarea
                      className="text-sm text-gray-700 w-full h-full p-3"
                      rows={4}
                      ref={noteRef}
                      value={notes}
                      onChange={handleNoteOnChange}
                    >
                      {notes || "Currently working on project A"}
                    </textarea>
                  ) : (
                    <div className="h-32 p-3">{notes || "No notes"}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Action Buttons */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Recorded on: {dateFormatter(employee.date, "MMMM dd, yyyy")}
          </div>
          <div className="flex space-x-3">
            {isEdit && (
              <button
                disabled={loading}
                className={`px-6 py-2 flex items-center gap-2 rounded-md cursor-pointer 
    ${loading ? "bg-blue-400" : "bg-blue-700 hover:bg-blue-800"} text-white`}
                onClick={handleButtonSave}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            )}
            <button
              className="px-6 py-2 flex items-center gap-2 rounded-md cursor-pointer container-light border-light text-black"
              onClick={handleOnClose}
            >
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;
