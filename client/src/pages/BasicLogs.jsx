import React from "react";
import Table from "../components/Table";

const BasicLogs = () => {
  // Mock Data
  const data = [
    {
      id: "CPH235",
      name: "Christine Brooks",
      email: "christine.brooks@example.com",
      timeIn: "9:00 A.M.",
      timeOut: "-",
      status: "Working",
    },
    {
      id: "CPH857",
      name: "Rosie Pearson",
      email: "rosie.pearson@example.com",
      timeIn: "8:58 A.M.",
      timeOut: "-",
      status: "Working",
    },
    {
      id: "CPH375",
      name: "Darrell Caldwell",
      email: "darrell.caldwell@example.com",
      timeIn: "9:12 A.M.",
      timeOut: "-",
      status: "On Lunch",
    },
    {
      id: "CPH789",
      name: "Gilbert Johnston",
      email: "gilbert.johnston@example.com",
      timeIn: "9:12 A.M.",
      timeOut: "-",
      status: "Working",
    },
    {
      id: "CPH983",
      name: "Alan Cain",
      email: "alan.cain@example.com",
      timeIn: "9:00 A.M.",
      timeOut: "-",
      status: "On Break",
    },
    {
      id: "CPH7189",
      name: "Alfred Murray",
      email: "alfred.murray@example.com",
      timeIn: "8:58 A.M.",
      timeOut: "-",
      status: "On Lunch",
    },
    {
      id: "CPH1078",
      name: "Maggie Sullivan",
      email: "maggie.sullivan@example.com",
      timeIn: "9:12 A.M.",
      timeOut: "6:10 P.M.",
      status: "Shift Ended",
    },
    {
      id: "CPH789",
      name: "Rosie Todd",
      email: "rosie.todd@example.com",
      timeIn: "Not Logged In",
      timeOut: "Not Logged In",
      status: "Absent",
    },
    {
      id: "CPH784",
      name: "Dollie Hines",
      email: "dollie.hines@example.com",
      timeIn: "8:58 A.M.",
      timeOut: "-",
      status: "Working",
    },
  ];

  // Columns
  const columns = [
    { headerName: "ID", field: "id", sortable: true, filter: true, flex: 1 },
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
      filter: true,
      flex: 1,
    },
    {
      headerName: "Time Out",
      field: "timeOut",
      sortable: true,
      filter: true,
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
      BasicLogs
      <Table data={data} columns={columns} />
    </div>
  );
};

export default BasicLogs;
