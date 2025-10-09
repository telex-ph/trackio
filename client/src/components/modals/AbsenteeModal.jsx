import {
  Users,
  XCircle,
  User,
  Hash,
  Mail,
  Phone,
  Building,
  Briefcase,
  FileText,
  CheckCircle,
  XCircle as XMark,
  Pen,
} from "lucide-react";
import { dateFormatter } from "../../utils/formatDateTime";
import { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../utils/axios";

const AbsenteeModal = ({ employee, onClose }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(employee);
  const [notes, setNotes] = useState(employee.notes || "");
  const [isEdit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const noteRef = useRef();

  // Focus textarea when edit mode is enabled
  useEffect(() => {
    if (isEdit && noteRef.current) {
      noteRef.current.focus();
    }
  }, [isEdit]);

  const handleOnClose = () => {
    if (onClose) onClose();
  };

  const handleEdit = () => {
    setEdit((prev) => !prev);
  };

  const handleNoteOnChange = (e) => {
    setNotes(e.target.value);
  };

  const handleToggleValidity = () => {
    if (!isEdit) return;
    setSelectedEmployee((prev) => ({
      ...prev,
      validationStatus: prev.validationStatus === "Valid" ? "Invalid" : "Valid",
    }));
  };

  const handleButtonSave = async () => {
    try {
      setLoading(true);

      const updatedData = {
        id: selectedEmployee.doc_id || selectedEmployee._id,
        notes: notes,
        validationStatus: selectedEmployee.validationStatus,
      };

      console.log("Saving absentee notes:", updatedData);

      // Uncomment when backend ready
      /*
      const response = await api.patch(`/absentees/update`, updatedData);
      console.log("Save response:", response.data);
      */

      toast.success("Absentee notes updated successfully!");
      setEdit(false);
    } catch (error) {
      console.error("Save failed:", error);
      toast.error(error.response?.data?.message || "Failed to save notes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center h-screen w-screen bg-black/60">
      <div className="relative bg-white rounded-lg max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden shadow-xl z-10">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Absentee Details
          </h3>
          <button
            onClick={handleOnClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Section */}
            <div className="col-span-4 space-y-6">
              <div className="text-center mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  {selectedEmployee.name}
                </h4>
                <p className="text-gray-600 text-sm">{selectedEmployee.role}</p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    icon: User,
                    label: "Full Name",
                    value: selectedEmployee.name,
                  },
                  {
                    icon: Hash,
                    label: "ID",
                    value:
                      selectedEmployee.id?.toString().padStart(3, "0") || "001",
                  },
                  {
                    icon: Mail,
                    label: "Email",
                    value:
                      selectedEmployee.email ||
                      `${selectedEmployee.name
                        .toLowerCase()
                        .replace(" ", ".")}@company.com`,
                  },
                  { icon: Phone, label: "Phone", value: "09123456789" },
                  { icon: Building, label: "Assigned Accounts", value: "N/A" },
                  {
                    icon: Briefcase,
                    label: "Position",
                    value: selectedEmployee.role,
                  },
                  {
                    icon: Users,
                    label: "Department",
                    value: selectedEmployee.department,
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 tracking-wide">
                        {item.label}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Right Section - Notes Only */}
            <div className="col-span-8 space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
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
                      className="w-4 h-4 cursor-pointer hover:text-blue-600 transition-colors"
                    />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg border border-gray-200">
                  <textarea
                    className="text-sm text-gray-700 w-full h-full p-3 bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg disabled:cursor-not-allowed"
                    rows={6}
                    ref={noteRef}
                    value={notes}
                    onChange={handleNoteOnChange}
                    disabled={!isEdit}
                    placeholder="Enter notes here..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Recorded on: {dateFormatter(selectedEmployee.date, "MMMM dd, yyyy")}
          </div>
          <div className="flex space-x-3">
            {isEdit && (
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleButtonSave}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            )}
            <button
              onClick={handleOnClose}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm disabled:opacity-50"
              disabled={loading}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbsenteeModal;
