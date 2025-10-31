import { X } from "lucide-react";
import { Label, TextInput, Button } from "flowbite-react";

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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-dark rounded-xl shadow-lg p-6 w-full max-w-lg relative border border-light container-light">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-light hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold mb-4 text-light">
          Create New Ticket
        </h3>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Station Number */}
          <div>
            <Label htmlFor="stationNo" className="text-light mb-2 block">
              Station Number
            </Label>
            <TextInput
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
              className="flex-1"
              value={formData.stationNo || ""}
              placeholder="Enter station number (1-178)"
            />
          </div>

          {/* Subject */}
          <div>
            <Label htmlFor="subject" className="text-light mb-2 block">
              Subject
            </Label>
            <TextInput
              id="subject"
              name="subject"
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              required
              className="flex-1"
              value={formData.subject}
              placeholder="Enter ticket subject"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-light mb-2 block">
              Description
            </Label>
            <textarea
              id="description"
              name="description"
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              className="w-full border border-light container-light rounded-lg px-3 py-2 text-light bg-transparent"
              rows="3"
              placeholder="Describe the issue"
              value={formData.description}
            ></textarea>
          </div>

          {/* Attachment */}
          <div>
            <Label htmlFor="attachment" className="text-light mb-2 block">
              Attachment
            </Label>
            <div className="flex items-stretch gap-2">
              <div className="flex-1 flex items-center justify-between border border-light container-light rounded-lg p-2">
                <input
                  id="attachment"
                  name="attachment"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) =>
                    setAttachmentFile(e.target.files[0] || null)
                  }
                  className="w-full text-sm text-light file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 
                    file:text-sm file:font-semibold file:bg-blue-600 file:text-white 
                    hover:file:bg-blue-700 cursor-pointer"
                />
              </div>
              {attachmentFile && (
                <div className="flex items-center justify-center p-2 border border-light container-light rounded-lg">
                  <X
                    className="text-light cursor-pointer"
                    onClick={() => setAttachmentFile(null)}
                  />
                </div>
              )}
            </div>
            {attachmentFile && (
              <p className="text-xs text-light mt-1">
                📎 Selected: {attachmentFile.name}
              </p>
            )}
          </div>

          {/* Category + Severity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="category" className="text-light mb-2 block">
                Category
              </Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full border border-light container-light rounded-lg px-3 py-2 bg-transparent text-light"
                required
              >
                <option value="">Select...</option>
                <option value="NETWORK">Network</option>
                <option value="HARDWARE">Hardware</option>
                <option value="SOFTWARE">Software</option>
                <option value="EMAIL">Email</option>
              </select>
            </div>
            <div>
              <Label htmlFor="severity" className="text-light mb-2 block">
                Severity
              </Label>
              <select
                id="severity"
                value={formData.severity}
                onChange={(e) =>
                  setFormData({ ...formData, severity: e.target.value })
                }
                className="w-full border border-light container-light rounded-lg px-3 py-2 bg-transparent text-light"
                required
              >
                <option value="">Select...</option>
                <option value="LOW">Low</option>
                <option value="MID">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-5">
            <Button
              type="button"
              onClick={onClose}
              color="white"
              className="border border-light text-light"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              gradientDuoTone="purpleToBlue"
            >
              {isSubmitting ? "Saving..." : "Save Ticket"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTicketModal;