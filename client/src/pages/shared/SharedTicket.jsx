import { useState, useRef } from "react";
import { Pen, Trash2, Ticket } from "lucide-react";
import Table from "../../components/Table";
import toast from "react-hot-toast";
import axios from "axios";

const TicketsTable = () => {
  const tableRef = useRef();
  const [isLoading, setIsLoading] = useState(false);

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

  const handleAddTicket = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        "https://ticketing-system-eight-kappa.vercel.app/api/ittickets",
        {
          subject: "No Internet",
          description: "Umuulan kasi.",
          attachment:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUDPyytMlavyIMMo71V_elwe_b_gKdDOXdPg&s",
          category: "HARDWARE",
          severity: "LOW",
          status: "OPEN",
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Cookie":
              "jay-tkt-sys-session=eyJpZCI6IjY4ZTNmNTFkMDAxOGUwNjdiZjRlIiwic2VjcmV0IjoiMDliN2U1OTVlYWFmNzBlYjA2ZWM5NjVkNDY4NmEyZGI4MWQ3N2ExNjE3MzRjYzI5NmE4ODlmYzllNjE0MDNlZTA2MzA3ZDMwMjFlZjVlMWZhNDg2MzRiNGE3NmUzMmFiZDcyZDdhYmFhZWE4ZWFkYWZjODEwMmYyYzYyMDAxZGYzZThlNzM1YTk4ZWIyNWZkZThkYjk1NjYwYWUyYjEzNmFlZDAzMWU4Y2Y4NTIwMTZkOWU5NzFmYmJjNDk4NzJiMThjNTE3MjFiN2Q2ZTEyNzYwNTcxYmI3NmUxOTYxNTdhZjA5N2E3NmU5OGJiYmVjYWJhZWI1ZjE0ODRjM2QxYyJ9",
          },
        }
      );
      console.log(response.data);
    toast.success("Fake ticket added");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }

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
