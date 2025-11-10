"use client";
import React, { useEffect, useRef } from "react";
import { Group, Message } from "../types";
import { User } from "../../types/user";
import { Paperclip } from "lucide-react";
import Image from "next/image";

interface ChatPanelProps {
  currentUser: User;
  selectedUser: User | null;
  selectedGroup: Group | null;
  messages: Message[];
  users: User[];
  newMessage: string;
  onSend: (e: React.FormEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMessageChange: (msg: string) => void;
  selectedFile?: File | null;
  onClearFile?: () => void; // ✅ new prop for parent to clear file
}

export default function ChatPanel({
  currentUser,
  selectedUser,
  selectedGroup,
  messages,
  users,
  newMessage,
  onSend,
  onFileChange,
  onMessageChange,
  selectedFile,
  onClearFile,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Keep send pure — don’t clear anything before sending
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend(e);
  };

  // ✅ Properly clear file input and notify parent
  const handleClearFile = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onClearFile) onClearFile(); // parent clears its selectedFile state
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
                {/* Show image preview if text is empty and file_url exists */}
                {!msg.text &&
                  msg.file_url &&
                  msg.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                    <a
                      href={msg.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-1"
                    >
                      <div className="relative w-32 h-32">
                        <Image
                          src={msg.file_url}
                          alt="attachment"
                          fill
                          className="object-cover rounded-lg border hover:opacity-90 transition"
                        />
                      </div>
                    </a>
                  )}

                {/* Always show file link if file_url exists */}
                {msg.file_url && (
                  <a
                    href={msg.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline break-all mt-1 block"
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

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="p-4 flex items-center space-x-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
      >
        {/* File Upload */}
        <button
          type="button"
          onClick={() => {
            if (selectedUser || selectedGroup) {
              fileInputRef.current?.click();
            }
          }}
          className={`text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ${
            !selectedUser && !selectedGroup
              ? "pointer-events-none opacity-50"
              : ""
          }`}
        >
          <Paperclip size={22} />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          id="file-upload"
          onChange={onFileChange}
        />

        {/* Input + Clear */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder={
              selectedFile ? `📎 ${selectedFile.name}` : "Type a message..."
            }
            className={`w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 pr-8 ${
              !selectedUser && !selectedGroup
                ? "bg-gray-400 cursor-not-allowed"
                : ""
            }`}
            disabled={(!selectedUser && !selectedGroup) || !!selectedFile}
            value={selectedFile ? `📎 ${selectedFile.name}` : newMessage}
            onChange={(e) => onMessageChange(e.target.value)}
          />

          {selectedFile && (
            <button
              type="button"
              onClick={handleClearFile}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500"
            >
              ✕
            </button>
          )}
        </div>

        {/* Send */}
        <button
          type="submit"
          disabled={!selectedUser && !selectedGroup}
          className={`px-3 py-2 rounded text-white ${
            !selectedUser && !selectedGroup
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          Send
        </button>
      </form>
    </div>
  );
}
