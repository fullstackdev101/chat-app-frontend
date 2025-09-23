// app/chat/page.tsx
"use client";

import { useState } from "react";
import {
  Users,
  UserPlus,
  MessageSquare,
  Users2,
  LogOut,
  Send,
} from "lucide-react";

export default function ChatDashboard() {
  const [selectedChat, setSelectedChat] = useState<"user" | "group" | null>(
    null
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/80 border-r border-blue-800/40 p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
          ChatSphere
        </h2>

        {/* Users */}
        <div>
          <h3 className="text-sm text-slate-400 uppercase mb-2">Users</h3>
          <ul className="space-y-2">
            <li
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800 cursor-pointer"
              onClick={() => setSelectedChat("user")}
            >
              <span>John Doe</span>
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
            </li>
            <li className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800 cursor-pointer">
              <span>Jane Smith</span>
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
            </li>
          </ul>
          <button className="mt-3 flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300">
            <UserPlus className="h-4 w-4" /> Add User
          </button>
        </div>

        {/* Groups */}
        <div className="mt-6">
          <h3 className="text-sm text-slate-400 uppercase mb-2">Groups</h3>
          <ul className="space-y-2">
            <li
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800 cursor-pointer"
              onClick={() => setSelectedChat("group")}
            >
              <span>Team Alpha</span>
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
            </li>
            <li className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800 cursor-pointer">
              <span>Project X</span>
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
            </li>
          </ul>
          <button className="mt-3 flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300">
            <Users2 className="h-4 w-4" /> Add Group
          </button>
        </div>

        {/* Spacer + Logout */}
        <div className="mt-auto">
          <button className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Chat Area */}
      <main className="flex flex-col flex-1">
        {/* Chat Header */}
        <header className="flex items-center justify-between p-4 border-b border-blue-800/40 bg-slate-900/60 backdrop-blur-xl">
          <h2 className="font-semibold">
            {selectedChat === "user"
              ? "Chat with John Doe"
              : selectedChat === "group"
              ? "Group: Team Alpha"
              : "Select a chat"}
          </h2>
          <button className="text-sky-400 hover:text-sky-300">
            <MessageSquare className="h-5 w-5" />
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {selectedChat ? (
            <>
              <div className="flex justify-start">
                <div className="bg-slate-800 rounded-lg px-4 py-2 max-w-xs">
                  Hey! How are you?
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg px-4 py-2 max-w-xs">
                  I’m good! Working on the new chat app.
                </div>
              </div>
            </>
          ) : (
            <p className="text-slate-400 text-center mt-20">
              Select a user or group to start chatting.
            </p>
          )}
        </div>

        {/* Input */}
        {selectedChat && (
          <footer className="p-4 border-t border-blue-800/40 bg-slate-900/60 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              <button className="p-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transition">
                <Send className="h-5 w-5 text-white" />
              </button>
            </div>
          </footer>
        )}
      </main>

      {/* Right Info Panel */}
      <aside className="w-64 bg-slate-900/80 border-l border-blue-800/40 p-4">
        <h3 className="text-sm text-slate-400 uppercase mb-3">Details</h3>
        {selectedChat === "user" && (
          <div>
            <p className="font-semibold">John Doe</p>
            <p className="text-slate-400 text-sm">Status: Active</p>
          </div>
        )}
        {selectedChat === "group" && (
          <div>
            <p className="font-semibold">Team Alpha</p>
            <p className="text-slate-400 text-sm">5 members online</p>
          </div>
        )}
        {!selectedChat && (
          <p className="text-slate-500 text-sm">No chat selected</p>
        )}
      </aside>
    </div>
  );
}
