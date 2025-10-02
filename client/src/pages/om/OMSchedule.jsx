import React, { useState } from "react";
import Table from "../../components/Table";
import TableModal from "../../components/TableModal";
import TableEmployeeDetails from "../../components/TableEmployeeDetails";
import { FileText, CalendarDays, Eye } from "lucide-react";
import Calendar from "../../components/Calendar";
import useUser from "../../hooks/useUser";
import { useNavigate } from "react-router-dom";

const OMSchedule = () => {
  const navigate = useNavigate();
  const { loading, error, users } = useUser();

  const [filterGroup, setFilterGroup] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");

  const handleViewClick = (id) => {
    navigate(`${id}`);
  };

  const columns = [
    { headerName: "ID", field: "id", flex: 1 },
    { headerName: "Name", field: "name", flex: 2 },
    { headerName: "Department", field: "department", flex: 2 },
    {
      headerName: "Action",
      field: "action",
      flex: 1,
      cellRenderer: (params) => {
        const id = params.data.id;
        return (
          <div
            className="flex justify-center items-center h-full cursor-pointer"
            onClick={() => handleViewClick(id)}
          >
            <Eye className="w-5 h-5" />
          </div>
        );
      },
    },
  ];

  return (
    <div>
      {/* Header */}
      <section className="flex flex-col mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2>Schedule</h2>
            <p className="text-light">Employee schedules across departments.</p>
          </div>
        </div>
      </section>

     

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          className="border border-gray-300 rounded-lg px-3 py-2"
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
        >
          <option value="All">All Groups</option>
          <option value="Team Alpha">Team Alpha</option>
          <option value="HR Dept">HR Dept</option>
          <option value="IT Dept">IT Dept</option>
          <option value="Operations">Operations</option>
        </select>

        <select
          className="border border-gray-300 rounded-lg px-3 py-2"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Agent">Agent</option>
          <option value="HR Officer">HR Officer</option>
          <option value="IT Support">IT Support</option>
          <option value="Manager">Manager</option>
        </select>
      </div>

      {/* Table */}
      <Table data={users} columns={columns} />
    </div>
  );
};

export default OMSchedule;
