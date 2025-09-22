import { useState, useEffect } from "react";
import { Calendar, Settings, Download } from "lucide-react";
import CompanyAttendanceChart from "../../components/charts/CompanyAttendanceChart";
import DepartmentStatusChart from "../../components/charts/DepartmentStatusChart";
import ProductivityChart from "../../components/charts/ProductivityChart";
import WorkHoursAnalysisChart from "../../components/charts/WorkHoursAnalysisChart";
import ActivityMonitorList from "../../components/lists/ActivityMonitorList";
import AdminActionsList from "../../components/lists/AdminActionsList";
import EmployeeDirectoryList from "../../components/lists/EmployeeDirectoryList";
import StatCardContainer from "../../components/cards/StatCardContainer";
import EmployeeModal from "../../components/modals/EmployeeModal";

const AdminDashboard = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEmployeeClicked, setIsEmployeeClicked] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const handleSelectedEmployee = (employee) => {
    setSelectedEmployee(employee);
    setIsEmployeeClicked(true);
  }
  const handleModalOnClose = () => {
    setIsEmployeeClicked(false);
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-2 lg:gap-6 mb-4 sm:mb-6">
        <div className="flex-1">
          <section className="flex flex-col mb-2">
            <div className="flex items-center gap-1">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Admin Monitoring Dashboard
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

        <div className="flex flex-col sm:flex-row space-y-1.5 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <button className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
            <Download className="w-4 h-4 mr-2" />
            <span className="text-sm sm:text-base">Export Data</span>
          </button>
          <button className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm sm:text-base">Analytics</span>
          </button>
          <button className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center">
            <Settings className="w-4 h-4 mr-2" />
            <span className="text-sm sm:text-base">Settings</span>
          </button>
        </div>
      </div>

      {/* Enhanced Stats */}
      <StatCardContainer role="admin"/>

      <main className="grid grid-cols-1 grid-rows-[20rem_20rem_50rem_20rem_20rem_50rem_20rem] lg:grid-cols-3 lg:grid-rows-[25rem_23rem_23rem_23rem] gap-4">
        <section className="lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2">
          <CompanyAttendanceChart />
        </section>

        <section className="lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2">
          <DepartmentStatusChart />
        </section>

        <section className="lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-4">
          <ActivityMonitorList />
        </section>

        <section className="lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-3">
          <ProductivityChart />
        </section>

        <section className="lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-3">
          <WorkHoursAnalysisChart />
        </section>

        <section className="lg:col-start-1 lg:col-end-3 lg:row-start-3 lg:row-end-5">
          <EmployeeDirectoryList onClick={handleSelectedEmployee} />
        </section>

        <section className="lg:col-start-3 lg:col-end-4 lg:row-start-4 lg:row-end-5">
          <AdminActionsList />
        </section>
        {/* Admin Quick Actions */}
      </main>


      {/* Main Content */}
      {/* <div className="grid grid-cols-12 gap-4">
        <div className=" col-span-12 lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CompanyAttendanceChart />
            <DepartmentStatusChart />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProductivityChart />
            <WorkHoursAnalysisChart />
          </div>

          <EmployeeDirectoryList onClick={handleSelectedEmployee} />
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <ActivityMonitorList />

          <AdminActionsList />
        </div>
      </div> */}

      {/* Employee Detail Modal */}
      {isEmployeeClicked && <EmployeeModal employee={selectedEmployee} onClose={handleModalOnClose} />}
    </div >
  );
};

export default AdminDashboard;
