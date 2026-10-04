import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// --- Mock Data (Replace these with real API calls later) ---
const MOCK_STATS = [
  {
    title: "Total Users",
    value: "2,543",
    change: "+12.5%",
    isPositive: true,
    icon: "users",
  },
  {
    title: "Total Files",
    value: "1,204",
    change: "+5.2%",
    isPositive: true,
    icon: "files",
  },
  {
    title: "Storage Used",
    value: "45.2 GB",
    change: "-1.2%",
    isPositive: false,
    icon: "server",
  },
  {
    title: "Active Sessions",
    value: "342",
    change: "+8.1%",
    isPositive: true,
    icon: "activity",
  },
];

const TRAFFIC_DATA = [
  { name: "Mon", visitors: 4000, uploads: 2400 },
  { name: "Tue", visitors: 3000, uploads: 1398 },
  { name: "Wed", visitors: 2000, uploads: 9800 },
  { name: "Thu", visitors: 2780, uploads: 3908 },
  { name: "Fri", visitors: 1890, uploads: 4800 },
  { name: "Sat", visitors: 2390, uploads: 3800 },
  { name: "Sun", visitors: 3490, uploads: 4300 },
];

const RECENT_ACTIVITY = [
  {
    id: 1,
    user: "Alice Freeman",
    action: "Uploaded file",
    target: "project_specs.pdf",
    time: "2 min ago",
    status: "success",
  },
  {
    id: 2,
    user: "Bob Smith",
    action: "Deleted user",
    target: "john_doe",
    time: "15 min ago",
    status: "danger",
  },
  {
    id: 3,
    user: "Server System",
    action: "Backup completed",
    target: "daily_backup_v2",
    time: "1 hour ago",
    status: "info",
  },
  {
    id: 4,
    user: "Sarah Wilson",
    action: "Updated profile",
    target: "avatar.png",
    time: "3 hours ago",
    status: "success",
  },
  {
    id: 5,
    user: "Mike Jones",
    action: "Login attempt",
    target: "Failed (IP: 192.168...)",
    time: "5 hours ago",
    status: "warning",
  },
];

function Dashboard() {
  const [loading, setLoading] = useState(true);

  // Simulate data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500">
            Welcome back, here's what's happening today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors flex items-center gap-2">
            <DownloadIcon />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {MOCK_STATS.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Traffic Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">
              System Traffic & Uploads
            </h3>
            <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={TRAFFIC_DATA}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVis)"
                  name="Visitors"
                />
                <Area
                  type="monotone"
                  dataKey="uploads"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorUp)"
                  name="Uploads"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Server Health / Secondary Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Server Load</h3>
          <div className="h-48 w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TRAFFIC_DATA.slice(0, 5)}>
                <Bar dataKey="visitors" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Tooltip cursor={{ fill: "transparent" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">CPU Usage</span>
              <span className="text-sm font-bold text-gray-800">45%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full"
                style={{ width: "45%" }}
              ></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Memory Usage</span>
              <span className="text-sm font-bold text-gray-800">78%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full"
                style={{ width: "78%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 lg:col-span-2 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Time
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {RECENT_ACTIVITY.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {item.user}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-800">{item.action}</span>
                      <span className="text-gray-400 mx-2">•</span>
                      <span className="text-gray-500 italic text-sm">
                        {item.target}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {item.time}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / System Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <ActionButton color="blue" label="Add User" />
            <ActionButton color="green" label="Upload File" />
            <ActionButton color="purple" label="System Log" />
            <ActionButton color="orange" label="Settings" />
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">
              System Health
            </h4>
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-700">
                Database: Operational
              </span>
            </div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-700">
                API Gateway: Operational
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 rounded-full bg-yellow-500 animate-pulse"></div>
              <span className="text-sm text-gray-700">
                Backup Service: Syncing...
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub Components for cleanliness ---

const StatCard = ({ stat }) => {
  const iconMap = {
    users: (
      <svg
        className="h-6 w-6 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    files: (
      <svg
        className="h-6 w-6 text-indigo-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    server: (
      <svg
        className="h-6 w-6 text-purple-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
        />
      </svg>
    ),
    activity: (
      <svg
        className="h-6 w-6 text-orange-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      </svg>
    ),
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 rounded-full ${
            stat.icon === "users"
              ? "bg-blue-100"
              : stat.icon === "files"
              ? "bg-indigo-100"
              : stat.icon === "server"
              ? "bg-purple-100"
              : "bg-orange-100"
          }`}
        >
          {iconMap[stat.icon]}
        </div>
        <span
          className={`text-sm font-medium ${
            stat.isPositive ? "text-green-600" : "text-red-600"
          } flex items-center`}
        >
          {stat.isPositive ? "↑" : "↓"} {stat.change}
        </span>
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
        <h4 className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</h4>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${
        styles[status] || styles.info
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const ActionButton = ({ color, label }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    green: "bg-green-50 text-green-600 hover:bg-green-100",
    purple: "bg-purple-50 text-purple-600 hover:bg-purple-100",
    orange: "bg-orange-50 text-orange-600 hover:bg-orange-100",
  };
  return (
    <button
      className={`${colors[color]} py-4 rounded-xl font-medium transition-colors flex flex-col items-center justify-center gap-2`}
    >
      <div className="h-2 w-2 rounded-full bg-current opacity-50"></div>
      {label}
    </button>
  );
};

const DownloadIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);

export default Dashboard;
