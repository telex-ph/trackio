"use client";

import { Pen, Trash2 } from "lucide-react";
import Table from "../../components/Table";
import TableAction from "../../components/TableAction";

// --- HELPER FUNCTION ---
// Para i-calculate ang deadline based sa severity
const getResolutionDeadline = (createdAt, severity) => {
  if (!createdAt || !severity) return null;

  const createdDate = new Date(createdAt);
  let hoursToAdd = 0;

  // Titingnan ang severity at magdadagdag ng oras
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

  // Idagdag ang oras sa creation date para makuha ang deadline
  createdDate.setHours(createdDate.getHours() + hoursToAdd);
  return createdDate.toISOString();
};

// Helper function to calculate time remaining
const calculateTimeRemaining = (resolutionTime, pausedAt) => {
  if (!resolutionTime) {
    return { timeText: "N/A", isOverdue: false, percentage: 0, hours: 0, minutes: 0 };
  }

  const deadline = new Date(resolutionTime).getTime();
  const now = new Date().getTime();
  
  // If paused_at exists, use it instead of current time
  const referenceTime = pausedAt ? new Date(pausedAt).getTime() : now;
  
  const timeDiff = deadline - referenceTime;
  const isOverdue = timeDiff < 0;
  
  // Calculate absolute time difference in minutes
  const totalMinutes = Math.abs(Math.floor(timeDiff / (1000 * 60)));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  let timeText;
  if (hours > 0) {
    timeText = `${hours}h ${minutes}m`;
  } else {
    timeText = `${minutes}m`;
  }
  
  const percentage = isOverdue ? 100 : Math.min(100, 100 - ((timeDiff / (1000 * 60 * 60 * 24)) * 100));
  
  return {
    timeText,
    isOverdue,
    percentage: Math.max(0, Math.min(100, percentage)),
    hours,
    minutes
  };
};

// Helper function para sa relative time (e.g., "1m ago")
const timeAgo = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000; // years
  if (interval > 1) return `(${Math.floor(interval)}y ago)`;
  interval = seconds / 2592000; // months
  if (interval > 1) return `(${Math.floor(interval)}mo ago)`;
  interval = seconds / 86400; // days
  if (interval > 1) return `(${Math.floor(interval)}d ago)`;
  interval = seconds / 3600; // hours
  if (interval > 1) return `(${Math.floor(interval)}h ago)`;
  interval = seconds / 60; // minutes
  if (interval > 1) return `(${Math.floor(interval)}m ago)`;
  if (seconds < 10) return `(just now)`;
  return `(${Math.floor(seconds)}s ago)`;
};

// --- HELPER FUNCTION PARA SA DURATION ---
const calculateDuration = (start, end) => {
  if (!start || !end) {
    return "N/A";
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();

  if (diffMs < 0) {
    return "N/A"; // Error, end date is before start date
  }

  let totalMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (totalMinutes < 1) {
    return "< 1m";
  }

  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(' ');
};


const TicketsGrid = ({ data, isLoading, tableRef, onViewDetails, onEdit, onDelete }) => {
  const columns = [
    {
      headerName: "Ticket No",
      field: "ticketNo",
      flex: 1,
      valueFormatter: (params) => `Ticket#${params.value}`,
    },
    { headerName: "Subject", field: "subject", flex: 1.5 },
    { headerName: "Category", field: "category", flex: 1 },
    { headerName: "Severity", field: "severity", flex: 1 },
    { headerName: "Status", field: "status", flex: 1 },
    {
      headerName: "Resolution Time",
      field: "resolution_time",
      flex: 1.5,
      cellRenderer: (params) => {
        const isPaused = params.data.paused_at !== null && params.data.paused_at !== undefined;
        const isClosed = params.data.status?.toLowerCase() === "closed";

        // --- STATE 1: CLOSED ---
        if (isClosed) {
          // Use closed_at timestamp if available, otherwise fall back to resolution_time
          const closedAtTimestamp = params.data.closed_at 
            ? new Date(params.data.closed_at)
            : params.data.resolution_time
            ? new Date(params.data.resolution_time) 
            : null;

          const closedDateTime = closedAtTimestamp
            ? closedAtTimestamp.toLocaleString("en-US", {
                month: "short", day: "2-digit", year: "numeric",
                hour: "2-digit", minute: "2-digit", hour12: true,
              })
            : "";
          
          // Calculate duration from created to closed
          const durationText = calculateDuration(
            params.data.$createdAt, 
            params.data.closed_at || params.data.resolution_time
          );

          return (
            <div className="flex flex-col justify-center h-full py-2">
              {closedDateTime && (
                <div className="text-xs text-gray-600">
                  Closed: {closedDateTime}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-0.5">
                Duration: {durationText}
              </div>
            </div>
          );
        }

        // --- LOGIC PARA SA ACTIVE/PAUSED ---
        const calculatedResolutionTime = getResolutionDeadline(
          params.data.$createdAt,
          params.data.severity
        );

        const { timeText, isOverdue, hours } = calculateTimeRemaining(
          calculatedResolutionTime,
          params.data.paused_at
        );
        const durationText = params.data.duration ? `Duration: ${params.data.duration}` : null;
        
        // --- STATE 2: N/A ---
        if (timeText === "N/A" && !durationText) {
          return (
            <div className="flex items-center justify-start h-full">
              <span className="text-gray-500">N/A</span>
            </div>
          );
        }
        
        const textColor = isOverdue ? "text-red-600" : "text-green-600";
        const labelText = isOverdue ? "Overdue:" : "Remaining:";

        // --- STATE 3: PAUSED ---
        if (isPaused) {
          // Paused *with* Duration
          if (durationText) {
            const pausedDate = params.data.paused_at
              ? new Date(params.data.paused_at).toLocaleString("en-US", {
                  month: "short", day: "2-digit", year: "numeric",
                  hour: "2-digit", minute: "2-digit", hour12: true,
                })
              : "";
            return (
              <div className="flex flex-col justify-center h-full py-2">
                {pausedDate && (
                  <div className="text-xs text-gray-600">{pausedDate}</div>
                )}
                <div className="text-xs text-gray-500 mt-0.5">{durationText}</div>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
                  <span className="text-xs text-blue-600 font-medium">Paused</span>
                </div>
              </div>
            );
          }
          
          // Paused *with* Remaining Time
          return (
            <div className="flex flex-col justify-center h-full py-2">
              <div className={`text-sm font-semibold ${textColor} mt-1`}>
                {labelText} {timeText}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
                <span className="text-xs text-blue-600 font-medium">Paused</span>
              </div>
            </div>
          );
        }

        // --- STATE 4: ACTIVE or OVERDUE ---
        // Logic para sa colored line
        let barColor = "bg-green-500";
        if (isOverdue) barColor = "bg-red-500";
        else if (hours < 1) barColor = "bg-yellow-400"; // Less than 1 hour
        else if (hours < 4) barColor = "bg-green-400"; // Less than 4 hours
        
        return (
          <div className="flex flex-col justify-start h-full py-2">
            <div className="w-8 h-0.5 rounded-full overflow-hidden">
              <div className={`h-full ${barColor}`} style={{ width: `100%` }}></div>
            </div>
            <div className={`text-sm font-semibold ${textColor} mt-1`}>
              {labelText} {timeText}
            </div>
          </div>
        );
      },
    },
    
    // --- Date Created Column ---
    {
      headerName: "Date Created",
      field: "$createdAt",
      flex: 1.5,
      cellRenderer: (params) => {
        if (!params.value) {
          return (
            <div className="flex items-center justify-start h-full">
              <span className="text-gray-500">N/A</span>
            </div>
          );
        }
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
            <div className="text-xs text-gray-600">
              {createdDate}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {relativeTime}
            </div>
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
    <Table
      data={data}
      tableRef={tableRef}
      columns={columns}
      loading={isLoading}
      rowHeight={70}
    />
  );
};

export default TicketsGrid;