// HROffenses.jsx (Main component - updated)
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Upload,
  X,
  Plus,
  User,
  FileText,
  ChevronDown,
  Edit,
  CheckCircle,
  XCircle,
  Bell,
  Search,
  Hash // Make sure Hash is imported
} from "lucide-react";
import { DateTime } from "luxon";
import api from "../../utils/axios";
import Notification from "../../components/incident-reports/Notification";
import ConfirmationModal from "../../components/incident-reports/ConfirmationModal";
import OffenseForm from "../../components/incident-reports/OffenseForm";
import OffenseList from "../../components/incident-reports/OffenseList";
import OffenseHistory from "../../components/incident-reports/OffenseHistory";

const HROffenses = () => {
  // === ENSURE THESE STATE DECLARATIONS ARE PRESENT ===
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [offenses, setOffenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [notification, setNotification] = useState({
    message: "",
    type: "",
    isVisible: false,
  });

  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [formData, setFormData] = useState({
    agentName: "",
    employeeId: "",
    agentRole: "",
    offenseCategory: "",
    offenseType: "",
    offenseLevel: "", // Renamed field
    dateOfOffense: "",
    status: "",
    actionTaken: "",
    remarks: "",
  });
  // === END OF STATE DECLARATIONS ===

  const showNotification = (message, type) => {
    setNotification({ message, type, isVisible: true });
  };

  const fetchOffenses = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/offenses");
      setOffenses(response.data);
    } catch (error) {
      console.error("Error fetching offenses:", error);
      showNotification("Failed to load offenses. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffenses();
  }, []);

  const offenseTypesByCategory = {
    Attendance: [
      "Tardiness / Lates",
      "Undertime",
      "Absent without Official Leave (AWOL)",
      "Excessive Sick Leave / SL Abuse",
      "No Call, No Show",
      "Leaving workstation without permission",
    ],
    Performance: [
      "Low Quality Scores (QA Fails)",
      "Missed Deadlines / Targets",
      "Excessive AHT",
      "Not Meeting KPIs / Metrics",
      "Failure to follow processes / workflows",
    ],
    Behavioral: [
      "Rudeness / Unprofessional behavior",
      "Disrespect towards peers or superiors",
      "Workplace misconduct",
      "Sleeping while on duty",
      "Excessive personal activities during work hours",
      "Horseplay / disruption",
    ],
    Compliance: [
      "Data Privacy Violation",
      "Breach of Company Policy / Security Policy",
      "Misuse of Company Equipment",
      "Tampering with logs / falsification of records",
      "Accessing unauthorized tools / websites",
      "Timekeeping fraud",
    ],
    "Account/Employment": [
      "Transfer to another account",
      "Final Written Warning / Termination record",
      "Disciplinary actions history",
    ],
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async () => {
    if (
      !formData.agentName ||
      !formData.employeeId ||
      !formData.offenseCategory ||
      !formData.offenseType ||
      !formData.offenseLevel || // Use renamed field
      !formData.dateOfOffense ||
      !formData.status ||
      !formData.actionTaken
    ) {
      showNotification("Please fill in all required fields, including selecting an agent", "error");
      return;
    }

    try {
      const payload = { ...formData };
      if (selectedFile) { // Check if selectedFile exists before using
        const base64File = await fileToBase64(selectedFile);
        payload.evidence = [
          {
            fileName: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type,
            data: base64File,
          },
        ];
      } else {
        payload.evidence = []; // Ensure evidence is an empty array if no file selected
      }


      if (isEditMode) {
        await api.put(`/offenses/${editingId}`, payload);
        showNotification("Offense updated successfully!", "success");
      } else {
        await api.post("/offenses", payload);
        showNotification("Offense submitted successfully!", "success");
      }

      resetForm();
      await fetchOffenses();
    } catch (error) {
      console.error("Error submitting offense:", error);
      showNotification("Failed to submit offense. Please try again.", "error");
    }
  };

  const resetForm = () => {
    setFormData({
      agentName: "",
      employeeId: "",
      agentRole: "",
      offenseCategory: "",
      offenseType: "",
      offenseLevel: "", // Use renamed field
      dateOfOffense: "",
      status: "",
      actionTaken: "",
      remarks: "",
    });
    setSelectedFile(null); // Reset selectedFile state
    setIsEditMode(false);
    setEditingId(null);
  };

  const handleEdit = (off) => {
    setIsEditMode(true);
    setEditingId(off._id);
    setFormData({
      agentName: off.agentName,
      employeeId: off.employeeId || "",
      agentRole: off.agentRole || "",
      offenseCategory: off.offenseCategory,
      offenseType: off.offenseType,
      offenseLevel: off.offenseLevel || "", // Use renamed field
      dateOfOffense: off.dateOfOffense,
      status: off.status,
      actionTaken: off.actionTaken,
      remarks: off.remarks || "",
      // Evidence is not re-populated for edit, user must re-upload if needed
    });
    setSelectedFile(null); // Reset file input when editing
  };

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) {
      showNotification("No offense selected for deletion.", "error");
      setIsConfirmationModalOpen(false);
      return;
    }

    try {
      await api.delete(`/offenses/${itemToDelete}`);
      showNotification("Offense deleted successfully!", "success");
      await fetchOffenses();
    } catch (error) {
      console.error("Error deleting offense:", error);
      showNotification("Failed to delete offense. Please try again.", "error");
    } finally {
      setIsConfirmationModalOpen(false);
      setItemToDelete(null);
    }
  };

  const formatDisplayDate = (dateStr) =>
    dateStr
      ? DateTime.fromISO(dateStr).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
      : "";

  const resolvedOffenses = offenses.filter(
    (off) =>
      off.status === "Action Taken" ||
      off.status === "Escalated" ||
      off.status === "Closed"
  );

  return (
    <div>
      {notification.isVisible && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, isVisible: false })}
        />
      )}
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => {
          setIsConfirmationModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this offense?"
      />
      <section className="flex flex-col mb-2">
        <div className="flex items-center gap-1">
          <h2>Offense Management</h2>
        </div>
        <p className="text-gray-600">
          Record and manage disciplinary offenses for agents.
        </p>
      </section>
      <div className="grid grid-cols-1 md:grid-cols-2 p-2 sm:p-6 md:p-3 gap-6 md:gap-10 mb-12 max-w-9xl mx-auto">
        <OffenseForm
          formData={formData}
          setFormData={setFormData}
          selectedFile={selectedFile} // Pass selectedFile state
          setSelectedFile={setSelectedFile} // Pass the setter function
          isDragOver={isDragOver}
          setIsDragOver={setIsDragOver}
          isEditMode={isEditMode}
          resetForm={resetForm}
          handleSubmit={handleSubmit}
          showNotification={showNotification}
          offenseTypesByCategory={offenseTypesByCategory}
        />
        <OffenseList
          offenses={offenses}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isLoading={isLoading}
          handleEdit={handleEdit}
          handleDeleteClick={handleDeleteClick}
        />
      </div>
      <OffenseHistory offenses={offenses} isLoading={isLoading} />
    </div>
  );
};

export default HROffenses;