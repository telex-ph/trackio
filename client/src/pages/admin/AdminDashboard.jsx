import React from "react";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Coffee,
  Utensils,
  Activity,
} from "lucide-react";

const liveMonitoring = [
  {
    name: "Jayson Mercado",
    role: "Customer Service Representative",
    status: "Break Started - 9:45 AM Biggel short break with 15 minutes allowed, timer running.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    time: "9:45 AM"
  },
  {
    name: "Angelica Santos",
    role: "Customer Service Representative",
    status: "Break Started - 9:45 AM Biggel short break with 15 minutes allowed, timer running.",
    image: "https://randomuser.me/api/portraits/women/45.jpg",
    time: "9:45 AM"
  },
  {
    name: "Liza Bautista",
    role: "Customer Service Representative",
    status: "Break Started - 9:45 AM Biggel short break with 15 minutes allowed, timer running.",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
    time: "9:45 AM"
  },
  {
    name: "Michelle Soriano",
    role: "Customer Service Representative",
    status: "Break Started - 9:45 AM Biggel short break with 15 minutes allowed, timer running.",
    image: "https://randomuser.me/api/portraits/women/21.jpg",
    time: "9:45 AM"
  },
  {
    name: "Rica Flores",
    role: "Customer Service Representative",
    status: "Break Started - 9:45 AM Biggel short break with 15 minutes allowed, timer running.",
    image: "https://randomuser.me/api/portraits/women/33.jpg",
    time: "9:45 AM"
  },
  {
    name: "Mark Reyes",
    role: "Customer Service Representative",
    status: "Break Started - 9:45 AM Biggel short break with 15 minutes allowed, timer running.",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
    time: "9:45 AM"
  },
];

// Simple Chart Components using CSS and HTML
const DonutChart = ({ percentage, label, total, colors = ['#800000', '#D3D3D3'] }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative">
        <svg width="150" height="150" className="transform -rotate-90">
          <circle
            cx="75"
            cy="75"
            r={radius}
            fill="none"
            stroke={colors[1]}
            strokeWidth="12"
          />
          <circle
            cx="75"
            cy="75"
            r={radius}
            fill="none"
            stroke={colors[0]}
            strokeWidth="12"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold">Total</span>
          <span className="text-xl font-semibold">{total}</span>
        </div>
      </div>
      <div className="flex items-center justify-center space-x-4 mt-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: colors[0] }}></div>
          <span>On Time ({Math.round(percentage)}%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: colors[1] }}></div>
          <span>Late ({100 - Math.round(percentage)}%)</span>
        </div>
      </div>
    </div>
  );
};

const LineChart = () => {
  const data = [20, 50, 30, 55, 60, 45, 80];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxValue = Math.max(...data);
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative p-4">
        <svg width="100%" height="200" viewBox="0 0 400 200">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="40"
              y1={20 + i * 35}
              x2="360"
              y2={20 + i * 35}
              stroke="#f0f0f0"
              strokeWidth="1"
            />
          ))}
          
          {/* Y-axis */}
          <line x1="40" y1="20" x2="40" y2="160" stroke="#e0e0e0" strokeWidth="1" />
          
          {/* X-axis */}
          <line x1="40" y1="160" x2="360" y2="160" stroke="#e0e0e0" strokeWidth="1" />
          
          {/* Data line */}
          <polyline
            points={data.map((value, index) => {
              const x = 40 + (index * 320) / (data.length - 1);
              const y = 160 - ((value / maxValue) * 140);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#800000"
            strokeWidth="3"
          />
          
          {/* Data points */}
          {data.map((value, index) => {
            const x = 40 + (index * 320) / (data.length - 1);
            const y = 160 - ((value / maxValue) * 140);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#800000"
              />
            );
          })}
          
          {/* X-axis labels */}
          {days.map((day, index) => {
            const x = 40 + (index * 320) / (days.length - 1);
            return (
              <text
                key={index}
                x={x}
                y="180"
                textAnchor="middle"
                fontSize="12"
                fill="#666"
              >
                {day}
              </text>
            );
          })}
          
          {/* Y-axis labels */}
          {[0, 20, 40, 60, 80].map((value, index) => (
            <text
              key={index}
              x="30"
              y={165 - (index * 35)}
              textAnchor="end"
              fontSize="12"
              fill="#666"
            >
              {value}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
};

const AreaChart = () => {
  const data = [
    { day: 'Mon', overtime: 15, undertime: 8 },
    { day: 'Tue', overtime: 20, undertime: 10 },
    { day: 'Wed', overtime: 10, undertime: 5 },
    { day: 'Thu', overtime: 18, undertime: 7 },
    { day: 'Fri', overtime: 15, undertime: 6 },
    { day: 'Sat', overtime: 25, undertime: 12 },
    { day: 'Sun', overtime: 20, undertime: 9 },
  ];
  
  const maxValue = 25;
  
  return (
    <div className="h-full flex flex-col relative">
      <div className="flex-1 p-4">
        <svg width="100%" height="180" viewBox="0 0 400 180">
          {/* Overtime area */}
          <path
            d={`M 40,140 ${data.map((item, index) => {
              const x = 40 + (index * 320) / (data.length - 1);
              const y = 140 - ((item.overtime / maxValue) * 120);
              return `L ${x},${y}`;
            }).join(' ')} L 360,140 Z`}
            fill="#800000"
            fillOpacity="0.6"
          />
          
          {/* Undertime area */}
          <path
            d={`M 40,140 ${data.map((item, index) => {
              const x = 40 + (index * 320) / (data.length - 1);
              const y = 140 - ((item.undertime / maxValue) * 120);
              return `L ${x},${y}`;
            }).join(' ')} L 360,140 Z`}
            fill="#FF69B4"
            fillOpacity="0.4"
          />
          
          {/* X-axis labels */}
          {data.map((item, index) => {
            const x = 40 + (index * 320) / (data.length - 1);
            return (
              <text
                key={index}
                x={x}
                y="160"
                textAnchor="middle"
                fontSize="12"
                fill="#666"
              >
                {item.day}
              </text>
            );
          })}
        </svg>
      </div>
      
      {/* Legend and 20% indicator */}
      <div className="flex justify-between items-center px-4 pb-2">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-800 rounded mr-2"></div>
            <span>Overtime</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-pink-400 rounded mr-2"></div>
            <span>Undertime</span>
          </div>
        </div>
        <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs">20%</span>
      </div>
    </div>
  );
};

const PieChart = () => {
  const data = [
    { name: "Working", value: 40, color: "#800000" },
    { name: "On Lunch", value: 5, color: "#FF69B4" },
    { name: "Absent", value: 5, color: "#FFD700" },
    { name: "On Break", value: 5, color: "#D3D3D3" },
  ];
  
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativeAngle = 0;
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative">
        <svg width="160" height="160" viewBox="0 0 160 160">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = cumulativeAngle;
            const endAngle = cumulativeAngle + angle;
            
            const startX = 80 + 60 * Math.cos((startAngle - 90) * Math.PI / 180);
            const startY = 80 + 60 * Math.sin((startAngle - 90) * Math.PI / 180);
            const endX = 80 + 60 * Math.cos((endAngle - 90) * Math.PI / 180);
            const endY = 80 + 60 * Math.sin((endAngle - 90) * Math.PI / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const pathData = [
              `M 80 80`,
              `L ${startX} ${startY}`,
              `A 60 60 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              'Z'
            ].join(' ');
            
            cumulativeAngle += angle;
            
            // Calculate label position
            const labelAngle = startAngle + angle / 2;
            const labelX = 80 + 40 * Math.cos((labelAngle - 90) * Math.PI / 180);
            const labelY = 80 + 40 * Math.sin((labelAngle - 90) * Math.PI / 180);
            
            return (
              <g key={index}>
                <path
                  d={pathData}
                  fill={item.color}
                  className="transition-all duration-500 hover:opacity-80"
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                  fill="white"
                  fontWeight="bold"
                >
                  {Math.round(percentage)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 rounded mr-2" 
              style={{ backgroundColor: item.color }}
            ></div>
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Any updates will reflect on the admin account profile.
        </p>
      </div>

      {/* Stats Cards - 2 rows of 4 cards each */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          title="No. of Working"
          value="80"
          icon={<Users className="w-6 h-6 text-white" />}
          bgColor="bg-blue-500"
        />
        <StatCard
          title="No. of Present"
          value="95"
          icon={<UserCheck className="w-6 h-6 text-white" />}
          bgColor="bg-orange-500"
        />
        <StatCard
          title="No. of Absentees"
          value="5"
          icon={<UserX className="w-6 h-6 text-white" />}
          bgColor="bg-red-500"
        />
        <StatCard
          title="No. of Late"
          value="10"
          icon={<Clock className="w-6 h-6 text-white" />}
          bgColor="bg-pink-500"
        />
        
        <StatCard
          title="No. of Undertime"
          value="5"
          icon={<Activity className="w-6 h-6 text-white" />}
          bgColor="bg-green-500"
        />
        <StatCard
          title="No. of Overtime"
          value="5"
          icon={<Activity className="w-6 h-6 text-white" />}
          bgColor="bg-purple-500"
        />
        <StatCard
          title="No. of On Lunch"
          value="5"
          icon={<Utensils className="w-6 h-6 text-white" />}
          bgColor="bg-orange-600"
        />
        <StatCard
          title="No. of On Break"
          value="5"
          icon={<Coffee className="w-6 h-6 text-white" />}
          bgColor="bg-indigo-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Charts */}
        <div className="col-span-8 space-y-6">
          {/* Top Row - 2 Charts */}
          <div className="grid grid-cols-2 gap-6">
            <Card title="ON-TIME vs LATE LOGINS" className="h-80">
              <DonutChart percentage={75} total={1000} />
            </Card>

            <Card title="COUNT OF PRESENT EMPLOYEES" className="h-80">
              <LineChart />
            </Card>
          </div>

          {/* Bottom Row - 2 Charts */}
          <div className="grid grid-cols-2 gap-6">
            <Card title="WORK HOURS DEVIATION" className="h-80">
              <AreaChart />
            </Card>

            <Card title="WORKFORCE STATUS - TODAY" className="h-80">
              <PieChart />
            </Card>
          </div>
        </div>

        {/* Right Column - Live Monitoring */}
        <div className="col-span-4">
          <Card title="LIVE MONITORING:" className="h-full">
            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-2">
              {liveMonitoring.map((emp, i) => (
                <div
                  key={i}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={emp.image}
                    alt={emp.name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-gray-900 text-sm truncate">{emp.name}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{emp.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{emp.role}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {emp.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Reusable Card Component
const Card = ({ title, children, className }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className || ""}`}>
    <h2 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">{title}</h2>
    {children}
  </div>
);

// Reusable Stat Card
const StatCard = ({ title, value, icon, bgColor }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center space-x-3 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-600 mb-1 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default AdminDashboard;