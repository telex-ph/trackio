import { X, FileText, Plus, Clipboard } from "lucide-react";
import { Spinner } from "flowbite-react";
import { useEffect, useRef } from "react";

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
  const pasteAreaRef = useRef(null);

  // Handle paste event for screenshots
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // Check if the pasted item is an image
        if (item.type.indexOf("image") !== -1) {
          e.preventDefault();
          const blob = item.getAsFile();

          if (blob) {
            // Create a filename with timestamp
            const timestamp = new Date().getTime();
            const file = new File([blob], `screenshot-${timestamp}.png`, {
              type: blob.type,
            });

            setAttachmentFile(file);
          }
          break;
        }
      }
    };

    // Add paste event listener to the document
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [isOpen, setAttachmentFile]);

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check if it's an image or PDF
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        setAttachmentFile(file);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header - FIXED */}
        <div className="shrink-0 bg-linear-to-r from-[#a10000] to-[#a10000] px-6 py-5 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Create New Ticket
              </h2>
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
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <label
                htmlFor="stationNo"
                className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block"
              >
                Station Number
              </label>
              <input
                id="stationNo"
                name="stationNo"
                type="number"
                min="1"
                max="230"
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
                    numValue <= 230 &&
                    Number.isInteger(numValue)
                  ) {
                    setFormData({
                      ...formData,
                      stationNo: numValue,
                    });
                  } else if (numValue > 230) {
                    setFormData({ ...formData, stationNo: 230 });
                  }
                }}
                required
                value={formData.stationNo || ""}
                placeholder="Enter station number (1-230)"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#a10000] focus:border-transparent placeholder-gray-400 transition-all"
              />
            </div>

            {/* Subject */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <label
                htmlFor="subject"
                className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block"
              >
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
              <label
                htmlFor="description"
                className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block"
              >
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

            {/* Attachment with Paste & Drag-Drop Support */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hidden">
              <label
                htmlFor="attachment"
                className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block"
              >
                Attachment (Optional)
              </label>

              {/* Info Banner */}
              <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                <Clipboard className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700">
                  <strong>Tip:</strong> You can paste screenshots (Ctrl/Cmd+V),
                  drag & drop files, or browse to upload
                </p>
              </div>

              <div className="space-y-3">
                {/* Show Drag & Drop Area ONLY if walang attachment */}
                {!attachmentFile ? (
                  <div
                    ref={pasteAreaRef}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#a10000] transition-colors bg-gray-50"
                  >
                    <input
                      id="attachment"
                      name="attachment"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) =>
                        setAttachmentFile(e.target.files[0] || null)
                      }
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="pointer-events-none">
                      <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 font-medium">
                        Click to browse or drag & drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Images and PDF files supported
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Preview Selected File - Show ONLY if may attachment */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-linear-to-r from-green-50 to-green-100 rounded-lg p-3 border-2 border-green-200">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-800 font-medium">
                          {attachmentFile.name}
                        </span>
                        <span className="text-xs text-green-600 bg-green-200 px-2 py-0.5 rounded">
                          {(attachmentFile.size / 1024).toFixed(1)} KB
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

                    {/* Image Preview */}
                    {attachmentFile.type.startsWith("image/") && (
                      <div className="rounded-lg overflow-hidden border-2 border-gray-200">
                        <img
                          src={URL.createObjectURL(attachmentFile)}
                          alt="Preview"
                          className="w-full h-auto max-h-64 object-contain bg-gray-100"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Category + Severity */}
            <div className="w-full">
              {/* Category */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <label
                  htmlFor="category"
                  className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block"
                >
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
                </select>
              </div>

              {/* Severity */}
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
                className="px-6 py-2.5 bg-linear-to-r from-[#a10000] to-[#a10000] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
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

export default AddTicketModal;
