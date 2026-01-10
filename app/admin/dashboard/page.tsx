"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { getDashboardStats } from "../../../services/dashboardService";
import { LucideIcon } from "lucide-react";

import {
  Users,
  BarChart3,
  MessageCircle,
  Shield,
  Moon,
  Sun,
  CheckCircle,
  XCircle,
  LogIn,
  PlusCircle,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// Dummy data
const messageData = [
  { day: "Mon", messages: 420 },
  { day: "Tue", messages: 380 },
  { day: "Wed", messages: 510 },
  { day: "Thu", messages: 460 },
  { day: "Fri", messages: 580 },
  { day: "Sat", messages: 390 },
  { day: "Sun", messages: 610 },
];

const groupData = [
  { name: "Jan", groups: 50 },
  { name: "Feb", groups: 65 },
  { name: "Mar", groups: 80 },
  { name: "Apr", groups: 70 },
  { name: "May", groups: 95 },
  { name: "Jun", groups: 85 },
];

const activities = [
  {
    id: 1,
    user: "Faisal Qureshi",
    action: "approved a message",
    time: "2m ago",
    icon: CheckCircle,
    color: "text-green-500",
  },
  {
    id: 2,
    user: "Sara Malik",
    action: "deleted a group",
    time: "10m ago",
    icon: XCircle,
    color: "text-red-500",
  },
  {
    id: 3,
    user: "Ahmed Raza",
    action: "created a new group",
    time: "30m ago",
    icon: PlusCircle,
    color: "text-blue-500",
  },
  {
    id: 4,
    user: "Ali Khan",
    action: "logged in",
    time: "1h ago",
    icon: LogIn,
    color: "text-emerald-500",
  },
];

// Theme Toggle Button
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow transition"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5 text-yellow-400" />
      )}
    </button>
  );
}
interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon; // 👈 type for lucide-react icons
  gradient: string;
}
// Stat Card
function StatCard({ title, value, icon: Icon, gradient }: StatCardProps) {
  return (
    <div
      className={`rounded-2xl p-6 shadow-lg flex items-center justify-between text-white bg-gradient-to-r ${gradient} transition`}
    >
      <div>
        <p className="text-sm opacity-80">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
      <Icon className="h-8 w-8 opacity-80" />
    </div>
  );
}

interface DashboardData {
  totalActiveGroups: string;
  totalBlockedIps: string;
  totalMessageForTheDay: string;
  totalUsers: string;
  activeActivities: [];
}

// Dashboard Page
export default function Dashboard() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // const [stats, setStats] = useState({});

  const [data, setData] = useState<DashboardData | null>(null); // data can either be of type DashboardData or null

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const dashboardData = await getDashboardStats(); // Await the Promise resolution
        setData(dashboardData); // Set the resolved data to state
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData(); // Call the async function
  }, []);

  // Handle the case when data is null
  if (!data) return <p>Loading...</p>;

  // Destructure the properties from data
  const {
    totalActiveGroups,
    totalBlockedIps,
    totalMessageForTheDay,
    totalUsers,
    activeActivities,
  } = data;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 transition-colors">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Admin Dashboard
        </h1>
        <ThemeToggle />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          gradient="from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500"
        />
        <StatCard
          title="Active Groups"
          value={totalActiveGroups}
          icon={BarChart3}
          gradient="from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-500"
        />
        <StatCard
          title="Messages Today"
          value={totalMessageForTheDay}
          icon={MessageCircle}
          gradient="from-blue-500 to-cyan-600 dark:from-blue-400 dark:to-cyan-500"
        />
        <StatCard
          title="Blocked IPs"
          value={totalBlockedIps}
          icon={Shield}
          gradient="from-rose-500 to-red-600 dark:from-rose-400 dark:to-red-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Line Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Messages This Week
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={messageData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "#374151" : "#e5e7eb"}
              />
              <XAxis dataKey="day" stroke={isDark ? "#9ca3af" : "#374151"} />
              <YAxis stroke={isDark ? "#9ca3af" : "#374151"} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#1f2937" : "#fff",
                  borderColor: isDark ? "#374151" : "#e5e7eb",
                  color: isDark ? "#f9fafb" : "#111827",
                }}
              />
              <Line
                type="monotone"
                dataKey="messages"
                stroke={isDark ? "#60a5fa" : "#2563eb"}
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Active Groups Per Month
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={groupData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "#374151" : "#e5e7eb"}
              />
              <XAxis dataKey="name" stroke={isDark ? "#9ca3af" : "#374151"} />
              <YAxis stroke={isDark ? "#9ca3af" : "#374151"} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#1f2937" : "#fff",
                  borderColor: isDark ? "#374151" : "#e5e7eb",
                  color: isDark ? "#f9fafb" : "#111827",
                }}
              />
              <Bar
                dataKey="groups"
                fill={isDark ? "#34d399" : "#10b981"}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Recent Activity
        </h2>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {activities.map((activity) => (
            <li
              key={activity.id}
              className="flex items-center justify-between py-3"
            >
              <div className="flex items-center space-x-3">
                <activity.icon className={`h-5 w-5 ${activity.color}`} />
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>{activity.user}</strong> {activity.action}
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {activity.time}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
