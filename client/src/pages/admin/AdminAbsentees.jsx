import React, { useState } from "react";
import Table from "../../components/Table";
import { DateTime } from "luxon";
import { Datepicker } from "flowbite-react";
import { ChevronRight, FileText, Upload, Eye, Trash2 } from "lucide-react";
import TableAction from "../../components/TableAction";
import Modal from "../../components/TableModal";
import TableEmployeeDetails from "../../components/TableEmployeeDetails";
import { useAttendance } from "../../hooks/useAttendance";

const AdminAbsentees = () => {
  const zone = "Asia/Manila";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [dateRange, setDateRange] = useState({
    startDate: DateTime.now().setZone(zone).startOf("day").toUTC().toISO(),
    endDate: DateTime.now().setZone(zone).endOf("day").toUTC().toISO(),
  });

  const filter = {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  };

  const { absentees, loading } = useAttendance(null, filter);

  const handleDatePicker = (date, field) => {
    if (!date) return;
    const isoDate =
      field === "startDate"
        ? DateTime.fromJSDate(date).setZone(zone).startOf("day").toUTC().toISO()
        : DateTime.fromJSDate(date).setZone(zone).endOf("day").toUTC().toISO();

    setDateRange((prev) => ({
      ...prev,
      [field]: isoDate,
    }));
  };

  const [previewFile, setPreviewFile] = useState(null);

  const actionClicked = (rowData) => {
    setSelectedRow(rowData);
    setIsModalOpen(true);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const newAttachment = {
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)}kb`,
      url: URL.createObjectURL(file),
    };
    setSelectedRow((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), newAttachment],
    }));
  };

  const handleDeleteFile = (fileName) => {
    setSelectedRow((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((f) => f.name !== fileName),
    }));
  };

  const columns = [
    { headerName: "ID", field: "id", sortable: true, filter: true, flex: 1 },

    {
      headerName: "Date",
      field: "date",
      sortable: true,
      filter: true,
      flex: 2,
    },
    {
      headerName: "Name",
      field: "name",
      sortable: true,
      filter: true,
      flex: 2,
    },
    {
      headerName: "Email",
      field: "email",
      sortable: true,
      filter: true,
      flex: 2,
    },
    {
      headerName: "Valid / Invalid",
      field: "validity",
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: "Action",
      field: "action",
      flex: 1,
      cellRenderer: (params) => (
        <TableAction action={() => actionClicked(params.data)} />
      ),
      filter: false,
    },
  ];

  return (
    <div>
      {/* Date Picker */}
      <section className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <Datepicker
            value={DateTime.fromISO(dateRange.startDate)
              .setZone(zone)
              .toJSDate()}
            onChange={(date) => handleDatePicker(date, "startDate")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <Datepicker
            value={DateTime.fromISO(dateRange.endDate).setZone(zone).toJSDate()}
            onChange={(date) => handleDatePicker(date, "endDate")}
          />
        </div>
      </section>

      {/* Table */}
      <Table columns={columns} data={absentees} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Employee Absentee Details"
        editable={true}
        onSave={() => {
          // Save changes to data
          setData((prev) =>
            prev.map((item) =>
              item.id === selectedRow.id ? selectedRow : item
            )
          );
        }}
      >
        {(isEditing) =>
          selectedRow && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Employee Details */}
              <div className="xl:col-span-1 space-y-6">
                <TableEmployeeDetails employee={selectedRow} />
              </div>

              {/* Absentee Details */}
              <div className="xl:col-span-2 space-y-6">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  {/* Date Absent & Validity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                        Date Absent
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {DateTime.fromISO(selectedRow.absentDate).toFormat(
                          "MMMM dd, yyyy"
                        )}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                        Validity
                      </p>
                      <span
                        className={`inline-block px-4 py-2 rounded-lg text-lg font-bold ${
                          selectedRow.validity?.toLowerCase() === "valid"
                            ? "bg-green-100 text-green-800 border border-green-300"
                            : "bg-red-100 text-red-800 border border-red-500"
                        }`}
                      >
                        {selectedRow.validity}
                      </span>
                    </div>
                  </div>

                  {/* Attendance Status */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                      Attendance Status
                    </p>
                    <p className="text-gray-900 font-semibold">
                      {selectedRow.status}
                    </p>
                  </div>

                  {/* Daily Notes */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <h4 className="text-lg font-bold text-gray-900">
                        Daily Notes
                      </h4>
                    </div>
                    <textarea
                      className={`w-full border rounded-lg p-3 font-medium resize-none focus:outline-none focus:ring-2 ${
                        isEditing
                          ? "border-blue-500 bg-white"
                          : "border-gray-300 bg-gray-50"
                      }`}
                      rows={4}
                      value={selectedRow.remarks}
                      onChange={(e) =>
                        setSelectedRow((prev) => ({
                          ...prev,
                          remarks: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                      placeholder="Enter daily notes here..."
                    />
                  </div>

                  {/* Upload Supporting Document */}
                  {isEditing && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
                      <p className="text-sm font-bold text-gray-500 uppercase mb-3">
                        Upload Supporting Document
                      </p>
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <Upload className="w-6 h-6 text-gray-500 mb-2" />
                        <p className="text-gray-500 text-sm">
                          Drag your file(s) or{" "}
                          <span className="text-blue-600">Browse files</span>
                        </p>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                          accept="image/*,application/pdf"
                        />
                      </label>
                    </div>
                  )}

                  {/* View Supporting Documents */}
                  {selectedRow.attachments &&
                    selectedRow.attachments.length > 0 && (
                      <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <p className="text-sm font-bold text-gray-500 uppercase mb-3">
                          View Supporting Document
                        </p>
                        {selectedRow.attachments.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 border rounded-lg mb-2"
                          >
                            <div>
                              <p className="font-semibold">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {file.size}
                              </p>
                            </div>
                            <div className="flex gap-3">
                              <button
                                className="text-blue-600"
                                onClick={() => setPreviewFile(file.url)}
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              {isEditing && (
                                <button
                                  className="text-red-500"
                                  onClick={() => handleDeleteFile(file.name)}
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            </div>
          )
        }
      </Modal>

      {/* File Preview Modal */}
      <Modal
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        title="Document Preview"
      >
        {
          (/* isEditing */) =>
            previewFile && (
              <div className="flex justify-center">
                {previewFile.endsWith(".pdf") ? (
                  <iframe
                    src={previewFile}
                    className="w-full h-[80vh] rounded-lg"
                    title="PDF Preview"
                  />
                ) : (
                  <img
                    src={previewFile}
                    alt="Preview"
                    className="max-h-[80vh] object-contain rounded-lg"
                  />
                )}
              </div>
            )
        }
      </Modal>
    </div>
  );
};

export default AdminAbsentees;
