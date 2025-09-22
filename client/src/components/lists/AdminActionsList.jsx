import React from 'react'
import { Timer, AlertTriangle, BarChart2, Settings, Download, Bell } from "lucide-react";

const AdminActionsList = () => {
    return (
        <div className="bg-white border-light rounded-md p-4 h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Admin Actions
            </h3>
            <div className="space-y-3">
                <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 px-4 rounded-lg text-left flex items-center text-sm transition-colors border border-blue-200">
                    <Download className="w-4 h-4 mr-3" />
                    Generate Company Report
                </button>
                <button className="w-full bg-green-50 hover:bg-green-100 text-green-700 py-3 px-4 rounded-lg text-left flex items-center text-sm transition-colors border border-green-200">
                    <BarChart2 className="w-4 h-4 mr-3" />
                    Department Analytics
                </button>
                <button className="w-full bg-yellow-50 hover:bg-yellow-100 text-yellow-700 py-3 px-4 rounded-lg text-left flex items-center text-sm transition-colors border border-yellow-200">
                    <AlertTriangle className="w-4 h-4 mr-3" />
                    Review Attendance Issues
                </button>
                <button className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 py-3 px-4 rounded-lg text-left flex items-center text-sm transition-colors border border-purple-200">
                    <Timer className="w-4 h-4 mr-3" />
                    Manage Time Policies
                </button>
                <button className="w-full bg-red-50 hover:bg-red-100 text-red-700 py-3 px-4 rounded-lg text-left flex items-center text-sm transition-colors border border-red-200">
                    <Bell className="w-4 h-4 mr-3" />
                    Send Company Notice
                </button>
            </div>
        </div>
    )
}

export default AdminActionsList