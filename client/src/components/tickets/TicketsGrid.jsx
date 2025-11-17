"use client";

import { useState, useMemo } from "react";
import { Pen, Trash2 } from "lucide-react";
import Table from "../../components/Table";
import TableAction from "../../components/TableAction";

// --- HELPER FUNCTIONS (unchanged) ---
const getResolutionDeadline = (createdAt, severity) => {
  if (!createdAt || !severity) return null;

  const createdDate = new Date(createdAt);
  let hoursToAdd = 0;

  switch (severity?.toUpperCase()) {
    case "LOW":
      hoursToAdd = 24;
      break;
    case "MID":
      hoursToAdd = 12;
      break;
    case "HIGH":
      hoursToAdd = 6;
      break;
    case "URGENT":
      hoursToAdd = 1;
      break;
    default:
      return null;
  }

  createdDate.setHours(createdDate.getHours() + hoursToAdd);
  return createdDate.toISOString();
};

const calculateTimeRemaining = (resolutionTime, pausedAt) => {
  if (!resolutionTime)
    return {
      timeText: "N/A",
      isOverdue: false,
      percentage: 0,
      hours: 0,
      minutes: 0,
    };

  const deadline = new Date(resolutionTime).getTime();
  const referenceTime = pausedAt
    ? new Date(pausedAt).getTime()
    : new Date().getTime();
  const timeDiff = deadline - referenceTime;
  const isOverdue = timeDiff < 0;

  const totalMinutes = Math.abs(Math.floor(timeDiff / (1000 * 60)));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const timeText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  const percentage = isOverdue
    ? 100
    : Math.min(100, 100 - (timeDiff / (1000 * 60 * 60 * 24)) * 100);

  return {
    timeText,
    isOverdue,
    percentage: Math.max(0, Math.min(100, percentage)),
    hours,
    minutes,
  };
};

const timeAgo = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return `(${Math.floor(interval)}y ago)`;
  interval = seconds / 2592000;
  if (interval > 1) return `(${Math.floor(interval)}mo ago)`;
  interval = seconds / 86400;
  if (interval > 1) return `(${Math.floor(interval)}d ago)`;
  interval = seconds / 3600;
  if (interval > 1) return `(${Math.floor(interval)}h ago)`;
  interval = seconds / 60;
  if (interval > 1) return `(${Math.floor(interval)}m ago)`;
  if (seconds < 10) return `(just now)`;
  return `(${Math.floor(seconds)}s ago)`;
};

const calculateDuration = (start, end) => {
  if (!start || !end) return "N/A";

  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  if (diffMs < 0) return "N/A";

  let totalMinutes = Math.floor(diffMs / (1000 * 60));
  if (totalMinutes < 1) return "< 1m";

  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(" ");
};

// --- TicketsGrid Component ---
const TicketsGrid = ({
  data,
  isLoading,
  tableRef,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  const [statusFilter, setStatusFilter] = useState("");

  // Filtered data based on status
  const filteredData = useMemo(() => {
    if (!statusFilter) return data;
    return data.filter((ticket) => ticket.status === statusFilter);
  }, [data, statusFilter]);

  const columns = [
    {
      headerName: "Ticket No",
      field: "ticketNo",
      flex: 1,
      valueFormatter: (params) => `Ticket#${params.value}`,
    },
    {
      headerName: "Station No",
      field: "stationNo",
      flex: 1,
      cellRenderer: (params) => (
        <div className="flex items-center justify-start h-full">
          <span
            className={
              params.value ? "text-gray-700 font-medium" : "text-gray-500"
            }
          >
            {params.value ? `Station ${params.value}` : "N/A"}
          </span>
        </div>
      ),
    },
    { headerName: "Subject", field: "subject", flex: 1.5 },
    { headerName: "Category", field: "category", flex: 1 },
    { headerName: "Severity", field: "severity", flex: 1 },
    {
      headerName: "Status",
      field: "status",
      flex: 1,
      headerRenderer: () => (
        <div className="flex flex-col">
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-2 py-1 text-xs mt-1"
          >
            <option value="">All</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING_FOR_CUSTOMER">Waiting for Customer</option>
            <option value="RESOLVED">Resolved</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      ),
      cellRenderer: (params) => {
        const statusMap = {
          OPEN: "Open",
          IN_PROGRESS: "In Progress",
          WAITING_FOR_CUSTOMER: "Waiting for Customer",
          RESOLVED: "Resolved",
          COMPLETED: "Completed",
        };
        return (
          <span className="font-medium text-gray-700">
            {statusMap[params.value] || params.value}
          </span>
        );
      },
    },
    {
      headerName: "Resolution Time",
      field: "resolution_time",
      flex: 1.5,
      cellRenderer: (params) => {
        const status = params.data.status?.toLowerCase();
        const isClosed =
          status === "closed" ||
          status === "resolved" ||
          status === "completed"; // resolved/complete
        const isPaused = params.data.paused_at != null && !isClosed; // only paused if not closed

        // --- RESOLVED / COMPLETED CASE ---
        if (isClosed) {
          const createdAt = new Date(params.data.$createdAt).getTime();
          const resolvedAt = params.data.closed_at
            ? new Date(params.data.closed_at).getTime()
            : params.data.resolution_time
            ? new Date(params.data.resolution_time).getTime()
            : null;

          let durationText = "N/A";

          if (resolvedAt) {
            const diffMs = resolvedAt - createdAt;
            const totalMinutes = Math.floor(diffMs / (1000 * 60));
            const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
            const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            if (totalMinutes < 60) {
              durationText = `${totalMinutes} min${
                totalMinutes > 1 ? "s" : ""
              }`;
            } else if (totalHours < 24) {
              const remainingMinutes = totalMinutes % 60;
              durationText = `${totalHours} hr${totalHours > 1 ? "s" : ""}${
                remainingMinutes ? ` ${remainingMinutes} min` : ""
              }`;
            } else {
              const remainingHours = totalHours % 24;
              durationText = `${totalDays} day${totalDays > 1 ? "s" : ""}${
                remainingHours ? ` ${remainingHours} hr` : ""
              }`;
            }
          }

          const resolvedDate = resolvedAt
            ? new Date(resolvedAt).toLocaleString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : "";

          return (
            <div className="flex flex-col justify-center h-full py-2">
              {resolvedDate && (
                <div className="text-xs text-gray-600">
                  Resolved: {resolvedDate}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-0.5">
                Duration: {durationText}
              </div>
            </div>
          );
        }

        // --- PAUSED CASE ---
        if (isPaused) {
          const pausedDate = params.data.paused_at
            ? new Date(params.data.paused_at).toLocaleString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : "";
          return (
            <div className="flex flex-col justify-center h-full py-2">
              {pausedDate && (
                <div className="text-xs text-gray-600">{pausedDate}</div>
              )}
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
                <span className="text-xs text-blue-600 font-medium">
                  Paused
                </span>
              </div>
            </div>
          );
        }

        // --- IN-PROGRESS CASE ---
        const calculatedResolutionTime = getResolutionDeadline(
          params.data.$createdAt,
          params.data.severity
        );
        const { timeText, isOverdue, hours } = calculateTimeRemaining(
          calculatedResolutionTime,
          params.data.paused_at
        );

        const durationText = params.data.duration
          ? `Duration: ${params.data.duration}`
          : null;
        if (timeText === "N/A" && !durationText)
          return <span className="text-gray-500">N/A</span>;

        const textColor = isOverdue ? "text-red-600" : "text-green-600";
        const labelText = isOverdue ? "Overdue:" : "Remaining:";

        let barColor = "bg-green-500";
        if (isOverdue) barColor = "bg-red-500";
        else if (hours < 1) barColor = "bg-yellow-400";
        else if (hours < 4) barColor = "bg-green-400";

        return (
          <div className="flex flex-col justify-start h-full py-2">
            <div className="w-8 h-0.5 rounded-full overflow-hidden">
              <div
                className={`h-full ${barColor}`}
                style={{ width: "100%" }}
              ></div>
            </div>
            <div className={`text-sm font-semibold ${textColor} mt-1`}>
              {labelText} {timeText}
            </div>
            {durationText && (
              <div className="text-xs text-gray-500 mt-0.5">{durationText}</div>
            )}
          </div>
        );
      },
    },
    {
      headerName: "Date Created",
      field: "$createdAt",
      flex: 1.5,
      cellRenderer: (params) => {
        if (!params.value) return <span className="text-gray-500">N/A</span>;
        const createdDate = new Date(params.value).toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        const relativeTime = timeAgo(params.value);
        return (
          <div className="flex flex-col justify-center h-full py-2">
            <div className="text-xs text-gray-600">{createdDate}</div>
            <div className="text-xs text-gray-500 mt-0.5">{relativeTime}</div>
          </div>
        );
      },
    },
    {
      headerName: "Actions",
      flex: 1,
      sortable: false,
      filter: false,
      cellRenderer: (params) => (
        <section className="flex items-center gap-2 justify-center h-full">
          <TableAction action={() => onViewDetails(params.data)} />
          <button
            onClick={() => onEdit(params.data)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            title="Edit Ticket"
          >
            <Pen size={18} className="text-blue-600" />
          </button>
          <button
            onClick={() => onDelete(params.data)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            title="Delete Ticket"
          >
            <Trash2 size={18} className="text-red-600" />
          </button>
        </section>
      ),
    },
  ];

  return (
    <div>
      {/* Status Dropdown Filter */}
      <div className="inline-flex items-center space-x-2 mb-2">
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
        >
          <option value="">All Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="WAITING_FOR_CUSTOMER">Waiting for Customer</option>
          <option value="RESOLVED">Resolved</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Table */}
      <Table
        data={filteredData}
        tableRef={tableRef}
        columns={columns}
        loading={isLoading}
        rowHeight={70}
      />
    </div>
  );
};

export default TicketsGrid;
