import React, { useEffect, useState } from "react";
import api from "../../utils/axios";
import Table from "../../components/Table";
import { DateTime } from "luxon";
import { Datepicker } from "flowbite-react";
import { ChevronRight } from "lucide-react";
import TableAction from "../../components/TableAction";

const AdminTimeIn = () => {
  const [data, setData] = useState([]);

  // Initialize with today in PH time
  const [dateRange, setDateRange] = useState({
    startDate: DateTime.now()
      .setZone("Asia/Manila")
      .startOf("day")
      .toUTC()
      .toISO(),
    endDate: DateTime.now().setZone("Asia/Manila").endOf("day").toUTC().toISO(),
  });

  // handle datepicker
  const handleDatePicker = (date, field) => {
    if (!date) return;

    const isoDate =
      field === "startDate"
        ? DateTime.fromJSDate(date)
            .setZone("Asia/Manila")
            .startOf("day")
            .toUTC()
            .toISO()
        : DateTime.fromJSDate(date)
            .setZone("Asia/Manila")
            .endOf("day")
            .toUTC()
            .toISO();

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
            status: "timeIn",
          },
        });

        const formattedData = response.data.map((item) => {
          const timeIn = item.timeIn
            ? DateTime.fromISO(item.timeIn)
                .setZone("Asia/Manila")
                .toFormat("hh:mm a")
            : "Not Logged In";

          const createdAt = item.createdAt
            ? DateTime.fromISO(item.createdAt)
                .setZone("Asia/Manila")
                .toFormat("yyyy-MM-dd")
            : "Not Logged In";

          const accounts = item.accounts.map((acc) => acc.name).join(",");

          return {
            id: item.user._id,
            name: `${item.user.firstName} ${item.user.lastName}`,
            email: item.user.email,
            timeIn,
            date: createdAt,
            status: item.status || "-",
            accounts,
          };
        });

        setData(formattedData);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    fetchAttendances();
  }, [dateRange]);

  // TODO: remove this after / sample only
  const actionClicked = () => {
    alert("Hello");
  };

  // Columns
  const columns = [
    {
      headerName: "ID",
      field: "id",
      sortable: true,
      filter: true,
      flex: 1,
    },
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
    {
      headerName: "Action",
      field: "action",
      flex: 1,
      cellRenderer: () => <TableAction action={actionClicked} />,
      filter: false,
    },
  ];

  return (
    <div>
      <section className="flex flex-col mb-2">
        <div className="flex items-center gap-1">
          <h2>Tracking</h2> <ChevronRight className="w-6 h-6" />{" "}
          <h2>Time In</h2>
        </div>
        <p className="text-light">
          Any updates will reflect on the admin account profile.
        </p>
      </section>

      <section className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <Datepicker
            value={DateTime.fromISO(dateRange.startDate)
              .setZone("Asia/Manila")
              .toJSDate()}
            onChange={(date) => handleDatePicker(date, "startDate")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <Datepicker
            value={DateTime.fromISO(dateRange.endDate)
              .setZone("Asia/Manila")
              .toJSDate()}
            onChange={(date) => handleDatePicker(date, "endDate")}
          />
        </div>
      </section>

      <Table columns={columns} data={data} />
    </div>
  );
};

export default AdminTimeIn;
