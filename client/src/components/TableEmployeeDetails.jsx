import React from "react";
import {
  User,
  Mail,
  Phone,
  Hash,
  Briefcase,
  Shield,
  Building2,
} from "lucide-react";

const TableEmployeeDetails = ({ employee }) => {
  if (!employee) return null;

  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-white rounded-lg border border-gray-200">
          <User className="w-5 h-5 text-gray-700" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Employee Details</h3>
      </div>

      <div className="space-y-5">
        {/* Name */}
        <div className="flex items-start gap-4">
          <div className="p-2 bg-white rounded-lg border border-gray-200 mt-1">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">
              Full Name
            </p>
            <p className="text-gray-900 font-semibold">
              {employee.name || `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || "N/A"}
            </p>
          </div>
        </div>

        {/* Employee ID */}
        <div className="flex items-start gap-4">
          <div className="p-2 bg-white rounded-lg border border-gray-200 mt-1">
            <Hash className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">
              Employee ID
            </p>
            <p className="text-gray-900 font-semibold font-mono">
              #{employee.id}
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start gap-4">
          <div className="p-2 bg-white rounded-lg border border-gray-200 mt-1">
            <Mail className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">
              Email Address
            </p>
            <p className="text-gray-900 break-all">
              {employee.email || "N/A"}
            </p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-start gap-4">
          <div className="p-2 bg-white rounded-lg border border-gray-200 mt-1">
            <Phone className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">
              Phone Number
            </p>
            <p className="text-gray-900 font-mono">
              {employee.phone || "N/A"}
            </p>
          </div>
        </div>

        {/* Assigned Accounts */}
        <div className="flex items-start gap-4">
          <div className="p-2 bg-white rounded-lg border border-gray-200 mt-1">
            <Building2 className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">
              Assigned Accounts
            </p>
            <p className="text-gray-900">
              {Array.isArray(employee.accounts)
                ? employee.accounts.join(", ")
                : employee.accounts || "N/A"}
            </p>
          </div>
        </div>

        {/* Position */}
        <div className="flex items-start gap-4">
          <div className="p-2 bg-white rounded-lg border border-gray-200 mt-1">
            <Briefcase className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">
              Position
            </p>
            <p className="text-gray-900">{employee.position || "N/A"}</p>
          </div>
        </div>

        {/* Department */}
        <div className="flex items-start gap-4">
          <div className="p-2 bg-white rounded-lg border border-gray-200 mt-1">
            <Shield className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">
              Department
            </p>
            <p className="text-gray-900">{employee.department || "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableEmployeeDetails;
