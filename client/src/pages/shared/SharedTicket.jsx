import { useState, useRef } from "react";
import { Pen, Trash2, Ticket } from "lucide-react";
import Table from "../../components/Table";
import toast from "react-hot-toast";

const TicketsTable = () => {
  const tableRef = useRef();

  // 🧾 Fake records for now
  const [tickets, setTickets] = useState([
    {
      _id: "1",
      workspaceId: "68f1a7f70036cc2896bc",
      requesteeId: "68e3f51d0018e067bf4e",
      ticketNo: 124,
      subject: "No Internet",
      description: "No internet connection since morning.",
      attachment: "https://example.com/image1.png",
      category: "NETWORK",
      severity: "Severity 1",
      status: "OPEN",
    },
    {
      _id: "2",
      workspaceId: "68f1a7f70036cc2896bc",
      requesteeId: "68e3f51d0018e067bf4e",
      ticketNo: 125,
      subject: "Printer not working",
      description: "The printer in HR is showing paper jam error.",
      attachment: "https://example.com/image2.png",
      category: "HARDWARE",
      severity: "Severity 2",
      status: "IN PROGRESS",
    },
    {
      _id: "3",
      workspaceId: "68f1a7f70036cc2896bc",
      requesteeId: "68e3f51d0018e067bf4e",
      ticketNo: 126,
      subject: "Email issue",
      description: "Cannot send or receive company emails.",
      attachment: "https://example.com/image3.png",
      category: "EMAIL",
      severity: "Severity 3",
      status: "CLOSED",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const handleEdit = (ticket) => {
    toast(`Edit feature for Ticket #${ticket.ticketNo} coming soon!`);
  };

  const handleDelete = (ticketId) => {
    setTickets((prev) => prev.filter((t) => t._id !== ticketId));
    toast.success("Ticket deleted");
  };

  const handleAddTicket = () => {
    const newTicket = {
      _id: String(Date.now()),
      workspaceId: "68f1a7f70036cc2896bc",
      requesteeId: "68e3f51d0018e067bf4e",
      ticketNo: tickets.length + 124,
      subject: "New Ticket",
      description: "This is a newly added test ticket.",
      attachment: "https://example.com/new.png",
      category: "SOFTWARE",
      severity: "Severity 2",
      status: "OPEN",
    };

    setTickets((prev) => [newTicket, ...prev]);
    toast.success("Fake ticket added");
  };

  const columns = [
    { headerName: "Ticket No", field: "ticketNo", flex: 1 },
    { headerName: "Subject", field: "subject", flex: 1 },
    { headerName: "Category", field: "category", flex: 1 },
    { headerName: "Severity", field: "severity", flex: 1 },
    { headerName: "Status", field: "status", flex: 1 },
    {
      headerName: "Actions",
      flex: 1,
      sortable: false,
      filter: false,
      cellRenderer: (params) => (
        <section className="flex items-center gap-5 justify-center h-full">
          {/* <Pen
            className="w-4 h-4 cursor-pointer"
            onClick={() => handleEdit(params.data)}
          />
          <Trash2
            className="w-4 h-4 cursor-pointer"
            onClick={() => handleDelete(params.data._id)}
          /> */}
        </section>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Tickets</h2>
          <p className="text-gray-500">
            View, add, and manage your IT tickets.
          </p>
        </div>

        <button
          onClick={handleAddTicket}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <Ticket className="w-4 h-4" />
          Add Ticket
        </button>
      </div>

      <Table
        data={tickets}
        tableRef={tableRef}
        columns={columns}
        loading={loading}
      />
    </div>
  );
};

export default TicketsTable;
