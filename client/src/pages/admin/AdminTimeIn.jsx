import React, { useEffect, useState } from "react";
import api from "../../utils/axios";
import Table from "../../components/Table";

const AdminTimeIn = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await api.get("/attendance/get-attendance");
        const attendance = response.data;

        const formattedData = attendance.map((item) => {
          const timeIn = item.timeIn
            ? new Date(item.timeIn).toLocaleTimeString([], {
              hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : "Not Logged In";

          return {
            name: `${item.user.firstName} ${item.user.lastName}`,
            email: item.user.email,
            timeIn: timeIn,
            status: item.status || "-",
          };
        });

        setData(formattedData);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    fetchAttendance();
  }, []);

  // Columns
  const columns = [
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
      headerName: "Time In",
      field: "timeIn",
      sortable: true,
      filter: false,
      flex: 1,
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      filter: true,
      flex: 1,
    },
  ];

  return (
    <div>
      <Table columns={columns} data={data} />
    </div>
  );
};

export default AdminTimeIn;
