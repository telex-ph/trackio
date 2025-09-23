import { useState, useEffect } from "react";
import { Calendar, Eye } from "lucide-react";
import StatCards from "../../components/cards/StatCards";
import WeeklyAttendanceChart from "../../components/charts/WeeklyAttendanceChart";
import TeamStatusChart from "../../components/charts/TeamStatusChart";
import ActivityMonitorList from "../../components/lists/ActivityMonitorList";
import AdminActionsList from "../../components/lists/AdminActionsList";
import WorkHoursChart from "../../components/charts/WorkHoursChart";
import EmployeeDirectoryList from "../../components/lists/EmployeeDirectoryList";
import EmployeeModal from "../../components/modals/EmployeeModal";
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

const TeamLeaderDashboard = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isEmployeeClicked, setIsEmployeeClicked] = useState(false);

  const handleSelectedEmployee = (employee) => {
    setSelectedEmployee(employee);
    setIsEmployeeClicked(true);
  };
  const handleModalOnClose = () => {
    setIsEmployeeClicked(false);
  };

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const stats = [
    {
      key: "totalAgents",
      value: 25,
      title: "Total Agents",
      subTitle: "Team Members",
      icon: (
        <Users className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-slate-600 bg-slate-100 border-slate-400 border" />
      ),
    },
    {
      key: "present",
      value: 9,
      title: "Present",
      subTitle: "Currently Working",
      icon: (
        <UserCheck className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-emerald-600 bg-emerald-100 border-emerald-400 border" />
      ),
    },
    {
      key: "absent",
      value: 2,
      title: "Absentees",
      subTitle: "Not Present",
      icon: (
        <UserX className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-red-500 bg-red-100 border-red-400 border" />
      ),
    },
    {
      key: "late",
      value: 1,
      title: "Late Arrivals",
      subTitle: "Late Today",
      icon: (
        <Clock className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-amber-600 bg-amber-100 border-amber-400 border" />
      ),
    },
    {
      key: "onBreak",
      value: 3,
      title: "On Break",
      subTitle: "Currently",
      icon: (
        <Coffee className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-blue-600 bg-blue-100 border-blue-400 border" />
      ),
    },
    {
      key: "onLunch",
      value: 4,
      title: "On Lunch",
      subTitle: "Lunch Break",
      icon: (
        <Utensils className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-orange-600 bg-orange-100 border-orange-400 border" />
      ),
    },
    {
      key: "overtime",
      value: 1,
      title: "Overtime",
      subTitle: "Extra Hours",
      icon: (
        <TrendingUp className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-violet-600 bg-violet-100 border-violet-400 border" />
      ),
    },
    {
      key: "undertime",
      value: 0,
      title: "Undertime",
      subTitle: "Short Hours",
      icon: (
        <TrendingDown className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-pink-600 bg-pink-100 border-pink-400 border" />
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <section className="flex flex-col mb-2">
            <div className="flex items-center gap-1">
              <h2 className="text-xl sm:text-2xl font-semibold">
                Team Monitoring Dashboard
              </h2>
            </div>
            <p className="text-light text-sm sm:text-base">
              Real-time attendance and work hours monitoring
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Last updated: {currentTime.toLocaleTimeString()} | Today:{" "}
              {currentTime.toLocaleDateString()}
            </p>
          </section>
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <button className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm sm:text-base">View Reports</span>
          </button>
          <button className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
            <Eye className="w-4 h-4 mr-2" />
            <span className="text-sm sm:text-base">Live Monitor</span>
          </button>
        </div>
      </div>

      <StatCards stats={stats} />

      <main className="grid grid-cols-1 grid-rows-[20rem_20rem_50rem_20rem_20rem_50rem_20rem_20rem] lg:grid-cols-3 lg:grid-rows-[25rem_23rem_23rem_23rem_23rem] gap-4">
        <section className="lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2">
          <WeeklyAttendanceChart />
        </section>
        <section className="lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2">
          <TeamStatusChart />
        </section>
        <section className="lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-4">
          <ActivityMonitorList />
        </section>
        <section className="lg:col-start-1 lg:col-end-3 lg:row-start-2 lg:row-end-4">
          <WorkHoursChart />
        </section>

        <section className="row-start-4 row-end-7 lg:col-start-1 lg:col-end-3 lg:row-start-4 lg:row-end-6">
          <EmployeeDirectoryList onClick={handleSelectedEmployee} />
        </section>

        <section className="lg:col-start-3 lg:col-end-4 lg:row-start-4 lg:row-end-5">
          <AdminActionsList />
        </section>
      </main>

      {/* Employee Detail Modal Overlay */}
      {isEmployeeClicked && (
        <EmployeeModal
          employee={selectedEmployee}
          onClose={handleModalOnClose}
        />
      )}
    </div>
  );
};

export default TeamLeaderDashboard;
