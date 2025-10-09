import React, { useState } from "react";
import { X } from "lucide-react";
import { DateTime } from "luxon";

// const TableModal = ({
//   isOpen,
//   onClose,
//   title,
//   children,
//   recordedAt,
//   editable = false,
//   onSave,
// }) => {
//   const [isEditing, setIsEditing] = useState(false);

//   if (!isOpen) return null;

//   const formattedDate = recordedAt
//     ? DateTime.fromISO(recordedAt).toFormat("MMMM dd, yyyy • hh:mm a")
//     : DateTime.now().toFormat("MMMM dd, yyyy • hh:mm a");

//   const handleEditClick = () => {
//     if (isEditing && onSave) {
//       onSave();
//     }
//     setIsEditing(!isEditing);
//   };

//   return (
//     <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden border border-gray-300">
//         {/* Header */}
//         <div className="bg-gradient-to-b from-white to-gray-50 px-8 py-6 border-b border-gray-200 flex justify-between items-center">
//           <h2 className="text-xl font-bold text-gray-900">{title}</h2>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
//           >
//             <X className="w-6 h-6 text-gray-500" />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)]">
//           {typeof children === "function" ? children(isEditing) : children}
//         </div>

//         {/* Footer */}
//         {editable && (
//           <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
//             <span className="text-sm text-gray-500">
//               Recorded on {formattedDate}
//             </span>
//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={handleEditClick}
//                 className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold shadow-sm"
//               >
//                 {isEditing ? "Update Changes" : "Edit"}
//               </button>
//               <button
//                 onClick={onClose}
//                 className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-semibold shadow-sm"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TableModal;

import {
  Users,
  Clock,
  XCircle,
  Eye,
  User,
  Hash,
  Mail,
  Phone,
  Building,
  Briefcase,
  FileText,
} from "lucide-react";

const TableModal = ({ data, onClose }) => {
  const handleOnClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center h-screen w-screen bg-black/60">
      <div className="relative bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden shadow-xl z-10">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">data Details</h3>
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
            {/* Left Section - data Details */}
            <div className="col-span-4">
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <img
                    src={data.avatar}
                    alt={data.name}
                    className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                  />
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {data.name}
                  </h4>
                  <p className="text-gray-600 text-sm">{data.role}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        Full Name
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {data.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Hash className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        data ID
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        #EMP
                        {data.id?.toString().padStart(3, "0") || "001"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        Email Address
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {data.email ||
                          `${data.name
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
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
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
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        Assigned Accounts
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        N/A
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        Position
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {data.role}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        Department
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {data.department}
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
                <h5 className="text-lg font-medium text-gray-900">
                  Work Details
                </h5>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Work Duration Card */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h6 className="text-sm text-gray-500 uppercase tracking-wide">
                      Work Duration
                    </h6>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        data.status === "Present"
                          ? "bg-green-100 text-green-800"
                          : data.status === "Absent"
                          ? "bg-red-100 text-red-800"
                          : data.status === "On Break"
                          ? "bg-yellow-100 text-yellow-800"
                          : data.status === "Working"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {data.status}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {data.workHours}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Time In:</span>
                      <span className="font-medium">
                        {data.timeIn || "Not yet"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time Out:</span>
                      <span className="font-medium">
                        {data.timeOut || "Not yet"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Card */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h6 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
                    Status
                  </h6>
                  <div className="space-y-2">
                    <div
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        data.status === "Working"
                          ? "bg-green-100 text-green-800"
                          : data.status === "On Break"
                          ? "bg-yellow-100 text-yellow-800"
                          : data.status === "Absent"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {data.status}
                    </div>
                    {data.isLate && (
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
                <div className="flex items-center space-x-2 mb-3">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <h6 className="font-medium text-gray-900">Notes</h6>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-700">
                    {data.notes || "Currently working on project A"}
                  </p>
                </div>
              </div>

              {/* Time Tracking Details */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-lg font-bold text-purple-600">
                    {data.overtime || "0:00"}
                  </div>
                  <div className="text-xs text-purple-600 font-medium">
                    Overtime
                  </div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-lg font-bold text-red-600">
                    {data.undertime || "0:00"}
                  </div>
                  <div className="text-xs text-red-600 font-medium">
                    Undertime
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-lg font-bold text-blue-600">
                    {data.activityTime || "Just now"}
                  </div>
                  <div className="text-xs text-blue-600 font-medium">
                    Last Activity
                  </div>
                </div>
              </div>

              {/* Weekly Summary */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h6 className="font-medium text-gray-900 mb-3">
                  This Week Summary
                </h6>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">4</div>
                    <div className="text-xs text-gray-600">Days Present</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">1</div>
                    <div className="text-xs text-gray-600">Days Absent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">2</div>
                    <div className="text-xs text-gray-600">Late Count</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      3.5h
                    </div>
                    <div className="text-xs text-gray-600">Total Overtime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Action Buttons */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Recorded on September 01, 2025 • 12:00 AM
          </div>
          <div className="flex space-x-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm">
              <Eye className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => data(null)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableModal;
