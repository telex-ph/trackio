import React, { useRef, useState } from "react";
import Table from "../../components/Table";
import { DateTime } from "luxon";
import { Datepicker } from "flowbite-react";
import { FileDown } from "lucide-react";
import TableAction from "../../components/TableAction";
import { useAttendance } from "../../hooks/useAttendance";
import exportCSV from "../../utils/exportCSV";
import AbsenteeModal from "../../components/modals/AbsenteeModal";

const SharedAbsentees = () => {
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
      headerName: "Status",
      field: "status",
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
    },
  ];

  const handleModalOnClose = () => {
    setIsModalOpen(false);
  };

  const tableRef = useRef();
  const handleDownloadClick = () => {
    exportCSV(tableRef, "absentees-list");
  };

  return (
    <div>
      {/* Date Picker */}
      <section className="flex items-center justify-between">
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
              value={DateTime.fromISO(dateRange.endDate)
                .setZone(zone)
                .toJSDate()}
              onChange={(date) => handleDatePicker(date, "endDate")}
            />
          </div>
        </section>
        <section>
          <button
            className="px-4 py-3 flex items-center gap-2 rounded-md cursor-pointer bg-blue-700 text-white"
            onClick={handleDownloadClick}
          >
            <FileDown className="w-4 h-4" />
            <span>Export</span>
          </button>
        </section>
      </section>
      {/* Table */}
      <Table columns={columns} data={absentees} tableRef={tableRef} />

      {isModalOpen && (
        <AbsenteeModal employee={selectedRow} onClose={handleModalOnClose} />
      )}

      {/* File Preview Modal */}
      {/* <Modal
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        title="Document Preview"
      >
        {previewFile && (
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
        )}
      </Modal> */}
    </div>
  );
};

export default SharedAbsentees;
