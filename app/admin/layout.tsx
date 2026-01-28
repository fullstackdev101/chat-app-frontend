"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield,
  Users,
  // UserPlus,
  Settings,
  LayoutDashboard,
  LogOut,
  Home,
  UserCheck,
} from "lucide-react";
import { ReactNode } from "react";
import { useAuthStore } from "../store/authStore";

// const menuItems = [
//   { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
//   { name: "Users", href: "/admin/users", icon: Users },
//   { name: "IP Restrictions", href: "/admin/ip-restrictions", icon: Shield },
// ];

const menuItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  // { name: "Groups", href: "/admin/groups", icon: UserPlus },
  { name: "IP Restrictions", href: "/admin/ip-restrictions", icon: Shield },
  { name: "Connection Requests", href: "/admin/connection-requests", icon: UserCheck },
  { name: "Messages Tracker", href: "/admin/messages-tracker", icon: Settings },
  // {
  //   name: "Messages Tracking",
  //   href: "/admin/messages-tracking",
  //   icon: Settings,
  // },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const filteredMenuItems =
    user?.role_id !== 1
      ? menuItems.filter(
        (item) => item.name === "Dashboard" || item.name === "Users"
      )
      : menuItems;

  const handleLogout = () => {
    logout(); // This calls authStore.logout() which clears all session data
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-blue-950 via-slate-900 to-blue-900 text-white shadow-lg flex flex-col">
        {/* Logo */}
        <div className="p-6 text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500">
          Admin Panel
        </div>

        {/* Logged-in User */}
        <div className="px-6 pb-4 text-sm text-white/70 border-b border-white/10">
          <span className="block font-medium text-white">
            {user?.name + " ( " + user?.role_name + ")"}
          </span>
          {/* <span className="block truncate">{user?.name}</span> */}
        </div>

        {/* Welcome Page (Primary Gateway Button) */}
        <div className="px-4 pt-4 pb-3 border-b border-white/10">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-full 
                       bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 
                       text-white font-semibold shadow-md hover:shadow-lg 
                       hover:from-sky-500 hover:to-indigo-600 transition-all"
          >
            <Home className="h-5 w-5" />
            Welcome Page
          </Link>
        </div>

        {/* Main Menu */}
        <nav className="mt-4 space-y-2 flex-1">
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? "bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 text-white shadow-md"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout at bottom */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-50/5 backdrop-blur-sm overflow-y-auto">
        {/* Top Navbar inside content */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Admin Section
          </h2>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg 
                       bg-gray-200 text-gray-800 text-sm font-medium 
                       hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 
                       transition"
          >
            <Home className="h-4 w-4" />
            Back to Welcome Page
          </Link>
        </div>

        {children}
      </main>
    </div>
  );
}
