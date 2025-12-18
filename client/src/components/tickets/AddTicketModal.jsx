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
          {/* <form onSubmit={onSubmit} className="space-y-5">
          </form> */}

          <div className="flex items-center justify-center h-full bg-gray-50 p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-100 rounded-full mb-6">
                <svg
                  className="w-12 h-12 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M4.93 4.93l14.14 14.14"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Under Maintenance
              </h1>
              <p className="text-gray-600">
                We’re working on this feature. Please check back later.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTicketModal;
