import React from "react";
import { FileText } from "lucide-react";
import { DateTime } from "luxon";

const RequestDetails = ({
  selectedRequest,
  remarks,
  setRemarks,
  handleDecision,
}) => {
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const date = DateTime.fromISO(dateStr);
    return date.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);
  };

  const formatDisplayTime = (isoDateStr) => {
    if (!isoDateStr) return "";
    const time = DateTime.fromISO(isoDateStr);
    return time.toLocaleString(DateTime.TIME_SIMPLE);
  };

  return (
    <div className="group p-4 sm:p-6 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
            Request Details
          </h3>
        </div>
      </div>

      {selectedRequest ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-gray-600">Agent Name</p>
              <p className="text-gray-800 font-medium">{selectedRequest.agentName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Supervisor</p>
              <p className="text-gray-800 font-medium">{selectedRequest.supervisor}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Request Type</p>
              <p className="text-gray-800 font-medium">{selectedRequest.requestType}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Date</p>
              <p className="text-gray-800 font-medium">{formatDisplayDate(selectedRequest.date)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Start Time</p>
              <p className="text-gray-800 font-medium">{formatDisplayTime(selectedRequest.startTime)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">End Time</p>
              <p className="text-gray-800 font-medium">{formatDisplayTime(selectedRequest.endTime)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold text-gray-600">Duration</p>
              <p className="text-gray-800 font-medium">{selectedRequest.duration}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold text-gray-600">Reason</p>
              <p className="text-gray-800">{selectedRequest.reason}</p>
            </div>
            {selectedRequest.attachment && (
              <div className="col-span-2">
                <p className="text-xs font-semibold text-gray-600">Attachment</p>
                <p className="text-purple-700">{selectedRequest.attachment.name}</p>
              </div>
            )}
          </div>

          {/* Remarks input */}
          <div>
            <label className="text-xs font-semibold text-gray-700">
              Remarks (optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter remarks..."
              className="w-full mt-2 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 focus:bg-white text-gray-800 text-sm"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => handleDecision("Approved")}
              className="flex-1 bg-green-500 text-white p-3 rounded-xl font-medium hover:bg-green-600 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => handleDecision("Rejected")}
              className="flex-1 bg-red-500 text-white p-3 rounded-xl font-medium hover:bg-red-600 transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 italic">Select a request to view details.</p>
      )}
    </div>
  );
};

export default RequestDetails;