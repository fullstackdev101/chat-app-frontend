"use client";

import { useEffect, useState } from "react";
import { getConversations } from "@/services/messagesService"; // ✅ import API service
import axios from "axios";

interface Message {
  id: number;
  sender: string;
  text: string;
  timestamp: string;
}

interface Conversation {
  id: number;
  type: "direct" | "group";
  title: string;
  participants: string[];
  messages: Message[];
}

export default function MessagesTrackerPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch data from external JSON (simulate API)
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        // const res = await axios.get("/api/conversations.json");
        // console.log(res);
        const res1 = await getConversations();
        // console.log(res1.data);
        // getConversationsData
        //   // const data = res.data.conversations;
        const data = res1;
        // console.log(res1);
        // console.log(data);

        // Sort: direct first, group second
        const sorted = [
          ...data.filter((c: Conversation) => c.type === "direct"),
          ...data.filter((c: Conversation) => c.type === "group"),
        ];

        setConversations(sorted);
        setSelectedConversation(sorted[0]);
      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading conversations...
      </div>
    );
  }

  if (!selectedConversation) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        No conversation found.
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-gray-300 flex flex-col">
        <div className="p-4 border-b font-bold text-lg">📊 Message Tracker</div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 text-xs text-gray-500 uppercase">
            Direct Chats
          </div>
          {conversations
            .filter((c) => c.type === "direct")
            .map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedConversation(chat)}
                className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${
                  selectedConversation.id === chat.id ? "bg-blue-200" : ""
                }`}
              >
                💬 {chat.title}
              </div>
            ))}

          <div className="p-2 text-xs text-gray-500 uppercase mt-3">
            Group Chats
          </div>
          {conversations
            .filter((c) => c.type === "group")
            .map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedConversation(chat)}
                className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${
                  selectedConversation.id === chat.id ? "bg-blue-200" : ""
                }`}
              >
                👥 {chat.title}
              </div>
            ))}
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-white">
          <h2 className="text-xl font-semibold">
            {selectedConversation.title}
          </h2>
          <p className="text-sm text-gray-500">
            Participants: {selectedConversation.participants.join(", ")}
          </p>
        </div>

        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
          {selectedConversation.messages.map((msg) => (
            <div key={msg.id} className="flex flex-col">
              <div className="text-sm font-semibold text-gray-700">
                {msg.sender}
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-800">{msg.text}</p>
                <span className="text-xs text-gray-400 mt-1 block">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
