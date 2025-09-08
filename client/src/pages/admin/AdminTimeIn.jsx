import React, { useEffect, useState } from "react";
import api from "../../utils/axios";
import Table from "../../components/Table";
import { DateTime } from "luxon";
import { Datepicker } from "flowbite-react";
import { ChevronRight } from "lucide-react";

const AdminTimeIn = () => {
  const [data, setData] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: DateTime.utc().startOf("day").toISO(),
    endDate: DateTime.utc().endOf("day").toISO(),
  });

  // handler now takes (date, fieldName)
  const handleDatePicker = (date, field) => {
    if (!date) return;

    const isoDate =
      field === "startDate"
        ? DateTime.fromJSDate(date).toUTC().startOf("day").toISO()
        : DateTime.fromJSDate(date).toUTC().endOf("day").toISO();

    setDateRange((prev) => ({
      ...prev,
      [field]: isoDate,
    }));
  };

  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const response = await api.get("/attendance/get-attendances", {
          params: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          },
        });

        const formattedData = response.data.map((item) => {
          const timeIn = item.timeIn
            ? new Date(item.timeIn).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : "Not Logged In";

          const accounts = item.accounts.map((acc) => acc.name).join(",");

          return {
            name: `${item.user.firstName} ${item.user.lastName}`,
            email: item.user.email,
            timeIn: timeIn,
            status: item.status || "-",
            accounts: accounts,
          };
        });

        setData(formattedData);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    fetchAttendances();
  }, [dateRange]);

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
      headerName: "Account",
      field: "accounts",
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
      <section className="flex flex-col mb-2">
        <div className="flex items-center gap-1">
          <h2>Tracking</h2> <ChevronRight className="w-6 h-6"/> <h2>Time In</h2>
        </div>
        <p className="text-light">Any updates will reflect on the admin account profile.</p>
      </section>
      <section className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <Datepicker
            onChange={(date) => handleDatePicker(date, "startDate")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <Datepicker onChange={(date) => handleDatePicker(date, "endDate")} />
        </div>
      </section>

      <Table columns={columns} data={data} />
    </div>
  );
};

export default AdminTimeIn;
