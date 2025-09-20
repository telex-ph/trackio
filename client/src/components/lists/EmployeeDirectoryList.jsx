import { useState } from 'react'
import { Users, Search } from "lucide-react";

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

const departments = [
    "All",
    "IT Department",
    "Customer Service",
    "Management",
    "HR",
    "Finance",
    "Sales",
];

const EmployeeDirectoryList = ({ onClick }) => {
    const [filterDepartment, setFilterDepartment] = useState("All");
    const [filterStatus, setFilterStatus] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    const handleItemOnClick = (employee) => {
        if (onClick) {
            onClick(employee)
        }
    }

    const statusColors = {
        Present: "text-green-700 bg-green-100 border-green-200",
        Absent: "text-red-700 bg-red-100 border-red-200",
        "On Break": "text-blue-700 bg-blue-100 border-blue-200",
        "On Lunch": "text-yellow-700 bg-yellow-100 border-yellow-200",
    };

    const filteredEmployees = companyData.filter((emp) => {
        const matchesDepartment =
            filterDepartment === "All" || emp.department === filterDepartment;
        const matchesStatus =
            filterStatus === "All" ||
            (filterStatus === "Present" && emp.status === "Present") ||
            (filterStatus === "Absent" && emp.status === "Absent") ||
            (filterStatus === "Late" && emp.isLate);
        const matchesSearch =
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.role.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesDepartment && matchesStatus && matchesSearch;
    });

    return (
        <div className="bg-white border-light rounded-md p-4 h-full flex flex-col">
            {/* Employee List */}
            <div className="">
                <div className="border-b border-gray-200">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
                                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                                    Employee Directory & Status
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                    Complete employee management overview
                                </p>
                            </div>
                        </div>

                        <div className="w-full">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search employees..."
                                    className="w-full bg-white border border-gray-300 hover:border-gray-400 rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm font-medium text-gray-700"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                        </div>
                        <div className="flex justify-end gap-4 mb-4">
                            <select
                                className="w-full sm:w-40 bg-white border border-gray-300 hover:border-gray-400 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700"
                                value={filterDepartment}
                                onChange={(e) => setFilterDepartment(e.target.value)}
                            >
                                {departments.map((dept) => (
                                    <option key={dept} value={dept}>
                                        {dept}
                                    </option>
                                ))}
                            </select>
                            <select
                                className="w-full sm:w-32 bg-white border border-gray-300 hover:border-gray-400 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="All">All Status</option>
                                <option value="Present">Present</option>
                                <option value="Absent">Absent</option>
                                <option value="Late">Late Arrivals</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-2 p-2">
                {filteredEmployees.map((employee) => (
                    <div
                        key={employee.id}
                        className="bg-white rounded-md border-light p-3 sm:p-4 cursor-pointer"
                        onClick={() => handleItemOnClick(employee)}
                    >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-4">
                            {/* Left section - Employee info */}
                            <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                                {/* Avatar with status */}
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={employee.avatar}
                                        alt={employee.name}
                                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                                    />
                                    <div
                                        className={`absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white ${employee.status === "Present"
                                            ? "bg-green-500"
                                            : employee.status === "Absent"
                                                ? "bg-red-500"
                                                : employee.breakStatus === "On Break"
                                                    ? "bg-blue-500"
                                                    : employee.lunchStatus === "On Lunch"
                                                        ? "bg-yellow-500"
                                                        : "bg-gray-500"
                                            }`}
                                    />
                                </div>

                                {/* Employee details */}
                                <div className="flex-1 min-w-0">
                                    {/* Name and late badge */}
                                    <h4 className="font-semibold text-gray-900 flex items-center text-sm sm:text-base">
                                        <span className="truncate">{employee.name}</span>
                                        {employee.isLate && (
                                            <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0">
                                                Late
                                            </span>
                                        )}
                                    </h4>

                                    {/* Department and role */}
                                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                                        <span className="px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                            {employee.department}
                                        </span>
                                        <span className="text-xs text-gray-500 hidden sm:inline">
                                            •
                                        </span>
                                        <span className="text-xs text-gray-600 truncate">
                                            {employee.role}
                                        </span>
                                    </div>

                                    {/* Status badges */}
                                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                                        <span
                                            className={`px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium border ${statusColors[employee.status]
                                                }`}
                                        >
                                            {employee.status}
                                        </span>
                                        {employee.breakStatus && (
                                            <span className="px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                {employee.breakStatus}
                                            </span>
                                        )}
                                        {employee.lunchStatus && (
                                            <span className="px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                                {employee.lunchStatus}
                                            </span>
                                        )}
                                    </div>

                                    {/* Last activity */}
                                    <p className="text-xs text-gray-600 mt-1 truncate">
                                        {employee.lastActivity}
                                    </p>
                                </div>
                            </div>

                            {/* Right section - Time data */}
                            <div className="w-full lg:w-auto lg:flex-shrink-0">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-center lg:text-right">
                                    <div className="bg-gray-50 lg:bg-transparent rounded-lg lg:rounded-none p-2 lg:p-0">
                                        <div className="text-xs sm:text-sm font-bold text-gray-900">
                                            {employee.timeIn || "--"}
                                        </div>
                                        <div className="text-xs text-gray-500">Time In</div>
                                    </div>
                                    <div className="bg-gray-50 lg:bg-transparent rounded-lg lg:rounded-none p-2 lg:p-0">
                                        <div className="text-xs sm:text-sm font-bold text-gray-900">
                                            {employee.workHours}
                                        </div>
                                        <div className="text-xs text-gray-500">Hours</div>
                                    </div>
                                    <div className="bg-gray-50 lg:bg-transparent rounded-lg lg:rounded-none p-2 lg:p-0">
                                        <div
                                            className={`text-xs sm:text-sm font-bold ${employee.overtime !== "0:00"
                                                ? "text-purple-600"
                                                : "text-gray-900"
                                                }`}
                                        >
                                            {employee.overtime}
                                        </div>
                                        <div className="text-xs text-gray-500">Overtime</div>
                                    </div>
                                    <div className="bg-gray-50 lg:bg-transparent rounded-lg lg:rounded-none p-2 lg:p-0">
                                        <div
                                            className={`text-xs sm:text-sm font-bold ${employee.undertime !== "0:00"
                                                ? "text-red-600"
                                                : "text-gray-900"
                                                }`}
                                        >
                                            {employee.undertime}
                                        </div>
                                        <div className="text-xs text-gray-500">Undertime</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredEmployees.length === 0 && (
                    <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 text-center text-gray-500 text-sm sm:text-base">
                        No employees found matching your search criteria.
                    </div>
                )}
            </div>
        </div>
    )
}

export default EmployeeDirectoryList