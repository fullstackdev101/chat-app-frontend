// components/admin/Sidebar.tsx
"use client";

import { Users, MessageSquare, Shield, UserCheck } from "lucide-react";

export default function Sidebar({
  current,
  setCurrent,
}: {
  current: string;
  setCurrent: (s: string) => void;
}) {
  const items = [
    { id: "users", label: "Users", icon: <Users className="h-5 w-5" /> },
    {
      id: "groups",
      label: "Chat Groups",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      id: "connection-requests",
      label: "Connection Requests",
      icon: <UserCheck className="h-5 w-5" />,
    },
    { id: "ip", label: "IP Control", icon: <Shield className="h-5 w-5" /> },
  ];

  return (
    <aside className="w-64 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-screen p-4">
      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">
        Admin Panel
      </h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => setCurrent(item.id)}
              className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg transition ${current === item.id
                  ? "bg-blue-500 text-white"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
            >
              {item.icon}
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
