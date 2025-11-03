import { X, FileText, Plus } from "lucide-react";
import { Spinner } from "flowbite-react";

const AddTicketModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isSubmitting,
  attachmentFile,
  setAttachmentFile,
}) => {
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: '90vh' }}
      >
        
        {/* Header - FIXED */}
        <div className="flex-shrink-0 bg-gradient-to-r from-[#a10000] to-[#a10000] px-6 py-5 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create New Ticket</h2>
              <p className="text-red-100 text-sm">Fill in the details below</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Form Content - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <form onSubmit={onSubmit} className="space-y-5">
            
            {/* Station Number */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <label htmlFor="stationNo" className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                Station Number
              </label>
              <input
                id="stationNo"
                name="stationNo"
                type="number"
                min="1"
                max="178"
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setFormData({ ...formData, stationNo: "" });
                    return;
                  }
                  const numValue = Number(value);
                  if (
                    !isNaN(numValue) &&
                    numValue >= 1 &&
                    numValue <= 178 &&
                    Number.isInteger(numValue)
                  ) {
                    setFormData({
                      ...formData,
                      stationNo: numValue,
                    });
                  } else if (numValue > 178) {
                    setFormData({ ...formData, stationNo: 178 });
                  }
                }}
                required
                value={formData.stationNo || ""}
                placeholder="Enter station number (1-178)"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#a10000] focus:border-transparent placeholder-gray-400 transition-all"
              />
            </div>

            {/* Subject */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <label htmlFor="subject" className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                Subject
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                required
                value={formData.subject}
                placeholder="Enter ticket subject"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#a10000] focus:border-transparent placeholder-gray-400 transition-all"
              />
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <label htmlFor="description" className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                rows="4"
                placeholder="Describe the issue in detail..."
                value={formData.description}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#a10000] focus:border-transparent placeholder-gray-400 resize-none transition-all"
              />
            </div>

            {/* Attachment */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <label htmlFor="attachment" className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                Attachment (Optional)
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    id="attachment"
                    name="attachment"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) =>
                      setAttachmentFile(e.target.files[0] || null)
                    }
                    className="w-full text-sm text-gray-700 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 
                      file:text-sm file:font-semibold file:bg-gradient-to-r file:from-[#a10000] file:to-[#a10000] file:text-white 
                      hover:file:opacity-90 cursor-pointer border-2 border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#a10000] focus:border-transparent transition-all"
                  />
                </div>
                {attachmentFile && (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 font-medium">
                        {attachmentFile.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachmentFile(null)}
                      className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Category + Severity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Category */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <label htmlFor="category" className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                  Category
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a10000] focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select category...</option>
                  <option value="NETWORK">Network</option>
                  <option value="HARDWARE">Hardware</option>
                  <option value="SOFTWARE">Software</option>
                  <option value="EMAIL">Email</option>
                </select>
              </div>

              {/* Severity */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <label htmlFor="severity" className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                  Severity
                </label>
                <select
                  id="severity"
                  value={formData.severity}
                  onChange={(e) =>
                    setFormData({ ...formData, severity: e.target.value })
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a10000] focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select severity...</option>
                  <option value="LOW">Low</option>
                  <option value="MID">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            {/* Actions - Fixed at Bottom */}
            <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-[#a10000] to-[#a10000] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Save Ticket</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTicketModal