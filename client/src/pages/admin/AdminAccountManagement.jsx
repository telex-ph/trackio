import React, { useState, useEffect, useMemo, useRef } from "react";
import api from "../../utils/axios";
import Table from "../../components/Table";
import { Loader2 } from "lucide-react";

const AdminAccountManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const tableRef = useRef();

  const columns = useMemo(
    () => [
      { headerName: "Employee ID", field: "employeeId", flex: 1 },
      { headerName: "First Name", field: "firstName", flex: 1 },
      { headerName: "Last Name", field: "lastName", flex: 1 },
      { headerName: "Email", field: "email", flex: 1.5 },
      { headerName: "Phone Number", field: "phoneNumber", flex: 1 },
      { headerName: "Role", field: "role", flex: 1 },
      {
        headerName: "Created At",
        field: "createdAt",
        flex: 1.5,
        valueFormatter: (params) =>
          new Date(params.value).toLocaleString("en-PH", {
            dateStyle: "medium",
            timeStyle: "short",
          }),
      },
    ],
    []
  );

  // 📡 Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/user/get-users");
      console.log("Fetched users:", data);
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🧩 Click handler (optional)
  const handleRowClick = (event) => {
    console.log("Clicked user:", event.data);
  };

  return (
    <section className="p-6">
      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-600">
          <Loader2 className="animate-spin w-6 h-6 mr-2" />
          <span>Loading users...</span>
        </div>
      ) : (
        <Table
          data={users}
          columns={columns}
          tableRef={tableRef}
          onRowClicked={handleRowClick}
        />
      )}
    </section>
  );
};

export default AdminAccountManagement;
