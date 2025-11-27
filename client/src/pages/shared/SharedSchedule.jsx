import { useState } from "react";
import Table from "../../components/Table";
import { CalendarDays } from "lucide-react";
import useUser from "../../hooks/useUser";
import { useNavigate } from "react-router-dom";
import Spinner from "../../assets/loaders/Spinner";
import { useSchedule } from "../../hooks/useSchedule";
import { useStore } from "../../store/useStore";

const SharedSchedule = ({ role }) => {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const { userByRoleScope, loading } = useUser();
  const { schedule } = useSchedule({ id: user._id });

  const handleViewClick = (id) => {
    navigate(`${id}`);
  };

  const userFutureSchedules = schedule?.filter(
    (s) => new Date(s.date) > new Date()
  );

  // Separate users by department presence
  const backoffice = userByRoleScope?.filter((u) => u.department);
  const frontoffice = userByRoleScope?.filter((u) => !u.department);

  // Columns for Frontoffice (without department)
  const frontofficeColumns = [
    { headerName: "ID", field: "employeeId", flex: 1 },
    { headerName: "Name", field: "name", flex: 1 },
    { headerName: "Email", field: "email", flex: 1 },
    {
      headerName: "Upcoming Schedules",
      field: "upcomingScheduleCount",
      flex: 1,
      cellRenderer: (params) => {
        const count = params.data.upcomingScheduleCount;
        return `${count} schedule(s)`;
      },
    },
    {
      headerName: "Action",
      field: "action",
      flex: 1,
      cellRenderer: (params) => {
        const id = params.data.id;
        return (
          <section className="flex h-full items-center justify-center gap-5">
            <div
              className="flex justify-center items-center h-full cursor-pointer"
              onClick={() => handleViewClick(id)}
            >
              <CalendarDays className="w-5 h-5" />
            </div>
          </section>
        );
      },
    },
  ];

  // Columns for Backoffice (with department)
  const backofficeColumns = [
    { headerName: "ID", field: "employeeId", flex: 1 },
    { headerName: "Name", field: "name", flex: 2 },
    {
      headerName: "Upcoming Schedules",
      field: "upcomingScheduleCount",
      flex: 1,
      cellRenderer: (params) => {
        const count = params.data.upcomingScheduleCount;
        return `${count} schedule(s)`;
      },
    },
    { headerName: "Department", field: "department", flex: 2 },
    {
      headerName: "Action",
      field: "action",
      flex: 1,
      cellRenderer: (params) => {
        const id = params.data.id;
        return (
          <section className="flex h-full items-center justify-center gap-5">
            <div
              className="flex justify-center items-center h-full cursor-pointer"
              onClick={() => handleViewClick(id)}
            >
              <CalendarDays className="w-5 h-5" />
            </div>
          </section>
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
            <p className="text-light">
              Centralized schedule management for employees.
            </p>
          </div>
        </div>
      </section>

      <div className="border-light container-light flex items-center gap-3 p-3 w-fit rounded-md">
        <h3 className="text-lg font-bold">My Schedule: </h3>
        <p className="text-light">
          You have {userFutureSchedules?.length ?? 0} schedule(s) ahead
        </p>
        <CalendarDays
          className="w-5 h-5 cursor-pointer"
          onClick={() => handleViewClick(user._id)}
        />
      </div>

      {loading ? (
        <div>
          <Spinner />
        </div>
      ) : (
        <>
          {/* Frontoffice Table */}
          {frontoffice?.length > 0 && (
            <div>
              <h3 className="text-lg font-bold my-2">Frontoffice</h3>
              <Table data={frontoffice} columns={frontofficeColumns} />
              {/* <Table> */}
            </div>
          )}

          {/* Backoffice Table */}
          {backoffice?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold my-2">Backoffice</h3>
              <Table data={backoffice} columns={backofficeColumns} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SharedSchedule;
