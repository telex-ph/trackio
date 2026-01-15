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

  // Color Theme
  const maroonColor = "#800000";

  // Functionality: Save Note (Intact)
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

  // Functionality: Note Change (Intact)
  const handleNoteOnChange = (e) => {
    setNotes(e.target.value);
  };

  // Functionality: Close Modal (Intact)
  const handleOnClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // Functionality: Toggle Edit Mode (Intact)
  const handleEdit = () => {
    setEdit((prev) => !prev);
  };

  // Functionality: Auto-focus on Edit (Intact)
  useEffect(() => {
    if (isEdit && noteRef.current) {
      noteRef.current.focus();
    }
  }, [isEdit]);

  // Scrollbar Hiding CSS logic
  const hideScrollbarStyle = {
    msOverflowStyle: 'none',  /* IE and Edge */
    scrollbarWidth: 'none',   /* Firefox */
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center h-screen w-screen bg-black/60 backdrop-blur-sm p-4">
      <div className="relative bg-[#f8f9fa] rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-white/20">
       
        {/* MAROON LINE AT THE VERY TOP */}
        <div
          className="h-2 w-full shrink-0"
          style={{ backgroundColor: maroonColor }}
        ></div>

        {/* SECTION 1: TOP IDENTITY BAR */}
        <div className="bg-white p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 shrink-0">
          <div className="flex items-center gap-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg"
              style={{ backgroundColor: maroonColor }}
            >
              {employee.name?.charAt(0)}
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 leading-tight">
                {employee.name}
              </h3>
              <p className="text-gray-500 font-medium">{employee.role}</p>
              <div className="flex gap-2 mt-2">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-400 uppercase border border-gray-200">
                  {employee.department}
                </span>
              </div>
            </div>
          </div>
         
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-bold text-gray-400 uppercase">RECORDED ON</p>
              <p className="text-sm font-semibold text-gray-700">{dateFormatter(employee.date, "MMMM dd, yyyy")}</p>
            </div>
            <button onClick={handleOnClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
              <XCircle className="w-8 h-8" />
            </button>
          </div>
        </div>

        {/* SECTION 2: MAIN CONTENT GRID */}
        <div
          className="flex-1 overflow-y-auto p-8 [&::-webkit-scrollbar]:hidden"
          style={hideScrollbarStyle}
        >
          <div className="grid grid-cols-12 gap-8">
           
            {/* LEFT: DATA LIST */}
            <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
              <h4 className="text-xs font-bold uppercase mb-4" style={{ color: maroonColor }}>
                Employee Details
              </h4>
             
              {[
                { icon: User, label: "Full Name", value: employee.name },
                { icon: Hash, label: "Doc ID", value: employee.doc_id?.toString().padStart(3, "0") || "001" },
                { icon: Hash, label: "Employee ID", value: employee.id?.toString().padStart(3, "0") || "001" },
                { icon: Mail, label: "Email Address", value: employee.email || `${employee.name.toLowerCase().replace(" ", ".")}@company.com` },
                { icon: Phone, label: "Phone Number", value: "09123456789" },
                { icon: Building, label: "Assigned Accounts", value: employee.accounts?.toString().slice(0, 20) || "None" },
                { icon: Briefcase, label: "Position", value: employee.role },
                { icon: Users, label: "Department", value: employee.department },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                    <item.icon className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{item.label}</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT: PERFORMANCE & NOTES */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
             
              {/* STATS ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <h4 className="text-[10px] font-bold uppercase" style={{ color: maroonColor }}>
                      Work Details
                    </h4>
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-4">{employee.workHours}</div>
                  <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-gray-50">
                    <div>
                      <span className="text-gray-400 block text-[10px] font-bold uppercase">Time In:</span>
                      <span className="font-semibold text-gray-700">{employee.timeIn || "Not yet"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] font-bold uppercase">Time Out:</span>
                      <span className="font-semibold text-gray-700">{employee.timeOut || "Not yet"}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                  <h4 className="text-[10px] font-bold uppercase mb-4" style={{ color: maroonColor }}>
                    Status
                  </h4>
                  <div className="space-y-3">
                    <div
                      className="px-4 py-1.5 rounded-full text-sm font-semibold inline-block border border-black/5"
                      style={{
                        backgroundColor: STATUS_COLORS[employee.status]?.bgColor || "#E5E7EB",
                        color: STATUS_COLORS[employee.status]?.textColor || "#111827",
                      }}
                    >
                      {employee.status}
                    </div>
                    {employee.isLate && (
                      <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 p-2 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                        Late Arrival
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* NOTES BOX */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <h4 className="text-lg font-semibold" style={{ color: maroonColor }}>
                      NOTES
                    </h4>
                  </div>
                  <button onClick={handleEdit} className="p-2 hover:bg-white rounded-lg transition-all shadow-sm">
                    <Pen className="w-4 h-4" style={{ color: maroonColor }} />
                  </button>
                </div>
                <div className="p-6 flex-1">
                  {isEdit ? (
                    <textarea
                      className="text-sm text-gray-700 w-full p-4 bg-gray-50 rounded-xl outline-none border border-gray-100 focus:border-red-900/20 transition-all resize-none font-medium [&::-webkit-scrollbar]:hidden"
                      style={hideScrollbarStyle}
                      rows={5}
                      ref={noteRef}
                      value={notes}
                      onChange={handleNoteOnChange}
                    />
                  ) : (
                    <div
                      className="min-h-[120px] p-2 text-sm text-gray-600 font-medium leading-relaxed overflow-y-auto [&::-webkit-scrollbar]:hidden"
                      style={hideScrollbarStyle}
                    >
                      {notes || "No notes recorded for this shift."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: FOOTER ACTIONS - ONLY VISIBLE DURING EDIT */}
        {isEdit && (
          <div className="p-8 bg-white border-t border-gray-100 flex justify-end items-center shrink-0">
            <button
              disabled={loading}
              className={`w-full sm:w-auto px-12 py-3 rounded-xl font-bold text-sm text-white shadow-xl shadow-red-900/10 transition-all active:scale-95 ${
                loading ? "bg-red-900/70" : "hover:brightness-110"
              }`}
              style={{ backgroundColor: maroonColor }}
              onClick={handleButtonSave}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeModal;
