import { useState, useEffect } from "react";
import { Calendar, Eye } from "lucide-react";
import StatCardContainer from "../../components/cards/StatCardContainer";
import CompanyAttendanceChart from "../../components/charts/CompanyAttendanceChart";
import TeamStatusChart from "../../components/charts/TeamStatusChart";
import ActivityMonitorList from "../../components/lists/ActivityMonitorList";
import AdminActionsList from "../../components/lists/AdminActionsList";
import ProductivityChart from "../../components/charts/ProductivityChart";
import EmployeeDirectoryList from "../../components/lists/EmployeeDirectoryList";
import EmployeeModal from "../../components/modals/EmployeeModal";

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

      <StatCardContainer role="team-leader" />

      <main className="grid grid-cols-1 grid-rows-[20rem_20rem_50rem_20rem_20rem_50rem_20rem_20rem] lg:grid-cols-3 lg:grid-rows-[25rem_23rem_23rem_23rem_23rem] gap-4">
        <section className="lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2">
          <CompanyAttendanceChart />
        </section>
        <section className="lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2">
          <TeamStatusChart />
        </section>
        <section className="lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-4">
          <ActivityMonitorList />
        </section>
        <section className="lg:col-start-1 lg:col-end-3 lg:row-start-2 lg:row-end-4">
          <ProductivityChart />
        </section>

        <section className="lg:col-start-1 lg:col-end-3 lg:row-start-4 lg:row-end-6">
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
