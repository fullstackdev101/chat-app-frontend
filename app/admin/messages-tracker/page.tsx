"use client";

import { useEffect, useState } from "react";
import {
  getConversations,
  getConversationMessages,
} from "@/services/messagesService";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { FEATURES } from "@/lib/featureFlags";

interface Message {
  id: number;
  sender: string;
  text: string;
  file_url?: string;
  timestamp: string;
}

interface Conversation {
  id: string | number;
  type: "direct" | "group";
  title: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  messageCount?: number;
  messages?: Message[];
  from_user?: number;
  to_user?: number;
  group_id?: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function MessagesTrackerPage() {
  // Separate states for direct and group conversations
  const [directConversations, setDirectConversations] = useState<Conversation[]>([]);
  const [groupConversations, setGroupConversations] = useState<Conversation[]>([]);

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Separate pagination for direct and group
  const [directPage, setDirectPage] = useState(1);
  const [directPagination, setDirectPagination] = useState<PaginationInfo | null>(null);
  const [groupPage, setGroupPage] = useState(1);
  const [groupPagination, setGroupPagination] = useState<PaginationInfo | null>(null);

  const [messagePage, setMessagePage] = useState(1);
  const [messagePagination, setMessagePagination] = useState<PaginationInfo | null>(null);

  const [activeTab, setActiveTab] = useState<"direct" | "group">("direct");
  const showPagination = FEATURES.PAGINATION_ENABLED;

  // Fetch direct conversations
  useEffect(() => {
    const fetchDirectConversations = async () => {
      try {
        setLoading(true);
        const data = await getConversations(directPage, 5, "direct");

        if (showPagination) {
          setDirectConversations(data.conversations);
          setDirectPagination(data.pagination);
        } else {
          const allData = await getConversations();
          const directOnly = allData.conversations.filter((c: Conversation) => c.type === "direct");
          setDirectConversations(directOnly);
          setDirectPagination(null);
        }
      } catch (err) {
        console.error("Error fetching direct conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDirectConversations();
  }, [directPage, showPagination]);

  // Fetch group conversations
  useEffect(() => {
    const fetchGroupConversations = async () => {
      try {
        const data = await getConversations(groupPage, 5, "group");

        if (showPagination) {
          setGroupConversations(data.conversations);
          setGroupPagination(data.pagination);
        } else {
          const allData = await getConversations();
          const groupOnly = allData.conversations.filter((c: Conversation) => c.type === "group");
          setGroupConversations(groupOnly);
          setGroupPagination(null);
        }
      } catch (err) {
        console.error("Error fetching group conversations:", err);
      }
    };
    fetchGroupConversations();
  }, [groupPage, showPagination]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        setMessagesLoading(true);

        if (showPagination) {
          const conversationId = selectedConversation.id
            .toString()
            .replace(/^(direct|group)-/, "");

          const data = await getConversationMessages(
            selectedConversation.type,
            conversationId,
            messagePage,
            50
          );

          setMessages(data.messages);
          setMessagePagination(data.pagination);
        } else {
          setMessages(selectedConversation.messages || []);
          setMessagePagination(null);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchMessages();
  }, [selectedConversation, messagePage, showPagination]);

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    setMessagePage(1);
  };

  const handleDeleteConversation = async (conv: Conversation) => {
    if (!confirm(`Are you sure you want to delete this ${conv.type === "direct" ? "conversation" : "group"}? This action cannot be undone.`)) {
      return;
    }

    try {
      if (conv.type === "direct") {
        // Extract user IDs from conversation ID (format: "direct-11-6")
        const ids = conv.id.toString().replace("direct-", "").split("-");
        const fromUser = parseInt(ids[0], 10);
        const toUser = parseInt(ids[1], 10);

        const { deleteDirectConversation } = await import("@/services/messagesService");
        await deleteDirectConversation(fromUser, toUser);
      } else {
        // Extract group ID from conversation ID (format: "group-5")
        const groupId = parseInt(conv.id.toString().replace("group-", ""), 10);

        const { deleteGroup } = await import("@/services/messagesService");
        await deleteGroup(groupId);
      }

      // Remove from local state
      if (conv.type === "direct") {
        setDirectConversations(prev => prev.filter(c => c.id !== conv.id));
      } else {
        setGroupConversations(prev => prev.filter(c => c.id !== conv.id));
      }

      // Clear selection if deleted conversation was selected
      if (selectedConversation?.id === conv.id) {
        setSelectedConversation(null);
      }

      alert(`${conv.type === "direct" ? "Conversation" : "Group"} deleted successfully!`);
    } catch (err: unknown) {
      console.error("Error deleting conversation:", err);
      const errorMessage = err instanceof Error ? err.message : (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Unknown error";
      alert(`Failed to delete ${conv.type === "direct" ? "conversation" : "group"}: ${errorMessage}`);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm("Are you sure you want to delete this message? This action cannot be undone.")) {
      return;
    }

    try {
      const { deleteMessage } = await import("@/services/messagesService");
      await deleteMessage(messageId);

      // Remove from local state
      setMessages(prev => prev.filter(m => m.id !== messageId));

      alert("Message deleted successfully!");
    } catch (err: unknown) {
      console.error("Error deleting message:", err);
      const errorMessage = err instanceof Error ? err.message : (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Unknown error";
      alert(`Failed to delete message: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 gap-2">
        <Loader2 className="animate-spin" size={20} />
        Loading conversations...
      </div>
    );
  }

  const currentConversations = activeTab === "direct" ? directConversations : groupConversations;
  const currentPagination = activeTab === "direct" ? directPagination : groupPagination;
  const currentPage = activeTab === "direct" ? directPage : groupPage;
  const setCurrentPage = activeTab === "direct" ? setDirectPage : setGroupPage;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
        <div className="p-4 border-b">
          <div className="font-bold text-lg flex items-center justify-between mb-3">
            <span>📊 Message Tracker</span>
            {showPagination && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                Paginated
              </span>
            )}
          </div>

          {/* Total Counts */}
          <div className="text-xs text-gray-600 mb-3 flex justify-between">
            <span>Total Messages: {directPagination?.total || directConversations.length}</span>
            <span>Total Groups: {groupPagination?.total || groupConversations.length}</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("direct")}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === "direct"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              💬 Direct ({directConversations.length})
            </button>
            <button
              onClick={() => setActiveTab("group")}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === "group"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              👥 Groups ({groupConversations.length})
            </button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {currentConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">
              No {activeTab} conversations found
            </div>
          ) : (
            currentConversations.map((chat) => (
              <div
                key={chat.id}
                className={`px-4 py-3 border-b border-gray-100 transition ${selectedConversation?.id === chat.id ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleSelectConversation(chat)}
                  >
                    <div className="font-medium text-sm flex items-center gap-2">
                      {chat.type === "direct" ? "💬" : "👥"}
                      <span className="truncate">{chat.title}</span>
                    </div>
                    {showPagination && chat.lastMessage && (
                      <div className="text-xs text-gray-500 truncate mt-1">
                        {chat.lastMessage}
                      </div>
                    )}
                    {showPagination && chat.messageCount !== undefined && (
                      <div className="text-xs text-gray-400 mt-1">
                        {chat.messageCount} messages
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(chat);
                    }}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                    title={`Delete ${chat.type === "direct" ? "conversation" : "group"}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {showPagination && currentPagination && currentPagination.totalPages > 1 && (
          <div className="p-3 border-t bg-gray-50 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-gray-600">
              Page {currentPage} of {currentPagination.totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(currentPagination.totalPages, p + 1))
              }
              disabled={currentPage === currentPagination.totalPages}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b bg-white">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                {selectedConversation.type === "direct" ? "💬" : "👥"}
                {selectedConversation.title}
              </h2>
              <p className="text-sm text-gray-500">
                Participants: {selectedConversation.participants.join(", ")}
              </p>
              {showPagination && messagePagination && (
                <p className="text-xs text-gray-400 mt-1">
                  Showing {messages.length} of {messagePagination.total} messages
                </p>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
              {messagesLoading ? (
                <div className="text-center text-gray-500 flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No messages in this conversation
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="flex flex-col group">
                    <div className="text-sm font-semibold text-gray-700 flex items-center justify-between">
                      <span>{msg.sender}</span>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete message"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                      {msg.text ? (
                        <p className="text-gray-800">{msg.text}</p>
                      ) : msg.file_url ? (
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
                      ) : null}
                      <span className="text-xs text-gray-400 mt-1 block">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Pagination */}
            {showPagination && messagePagination && messagePagination.totalPages > 1 && (
              <div className="p-4 border-t bg-white flex items-center justify-center gap-2">
                <button
                  onClick={() => setMessagePage((p) => Math.max(1, p - 1))}
                  disabled={messagePage === 1}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {messagePage} of {messagePagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    setMessagePage((p) => Math.min(messagePagination.totalPages, p + 1))
                  }
                  disabled={messagePage === messagePagination.totalPages}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">💬</div>
              <p>Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
