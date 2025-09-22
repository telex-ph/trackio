import React from "react";
import StatCard from "./StatCard";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Coffee,
  Utensils,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const StatCardContainer = ({ role = "admin" }) => {
  const teamData = [
    {
      id: 1,
      name: "John Doe",
      status: "Present",
      timeIn: "8:00 AM",
      timeOut: "-",
      isLate: false,
      overtime: "0:30",
      undertime: "0:00",
      breakStatus: "Available",
      lunchStatus: "Available",
    },
    {
      id: 2,
      name: "Jane Smith",
      status: "Present",
      timeIn: "7:55 AM",
      timeOut: "-",
      isLate: false,
      overtime: "0:00",
      undertime: "0:00",
      breakStatus: "On Break",
      lunchStatus: "Available",
    },
    {
      id: 3,
      name: "Mike Johnson",
      status: "Absent",
      timeIn: "-",
      timeOut: "-",
      isLate: false,
      overtime: "0:00",
      undertime: "0:00",
      breakStatus: "N/A",
      lunchStatus: "N/A",
    },
    {
      id: 4,
      name: "Sarah Wilson",
      status: "Present",
      timeIn: "8:15 AM",
      timeOut: "-",
      isLate: true,
      overtime: "0:00",
      undertime: "0:15",
      breakStatus: "Available",
      lunchStatus: "On Lunch",
    },
    {
      id: 5,
      name: "Tom Brown",
      status: "Present",
      timeIn: "8:00 AM",
      timeOut: "-",
      isLate: false,
      overtime: "0:45",
      undertime: "0:00",
      breakStatus: "Available",
      lunchStatus: "Available",
    },
  ];
  const companyData = [
    // IT Department
    {
      id: 1,
      name: "Maria Santos",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg",
      department: "IT Department",
      role: "Software Developer",
      status: "Present",
      timeIn: "08:00 AM",
      timeOut: null,
      breakStatus: null,
      lunchStatus: null,
      workHours: "8:15",
      overtime: "0:15",
      undertime: "0:00",
      isLate: false,
      lastActivity: "Timed In - 08:00 AM",
      activityTime: "8 hours ago",
    },
    {
      id: 2,
      name: "John Rivera",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      department: "IT Department",
      role: "DevOps Engineer",
      status: "Present",
      timeIn: "08:15 AM",
      timeOut: null,
      breakStatus: "On Break",
      lunchStatus: null,
      workHours: "8:00",
      overtime: "0:00",
      undertime: "0:00",
      isLate: true,
      lastActivity: "Started Break - 02:30 PM",
      activityTime: "5 mins ago",
    },
    // Customer Service Department
    {
      id: 3,
      name: "Ana Reyes",
      avatar: "https://randomuser.me/api/portraits/women/28.jpg",
      department: "Customer Service",
      role: "Customer Service Rep",
      status: "Present",
      timeIn: "07:55 AM",
      timeOut: null,
      breakStatus: null,
      lunchStatus: "On Lunch",
      workHours: "8:20",
      overtime: "0:20",
      undertime: "0:00",
      isLate: false,
      lastActivity: "Started Lunch - 12:00 PM",
      activityTime: "2 hours ago",
    },
    {
      id: 4,
      name: "Carlos Mendoza",
      avatar: "https://randomuser.me/api/portraits/men/33.jpg",
      department: "Customer Service",
      role: "Customer Service Rep",
      status: "Present",
      timeIn: "08:30 AM",
      timeOut: null,
      breakStatus: null,
      lunchStatus: null,
      workHours: "7:45",
      overtime: "0:00",
      undertime: "0:15",
      isLate: true,
      lastActivity: "Ended Break - 01:45 PM",
      activityTime: "20 mins ago",
    },
    // Management
    {
      id: 5,
      name: "Lisa Garcia",
      avatar: "https://randomuser.me/api/portraits/women/41.jpg",
      department: "Management",
      role: "Project Manager",
      status: "Absent",
      timeIn: null,
      timeOut: null,
      breakStatus: null,
      lunchStatus: null,
      workHours: "0:00",
      overtime: "0:00",
      undertime: "8:00",
      isLate: false,
      lastActivity: "No Time In Today",
      activityTime: "N/A",
    },
    {
      id: 6,
      name: "Mark Reyes",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      department: "Management",
      role: "Team Lead",
      status: "Present",
      timeIn: "08:10 AM",
      timeOut: "06:30 PM",
      breakStatus: null,
      lunchStatus: null,
      workHours: "9:30",
      overtime: "1:30",
      undertime: "0:00",
      isLate: true,
      lastActivity: "Timed Out - 06:30 PM",
      activityTime: "30 mins ago",
    },
    // HR Department
    {
      id: 7,
      name: "Sarah Johnson",
      avatar: "https://randomuser.me/api/portraits/women/55.jpg",
      department: "HR",
      role: "HR Specialist",
      status: "Present",
      timeIn: "08:05 AM",
      timeOut: null,
      breakStatus: null,
      lunchStatus: null,
      workHours: "8:10",
      overtime: "0:10",
      undertime: "0:00",
      isLate: true,
      lastActivity: "Timed In - 08:05 AM",
      activityTime: "8 hours ago",
    },
    // Finance Department
    {
      id: 8,
      name: "Mike Chen",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      department: "Finance",
      role: "Accountant",
      status: "Present",
      timeIn: "07:50 AM",
      timeOut: null,
      breakStatus: null,
      lunchStatus: null,
      workHours: "8:25",
      overtime: "0:25",
      undertime: "0:00",
      isLate: false,
      lastActivity: "Ended Lunch - 01:00 PM",
      activityTime: "1 hour ago",
    },
    // Sales Department
    {
      id: 9,
      name: "Emma Wilson",
      avatar: "https://randomuser.me/api/portraits/women/67.jpg",
      department: "Sales",
      role: "Sales Representative",
      status: "Present",
      timeIn: "08:20 AM",
      timeOut: null,
      breakStatus: "On Break",
      lunchStatus: null,
      workHours: "7:55",
      overtime: "0:00",
      undertime: "0:05",
      isLate: true,
      lastActivity: "Started Break - 02:45 PM",
      activityTime: "10 mins ago",
    },
    {
      id: 10,
      name: "David Brown",
      avatar: "https://randomuser.me/api/portraits/men/78.jpg",
      department: "Sales",
      role: "Sales Manager",
      status: "Present",
      timeIn: "07:45 AM",
      timeOut: null,
      breakStatus: null,
      lunchStatus: null,
      workHours: "8:30",
      overtime: "0:30",
      undertime: "0:00",
      isLate: false,
      lastActivity: "Timed In - 07:45 AM",
      activityTime: "8 hours ago",
    },
  ];
  // TODO: refactor this
  // Admin ------------
  const departments = [
    "All",
    "IT Department",
    "Customer Service",
    "Management",
    "HR",
    "Finance",
    "Sales",
  ];

  let stats = {};
  if (role == "admin") {
    stats = {
      totalEmployees: companyData.length,
      present: companyData.filter((emp) => emp.status === "Present").length,
      absent: companyData.filter((emp) => emp.status === "Absent").length,
      late: companyData.filter((emp) => emp.isLate).length,
      onBreak: companyData.filter((emp) => emp.breakStatus === "On Break")
        .length,
      onLunch: companyData.filter((emp) => emp.lunchStatus === "On Lunch")
        .length,
      overtime: companyData.filter((emp) => emp.overtime !== "0:00").length,
      undertime: companyData.filter((emp) => emp.undertime !== "0:00").length,
      departments: departments.length - 1, // exclude "All"
    };
  } else if ("team-leader") {
    stats = {
      present: teamData.filter((emp) => emp.status === "Present").length,
      absent: teamData.filter((emp) => emp.status === "Absent").length,
      late: teamData.filter((emp) => emp.isLate).length,
      onBreak: teamData.filter((emp) => emp.breakStatus === "On Break").length,
      onLunch: teamData.filter((emp) => emp.lunchStatus === "On Lunch").length,
      overtime: teamData.filter((emp) => emp.overtime !== "0:00").length,
      undertime: teamData.filter((emp) => emp.undertime !== "0:00").length,
      total: teamData.length,
    };
  }

  return (
    <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 grid-flow-row-dense">
      <StatCard
        title="Total Employees"
        value={stats.totalEmployees}
        icon={
          <Users className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-slate-600 bg-slate-100 border-slate-400 border" />
        }
        subtitle="Company-wide"
      />
      <StatCard
        title="Present"
        value={stats.present}
        icon={
          <UserCheck className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-emerald-600 bg-emerald-100 border-emerald-400 border" />
        }
        subtitle="Currently Working"
      />
      <StatCard
        title="Absentees"
        value={stats.absent}
        icon={
          <UserX className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-red-500 bg-red-100 border-red-400 border" />
        }
        subtitle="Not Present"
      />
      <StatCard
        title="Late Arrivals"
        value={stats.late}
        icon={
          <Clock className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-amber-600 bg-amber-100 border-amber-400 border" />
        }
        subtitle="Late Today"
      />
      <StatCard
        title="On Break"
        value={stats.onBreak}
        icon={
          <Coffee className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-blue-600  bg-blue-100 border-blue-400 border" />
        }
        subtitle="Currently"
      />
      <StatCard
        title="On Lunch"
        value={stats.onLunch}
        icon={
          <Utensils className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-orange-600  bg-orange-100 border-orange-400 border" />
        }
        subtitle="Lunch Break"
      />
      <StatCard
        title="Overtime"
        value={stats.overtime}
        icon={
          <TrendingUp className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-violet-600  bg-violet-100 border-violet-400 border" />
        }
        subtitle="Extra Hours"
      />
      <StatCard
        title="Undertime"
        value={stats.undertime}
        icon={
          <TrendingDown className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-pink-600  bg-pink-100 border-pink-400 border" />
        }
        subtitle="Short Hours"
      />
    </div>
  );
};

export default StatCardContainer;
