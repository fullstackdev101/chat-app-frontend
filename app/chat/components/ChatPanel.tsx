"use client";
import React, { useEffect, useRef } from "react";
import { User, Group, Message } from "../types";
import { Paperclip } from "lucide-react"; // modern clip icon

interface ChatPanelProps {
  currentUser: User;
  selectedUser: User | null;
  selectedGroup: Group | null;
  messages: Message[];
  users: User[];
  newMessage: string;
  onSendDirect: (e: React.FormEvent) => void;
  onSendGroup: (e: React.FormEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAttachClick: () => void;
  onMessageChange: (msg: string) => void;
}

export default function ChatPanel({
  currentUser,
  selectedUser,
  selectedGroup,
  messages,
  users,
  newMessage,
  onSendDirect,
  onSendGroup,
  onFileChange,
  onAttachClick,
  onMessageChange,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    if (selectedGroup) onSendGroup(e);
    else if (selectedUser) onSendDirect(e);
  };

  const getUserName = (userId: number) => {
    if (userId === currentUser.id) return "You";
    const user = users.find((u) => u.id === userId);
    return user ? user.name : "Unknown";
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium">
          {selectedGroup
            ? selectedGroup.name
            : selectedUser
            ? selectedUser.name
            : "Select chat"}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 dark:bg-gray-900">
        {messages.map((msg, idx) => {
          // Unique key: use DB id if available, else fallback to index
          const key =
            msg.id ?? `${msg.from_user}-${msg.to_user ?? msg.group_id}-${idx}`;
          const isSender = msg.from_user === currentUser.id;

          return (
            <div
              key={key}
              className={`flex ${isSender ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs p-2 rounded-lg ${
                  isSender
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                }`}
              >
                {msg.text && <p>{msg.text}</p>}
                {msg.file_url && (
                  <a
                    href={msg.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline break-all"
                  >
                    {msg.file_name || "Download file"}
                  </a>
                )}
                <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                  {getUserName(msg.from_user)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 flex items-center space-x-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
      >
        {/* Hidden file input + clickable icon */}
        <label
          htmlFor="file-upload"
          className="cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <Paperclip size={22} />
        </label>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={onFileChange}
        />
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          value={newMessage}
          onChange={(e) => onMessageChange(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </form>
    </div>
  );
}
