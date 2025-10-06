// app/messages-tracker/page.tsx
"use client";

import { useState } from "react";
import { FileText, Check, CheckCheck } from "lucide-react";

interface Message {
  id: number;
  sender: string;
  receiver?: string;
  group?: string;
  text?: string;
  file_url?: string;
  file_name?: string;
  is_read: boolean;
  created_at: string;
  status: "approved" | "inactive" | "deleted";
  type: "direct" | "group";
}

export default function MessagesTrackerPage() {
  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(1);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "John Doe",
      receiver: "Sarah Connor",
      text: "Hey Sarah, did you get the report?",
      created_at: "2025-09-13 14:30",
      is_read: true,
      status: "approved",
      type: "direct",
    },
    {
      id: 2,
      sender: "Sarah Connor",
      receiver: "John Doe",
      text: "Yes, reviewing it now. Looks solid!",
      created_at: "2025-09-13 14:32",
      is_read: true,
      status: "approved",
      type: "direct",
    },
    {
      id: 3,
      sender: "John Doe",
      receiver: "Sarah Connor",
      file_url: "/files/financials.xlsx",
      file_name: "Q3_Financials.xlsx",
      created_at: "2025-09-13 14:35",
      is_read: false,
      status: "inactive",
      type: "direct",
    },
    {
      id: 4,
      sender: "Alice",
      group: "Dev Team",
      text: "Reminder: Code freeze starts tomorrow.",
      created_at: "2025-09-13 15:00",
      is_read: true,
      status: "approved",
      type: "group",
    },
    {
      id: 5,
      sender: "Michael",
      group: "Dev Team",
      text: "Got it. I’ll push final changes tonight.",
      created_at: "2025-09-13 15:05",
      is_read: true,
      status: "deleted",
      type: "group",
    },
  ]);

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const updateStatus = (
    id: number,
    newStatus: "approved" | "inactive" | "deleted"
  ) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
    );
    setOpenMenuId(null);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <div className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-semibold">
          Conversations
        </div>
        <div
          onClick={() => setSelectedConversation(1)}
          className={`px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 transition ${
            selectedConversation === 1
              ? "bg-blue-600 text-white"
              : "text-gray-700 dark:text-gray-200"
          }`}
        >
          John Doe ↔ Sarah Connor
        </div>
        <div
          onClick={() => setSelectedConversation(2)}
          className={`px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 transition ${
            selectedConversation === 2
              ? "bg-blue-600 text-white"
              : "text-gray-700 dark:text-gray-200"
          }`}
        >
          Dev Team (Group)
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow">
          <h2 className="font-semibold text-lg">
            {selectedConversation === 1 ? "John ↔ Sarah" : "Dev Team"}
          </h2>
          <p className="text-xs text-gray-500">
            {selectedConversation === 1
              ? "Direct conversation"
              : "Group conversation"}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 relative">
          {messages
            .filter((msg) =>
              selectedConversation === 1
                ? msg.type === "direct"
                : msg.type === "group"
            )
            .map((msg) => (
              <div
                key={msg.id}
                className={`relative max-w-lg p-4 rounded-2xl shadow-sm cursor-pointer group ${
                  msg.type === "direct"
                    ? msg.sender === "John Doe"
                      ? "ml-auto bg-blue-600 text-white"
                      : "mr-auto bg-gray-200 dark:bg-gray-700"
                    : "mr-auto bg-gray-100 dark:bg-gray-700"
                }`}
                onClick={() =>
                  setOpenMenuId(openMenuId === msg.id ? null : msg.id)
                }
              >
                {/* Sender */}
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold">{msg.sender}</span>
                  <span className="text-gray-400">{msg.created_at}</span>
                </div>

                {/* Content */}
                {msg.text && <p className="text-sm">{msg.text}</p>}

                {msg.file_url && (
                  <div className="mt-2 flex items-center gap-2 text-sm underline cursor-pointer">
                    <FileText className="w-4 h-4" />
                    <a href={msg.file_url} target="_blank">
                      {msg.file_name}
                    </a>
                  </div>
                )}

                {/* Footer */}
                <div className="flex justify-between items-center mt-2 text-xs">
                  <div>
                    {msg.is_read ? (
                      <span className="flex items-center text-green-400 gap-1">
                        <CheckCheck className="w-3 h-3" /> Read
                      </span>
                    ) : (
                      <span className="flex items-center text-gray-400 gap-1">
                        <Check className="w-3 h-3" /> Unread
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full ${
                      msg.status === "approved"
                        ? "bg-green-500 text-white"
                        : msg.status === "inactive"
                        ? "bg-yellow-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {msg.status}
                  </span>
                </div>

                {/* Status Dropdown */}
                {openMenuId === msg.id && (
                  <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div
                      onClick={() => updateStatus(msg.id, "approved")}
                      className="px-4 py-2 hover:bg-green-100 dark:hover:bg-green-900 cursor-pointer"
                    >
                      Approve
                    </div>
                    <div
                      onClick={() => updateStatus(msg.id, "inactive")}
                      className="px-4 py-2 hover:bg-yellow-100 dark:hover:bg-yellow-900 cursor-pointer"
                    >
                      Mark Inactive
                    </div>
                    <div
                      onClick={() => updateStatus(msg.id, "deleted")}
                      className="px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900 cursor-pointer"
                    >
                      Delete
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
