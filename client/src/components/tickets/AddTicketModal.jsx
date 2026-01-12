import { X, FileText, Plus, Clipboard, Monitor, Tag, AlignLeft, Paperclip, AlertCircle } from "lucide-react";
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

  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf("image") !== -1) {
          e.preventDefault();
          const blob = item.getAsFile();
          if (blob) {
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

    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [isOpen, setAttachmentFile]);

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <style>
        {`
          .no-scrollbar::-webkit-scrollbar {
            display: none !important;
          }
          .no-scrollbar {
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
          }
        `}
      </style>

      <div
        className="bg-white shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden border-t-[6px] border-t-[#800000] border-x border-b border-slate-300"
        style={{ maxHeight: "92vh" }}
      >
        <div className="shrink-0 px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#800000] flex items-center justify-center text-white">
              <Plus className="w-6 h-6" strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 leading-none">
                Create New Ticket
              </h2>
              <p className="text-[#800000] text-[11px] font-bold mt-1">Support & Incident Report</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-slate-100 hover:bg-[#800000] flex items-center justify-center transition-all text-slate-600 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto bg-slate-50 p-8 no-scrollbar">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[12px] font-bold text-slate-700">
                  <Monitor size={14} className="text-[#800000]" /> Station Number
                </label>
                <input
                  type="number"
                  min="1"
                  max="230"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") { setFormData({ ...formData, stationNo: "" }); return; }
                    const numValue = Number(value);
                    if (!isNaN(numValue) && numValue >= 1 && numValue <= 230) {
                      setFormData({ ...formData, stationNo: numValue });
                    } else if (numValue > 230) {
                      setFormData({ ...formData, stationNo: 230 });
                    }
                  }}
                  required
                  value={formData.stationNo || ""}
                  placeholder="e.g. 101"
                  className="w-full border-2 border-slate-300 rounded-none px-5 py-3.5 text-slate-900 bg-white focus:outline-none focus:ring-0 focus:border-[#800000] transition-all font-bold placeholder-slate-400"
                />
              </div>

              {/* category */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[12px] font-bold text-slate-700">
                  <Tag size={14} className="text-[#800000]" /> Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border-2 border-slate-300 rounded-none px-5 py-3.5 bg-white text-slate-900 focus:outline-none focus:ring-0 focus:border-[#800000] transition-all font-bold appearance-none cursor-pointer"
                  required
                >
                  <option value="">choose category</option>
                  <option value="NETWORK">network</option>
                  <option value="HARDWARE">hardware</option>
                  <option value="SOFTWARE">software</option>
                </select>
              </div>
            </div>

            {/* subject */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[12px] font-bold text-slate-700">
                <FileText size={14} className="text-[#800000]" /> Subject
              </label>
              <input
                type="text"
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                value={formData.subject}
                placeholder="briefly describe the concern"
                className="w-full border-2 border-slate-300 rounded-none px-5 py-3.5 text-slate-900 bg-white focus:outline-none focus:ring-0 focus:border-[#800000] transition-all font-bold placeholder-slate-400"
              />
            </div>

            {/* description */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[12px] font-bold text-slate-700">
                <AlignLeft size={14} className="text-[#800000]" /> Full Description
              </label>
              <textarea
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows="4"
                placeholder="provide as much detail as possible..."
                value={formData.description}
                className="w-full border-2 border-slate-300 rounded-none px-5 py-3.5 text-slate-900 bg-white focus:outline-none focus:ring-0 focus:border-[#800000] transition-all font-bold resize-none placeholder-slate-400 no-scrollbar"
              />
            </div>

            {/* attachment section */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[12px] font-bold text-slate-700">
                <Paperclip size={14} className="text-[#800000]" /> Attachment (Optional)
              </label>
              
              <div className="border-2 border-dashed border-slate-300 rounded-none p-2 bg-white">
                {!attachmentFile ? (
                  <div
                    ref={pasteAreaRef}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="relative flex flex-col items-center justify-center py-8 px-4 text-center cursor-pointer transition-all bg-slate-50 hover:bg-slate-100"
                  >
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setAttachmentFile(e.target.files[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-12 h-12 bg-white border border-slate-200 flex items-center justify-center mb-3 text-slate-400 transition-colors">
                      <Clipboard size={20} />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      Drop files or <span className="text-[#800000] underline">Browse</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 font-bold">
                      Supports: png, jpg, pdf • ctrl+v to paste
                    </p>
                  </div>
                ) : (
                  <div className="p-2">
                    <div className="flex items-center justify-between bg-slate-900 rounded-none p-4 text-white">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText size={18} className="text-[#ff4d4d] shrink-0" />
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold truncate">
                            {attachmentFile.name}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400">
                            {(attachmentFile.size / 1024).toFixed(1)} kb
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttachmentFile(null)}
                        className="w-8 h-8 bg-slate-800 hover:bg-red-600 flex items-center justify-center transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {attachmentFile.type.startsWith("image/") && (
                      <div className="mt-2 border border-slate-300 overflow-hidden">
                        <img
                          src={URL.createObjectURL(attachmentFile)}
                          alt="preview"
                          className="w-full h-auto max-h-48 object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* footer actions */}
        <div className="shrink-0 px-8 py-6 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500">
            <AlertCircle size={14} />
            <span className="text-[10px] font-bold">Internal Use Only</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-100 border border-slate-300 text-slate-800 font-bold text-[11px] rounded-none hover:bg-slate-200 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-[#800000] text-white font-bold text-[11px] rounded-none hover:bg-[#600000] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2 shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" strokeWidth={3} />
                  <span>Save Ticket</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTicketModal;