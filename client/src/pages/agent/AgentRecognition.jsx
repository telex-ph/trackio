import React, { useState } from 'react';
import UnderContruction from '../../assets/illustrations/UnderContruction';

const AgentRecognition = () => {
  const [timeFrame, setTimeFrame] = useState('month');

  // Leaderboard data
  const leaderboardData = [
    { id: 1, name: "Seligiha Dutta", department: "Marketing", rank: 4, points: 2450, isCurrentUser: false },
    { id: 2, name: "Aeethi Bilgisi", department: "Cortings", rank: 2, points: 3200, isCurrentUser: false },
    { id: 3, name: "Sarebey Gaha", department: "Design", rank: 5, points: 1980, isCurrentUser: false },
    { id: 4, name: "Kongkora Das", department: "Engineering", rank: 1, points: 3850, isCurrentUser: false },
    { id: 5, name: "Himadri Nath", department: "Marketing", rank: 6, points: 1750, isCurrentUser: false },
    { id: 6, name: "Rutha Sarmah", department: "Sales", rank: 3, points: 2750, isCurrentUser: false },
    { id: 7, name: "Kongkora Bayan", department: "Operations", rank: 7, points: 1620, isCurrentUser: false },
    { id: 8, name: "Hemanga Bhar...", department: "HR", rank: 8, points: 1480, isCurrentUser: false },
    { id: 9, name: "My Banking", department: "Finance", rank: 9, points: 1250, isCurrentUser: false },
    { id: 10, name: "You", department: "Development", rank: 10, points: 980, isCurrentUser: true },
    { id: 11, name: "Gilbert Raux", department: "Support", rank: 11, points: 750, isCurrentUser: false },
  ];

  // Sort by rank
  const sortedData = [...leaderboardData].sort((a, b) => a.rank - b.rank);

  // Get rank badge color
  const getRankBadgeClass = (rank) => {
    switch(rank) {
      case 1: return "bg-gradient-to-r from-yellow-400 to-yellow-300 text-yellow-900";
      case 2: return "bg-gradient-to-r from-gray-300 to-gray-200 text-gray-700";
      case 3: return "bg-gradient-to-r from-amber-600 to-amber-500 text-amber-100";
      default: return "bg-gradient-to-r from-blue-50 to-white text-gray-700 border border-gray-200";
    }
  };

  // Handle time frame change
  const handleTimeFrameChange = (frame) => {
    setTimeFrame(frame);
    // In a real app, you would fetch data for the selected time frame here
  };

    return (
    <section className="h-full">
      <UnderContruction />
    </section>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-gray-600 text-lg">
            Check latest rankings based on rewards, recognition and employee engagement.
          </p>
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left side - Leaderboard cards */}
          <div className="lg:w-2/3">
            {/* Time frame selector */}
            <div className="mb-8 flex flex-wrap gap-4">
              <button 
                onClick={() => handleTimeFrameChange('month')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${timeFrame === 'month' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
              >
                This Month
              </button>
              <button 
                onClick={() => handleTimeFrameChange('quarter')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${timeFrame === 'quarter' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
              >
                This Quarter
              </button>
              <button 
                onClick={() => handleTimeFrameChange('year')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${timeFrame === 'year' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
              >
                This Year
              </button>
            </div>

            {/* Leaderboard cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Top 3 cards */}
              {sortedData.slice(0, 3).map((employee) => (
                <div 
                  key={employee.id}
                  className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${
                    employee.rank === 1 ? 'border-yellow-400' : 
                    employee.rank === 2 ? 'border-gray-300' : 
                    'border-amber-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`rank-badge ${getRankBadgeClass(employee.rank)} w-12 h-12 flex items-center justify-center rounded-xl font-bold text-xl`}>
                      {employee.rank}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Points</div>
                      <div className="text-2xl font-bold text-gray-800">{employee.points}</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{employee.name}</h3>
                    <p className="text-gray-600 mb-4">{employee.department}</p>
                    {employee.rank === 1 && (
                      <div className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                        <i className="fas fa-crown"></i>
                        <span>Top Performer</span>
                      </div>
                    )}
                    {employee.rank === 2 && (
                      <div className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                        <i className="fas fa-medal"></i>
                        <span>Runner Up</span>
                      </div>
                    )}
                    {employee.rank === 3 && (
                      <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                        <i className="fas fa-award"></i>
                        <span>Third Place</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Full leaderboard list */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Full Rankings</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {sortedData.map((employee) => (
                  <div 
                    key={employee.id}
                    className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                      employee.isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`rank-badge ${getRankBadgeClass(employee.rank)} w-10 h-10 flex items-center justify-center rounded-lg font-bold`}>
                        {employee.rank}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">
                            {employee.name}
                            {employee.isCurrentUser && (
                              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">You</span>
                            )}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-500">{employee.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{employee.points}</div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Stats & Info */}
          <div className="lg:w-1/3">
            {/* Stats card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-xl p-6 text-white mb-8">
              <h3 className="text-xl font-bold mb-6">Leaderboard Stats</h3>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-blue-200">Total Participants</span>
                    <span className="font-bold">48</span>
                  </div>
                  <div className="w-full bg-blue-500 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-blue-200">Average Points</span>
                    <span className="font-bold">1,840</span>
                  </div>
                  <div className="w-full bg-blue-500 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-blue-200">Your Rank Progress</span>
                    <span className="font-bold">Top 21%</span>
                  </div>
                  <div className="w-full bg-blue-500 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full" style={{ width: '79%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-blue-200 text-sm">Current Period</div>
                    <div className="font-bold text-lg">Q3 2023</div>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-200 text-sm">Next Update</div>
                    <div className="font-bold text-lg">Oct 1</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rewards card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">This Month's Rewards</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <i className="fas fa-gift text-yellow-600 text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">1st Place</h4>
                    <p className="text-sm text-gray-600">$500 Bonus + Extra Day Off</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <div className="bg-gray-200 p-3 rounded-lg">
                    <i className="fas fa-medal text-gray-600 text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">2nd & 3rd Place</h4>
                    <p className="text-sm text-gray-600">$250 Bonus</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <i className="fas fa-star text-blue-600 text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Top 10</h4>
                    <p className="text-sm text-gray-600">Recognition Certificate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">How It Works</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">1</div>
                  <p className="text-gray-700">Points are awarded based on performance, peer recognition, and engagement.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">2</div>
                  <p className="text-gray-700">Leaderboard resets at the beginning of each month.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">3</div>
                  <p className="text-gray-700">Top performers receive rewards and recognition.</p>
                </div>
              </div>
              <button className="mt-6 w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 rounded-xl transition-all shadow-md hover:shadow-lg">
                View Full Details
              </button>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-10 text-center text-gray-500 text-sm">
          <p>Leaderboard updated daily at 12:00 AM UTC. Rankings are based on cumulative points.</p>
        </div>
      </div>
    </div>
  );
};

export default AgentRecognition;