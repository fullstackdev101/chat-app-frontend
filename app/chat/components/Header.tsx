"use client";
import { LogOut, Home } from "lucide-react";

import { User } from "../../types/user";

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  goHome: () => void;
}

export default function Header({ currentUser, onLogout, goHome }: HeaderProps) {
  return (
    <div className="p-4 flex items-center justify-between border-b bg-blue-600 dark:bg-blue-800 text-white shadow-md rounded-tr-2xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
          {currentUser.name.charAt(0)}
        </div>
        <span className="truncate font-semibold">{currentUser.name}</span>
      </div>
      <button
        onClick={goHome}
        className="p-2 rounded-lg hover:bg-white/20 transition"
        title="Go to Home"
      >
        <Home className="w-5 h-5" />
      </button>
      <button
        onClick={onLogout}
        className="p-2 rounded-lg hover:bg-white/20 transition"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
}
