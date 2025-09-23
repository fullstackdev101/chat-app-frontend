"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Users,
  UserPlus,
  Settings,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

const menuItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  // { name: "Groups", href: "/admin/groups", icon: UserPlus },
  { name: "IP Restrictions", href: "/admin/ip-restrictions", icon: Shield },
  // { name: "Messages Tracker", href: "/admin/messages-tracker", icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Clear localStorage / cookies if needed
    // localStorage.removeItem("token");

    // Redirect to login
    router.push("/login");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-blue-950 via-slate-900 to-blue-900 text-white shadow-lg flex flex-col">
        {/* Logo */}
        <div className="p-6 text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500">
          Admin Panel
        </div>

        {/* Menu */}
        <nav className="mt-6 space-y-2 flex-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
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
        {children}
      </main>
    </div>
  );
}
