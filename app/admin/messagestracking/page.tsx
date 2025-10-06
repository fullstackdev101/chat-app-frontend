// app/admin/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Sun,
  Moon,
  Search,
  Check,
  X,
  MessageSquare,
  FileText,
} from "lucide-react";

type UserType = {
  id: number;
  name: string;
  role?: string;
  status?: "active" | "inactive";
};
type GroupType = { id: number; name: string; status?: "active" | "inactive" };

type MessageType = {
  id: number;
  fromId: number;
  fromName: string;
  toId?: number;
  toName?: string;
  groupId?: number;
  groupName?: string;
  content: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
};

const DUMMY_USERS: UserType[] = [
  { id: 1, name: "Faisal" },
  { id: 2, name: "Sarah" },
  { id: 3, name: "Ali" },
  { id: 4, name: "John" },
  { id: 5, name: "Maya" },
  { id: 6, name: "Zain" },
];

const DUMMY_GROUPS: GroupType[] = [
  { id: 1, name: "Developers" },
  { id: 2, name: "Design Team" },
  { id: 3, name: "Support" },
];

const SAMPLE_TEXTS = [
  "Hey — are we shipping the changes today?",
  "I'll push a fix to staging in 10 mins.",
  "Can someone review my PR?",
  "That sounds good to me. 👍",
  "This needs more tests before merging.",
  "Any update on the server issue?",
  "Please share the latest build link.",
  "Customer reported a UI glitch on mobile.",
  "Let’s have a sync at 3pm.",
  "I'll take care of that task.",
  "Reminder: stand-up tomorrow 10AM.",
  "Thanks! Works great on my side.",
  "I think this is a duplicate of ticket #234.",
  "We should escalate this to infra.",
  "Who is on call today?",
  "Please do not share credentials in chat.",
  "Nice work — looks polished!",
  "I will be OOO next week.",
  "This message may need rephrasing before publishing.",
  "Check the analytics dashboard for numbers.",
];

function generateMessages(count = 60): MessageType[] {
  const messages: MessageType[] = [];
  const now = Date.now();
  for (let i = 1; i <= count; i++) {
    const from = DUMMY_USERS[i % DUMMY_USERS.length];
    const isGroup = i % 4 === 0; // every 4th message is a group message
    const toUser = DUMMY_USERS[(i * 3) % DUMMY_USERS.length];
    const sample = SAMPLE_TEXTS[i % SAMPLE_TEXTS.length];
    const createdAt = new Date(now - i * 60 * 1000).toISOString(); // spread by minute

    let status: MessageType["status"] = "pending";
    if (i % 5 === 0) status = "approved";
    if (i % 11 === 0) status = "rejected";

    if (isGroup) {
      const grp = DUMMY_GROUPS[(i * 7) % DUMMY_GROUPS.length];
      messages.push({
        id: i,
        fromId: from.id,
        fromName: from.name,
        groupId: grp.id,
        groupName: grp.name,
        content: `${sample} (group chat)`,
        createdAt,
        status,
      });
    } else {
      // direct message; ensure from != to
      const to =
        toUser.id === from.id
          ? DUMMY_USERS[(i * 5 + 1) % DUMMY_USERS.length]
          : toUser;
      messages.push({
        id: i,
        fromId: from.id,
        fromName: from.name,
        toId: to.id,
        toName: to.name,
        content: sample,
        createdAt,
        status,
      });
    }
  }
  // newest first
  return messages.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export default function AdminMessagesReview() {
  // theme toggle (local)
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const [messages, setMessages] = useState<MessageType[]>(() =>
    generateMessages(60)
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "direct" | "group">(
    "all"
  );
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(
    messages[0]?.id ?? null
  );
  const [selectedBulk, setSelectedBulk] = useState<Record<number, boolean>>({});
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  // helper: conversation key
  const conversationKey = (m: MessageType) =>
    m.groupId
      ? `group-${m.groupId}`
      : `dm-${Math.min(m.fromId, m.toId ?? 0)}-${Math.max(
          m.fromId,
          m.toId ?? 0
        )}`;

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      if (typeFilter === "direct" && m.groupId) return false;
      if (typeFilter === "group" && !m.groupId) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (
          !m.content.toLowerCase().includes(q) &&
          !m.fromName.toLowerCase().includes(q) &&
          !(m.toName && m.toName.toLowerCase().includes(q)) &&
          !(m.groupName && m.groupName.toLowerCase().includes(q))
        )
          return false;
      }
      return true;
    });
  }, [messages, statusFilter, typeFilter, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selectedMessage = messages.find((m) => m.id === selectedId) ?? null;

  const conversationContext = useMemo(() => {
    if (!selectedMessage) return [];
    const key = conversationKey(selectedMessage);
    // derive conversation by matching conversationKey
    const convo = messages
      .filter((m) => conversationKey(m) === key)
      .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1)); // oldest -> newest
    return convo.slice(Math.max(0, convo.length - 12)); // last 12 messages
  }, [messages, selectedMessage]);

  // actions
  function updateMessageStatus(id: number, status: MessageType["status"]) {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
  }
  function bulkUpdateStatus(ids: number[], status: MessageType["status"]) {
    setMessages((prev) =>
      prev.map((m) => (ids.includes(m.id) ? { ...m, status } : m))
    );
    // clear bulk selections that were processed
    setSelectedBulk((prev) => {
      const next = { ...prev };
      ids.forEach((i) => delete next[i]);
      return next;
    });
  }

  function toggleBulk(id: number) {
    setSelectedBulk((s) => ({ ...s, [id]: !s[id] }));
  }
  function selectAllOnPage() {
    const newState = { ...selectedBulk };
    paginated.forEach((m) => (newState[m.id] = true));
    setSelectedBulk(newState);
  }
  function clearBulkSelections() {
    setSelectedBulk({});
  }

  // stats
  const stats = useMemo(() => {
    const s = { total: messages.length, pending: 0, approved: 0, rejected: 0 };
    messages.forEach((m) => {
      if (m.status === "pending") s.pending++;
      if (m.status === "approved") s.approved++;
      if (m.status === "rejected") s.rejected++;
    });
    return s;
  }, [messages]);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-tr from-sky-500 to-blue-600 text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                Admin Review
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                Messages moderation center
              </p>
            </div>
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:scale-105 transition"
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-yellow-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>

        {/* Stats */}
        <div className="mb-4 space-y-2">
          <div className="text-sm text-slate-500 dark:text-slate-300">
            Total messages
          </div>
          <div className="text-2xl font-semibold text-slate-900 dark:text-white">
            {stats.total}
          </div>

          <div className="flex gap-2 mt-3">
            <div className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
              <div className="text-xs text-slate-400">Pending</div>
              <div className="font-semibold text-yellow-600">
                {stats.pending}
              </div>
            </div>
            <div className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
              <div className="text-xs text-slate-400">Approved</div>
              <div className="font-semibold text-green-600">
                {stats.approved}
              </div>
            </div>
            <div className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
              <div className="text-xs text-slate-400">Rejected</div>
              <div className="font-semibold text-red-600">{stats.rejected}</div>
            </div>
          </div>
        </div>

        {/* Quick filters */}
        <div className="mb-4">
          <div className="text-xs text-slate-400 mb-2">View</div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`text-left px-3 py-2 rounded-lg ${
                statusFilter === "all"
                  ? "bg-sky-50 dark:bg-sky-900 text-sky-600 dark:text-sky-300"
                  : "hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              All Messages
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`text-left px-3 py-2 rounded-lg ${
                statusFilter === "pending"
                  ? "bg-yellow-50 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300"
                  : "hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter("approved")}
              className={`text-left px-3 py-2 rounded-lg ${
                statusFilter === "approved"
                  ? "bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300"
                  : "hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setStatusFilter("rejected")}
              className={`text-left px-3 py-2 rounded-lg ${
                statusFilter === "rejected"
                  ? "bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300"
                  : "hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              Rejected
            </button>
          </div>
        </div>

        {/* Type filter */}
        <div className="mb-4">
          <div className="text-xs text-slate-400 mb-2">Type</div>
          <div className="flex gap-2">
            <button
              onClick={() => setTypeFilter("all")}
              className={`flex-1 px-3 py-2 rounded-lg ${
                typeFilter === "all"
                  ? "bg-sky-50 dark:bg-sky-900 text-sky-600 dark:text-sky-300"
                  : "hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter("direct")}
              className={`flex-1 px-3 py-2 rounded-lg ${
                typeFilter === "direct"
                  ? "bg-sky-50 dark:bg-sky-900 text-sky-600 dark:text-sky-300"
                  : "hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              Direct
            </button>
            <button
              onClick={() => setTypeFilter("group")}
              className={`flex-1 px-3 py-2 rounded-lg ${
                typeFilter === "group"
                  ? "bg-sky-50 dark:bg-sky-900 text-sky-600 dark:text-sky-300"
                  : "hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              Group
            </button>
          </div>
        </div>

        <div className="mt-auto text-xs text-slate-400">
          Tip: select a message to view conversation context and act fast.
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 p-6 flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Message Review
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Review 1-to-1 and group messages with context and bulk actions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border rounded-lg px-3 py-1">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search messages, users, groups..."
                className="bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const ids = Object.keys(selectedBulk)
                    .filter((k) => selectedBulk[Number(k)])
                    .map((k) => Number(k));
                  if (ids.length === 0)
                    return alert(
                      "Select messages on the page first (checkboxes)."
                    );
                  bulkUpdateStatus(ids, "approved");
                }}
                className="px-3 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
                title="Approve selected"
              >
                <Check className="w-4 h-4 inline" /> Approve
              </button>
              <button
                onClick={() => {
                  const ids = Object.keys(selectedBulk)
                    .filter((k) => selectedBulk[Number(k)])
                    .map((k) => Number(k));
                  if (ids.length === 0)
                    return alert(
                      "Select messages on the page first (check boxes)."
                    );
                  bulkUpdateStatus(ids, "rejected");
                }}
                className="px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                title="Reject selected"
              >
                <X className="w-4 h-4 inline" /> Reject
              </button>
              <button
                onClick={() => selectAllOnPage()}
                className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700"
              >
                Select page
              </button>
              <button
                onClick={() => clearBulkSelections()}
                className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* layout: left list / center preview / right metadata */}
        <div className="flex gap-4 flex-1">
          {/* Left: messages list */}
          <section className="w-96 bg-white dark:bg-slate-800 border rounded-lg overflow-hidden">
            <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Messages ({filtered.length})
              </div>
              <div className="text-xs text-slate-400">
                Page {page}/{pageCount}
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[60vh] overflow-y-auto">
              {paginated.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className={`p-3 flex gap-3 items-start cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 ${
                    selectedId === m.id ? "bg-sky-50 dark:bg-sky-900/50" : ""
                  }`}
                >
                  <div className="w-6 flex items-center justify-center">
                    <input
                      checked={!!selectedBulk[m.id]}
                      onChange={() => toggleBulk(m.id)}
                      type="checkbox"
                      className="accent-sky-500"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-slate-200 dark:bg-slate-700 w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-slate-700 dark:text-slate-100">
                          {m.fromName[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {m.fromName}
                          </div>
                          <div className="text-xs text-slate-400">
                            {m.groupName ? (
                              <span>
                                in{" "}
                                <span className="font-semibold text-slate-700 dark:text-slate-100">
                                  {m.groupName}
                                </span>
                              </span>
                            ) : (
                              <span>
                                to{" "}
                                <span className="font-semibold text-slate-700 dark:text-slate-100">
                                  {m.toName}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right text-xs">
                        <div
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            m.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : m.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {m.status}
                        </div>
                        <div className="text-slate-400 mt-1 whitespace-nowrap">
                          {new Date(m.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                      {m.content}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateMessageStatus(m.id, "approved");
                        }}
                        className="text-xs px-2 py-1 rounded bg-green-500 text-white"
                      >
                        Approve
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateMessageStatus(m.id, "rejected");
                        }}
                        className="text-xs px-2 py-1 rounded bg-red-500 text-white"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination controls */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Showing {Math.min(filtered.length, (page - 1) * PAGE_SIZE + 1)}{" "}
                - {Math.min(filtered.length, page * PAGE_SIZE)} of{" "}
                {filtered.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-2 py-1 bg-white dark:bg-slate-700 rounded"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  className="px-2 py-1 bg-white dark:bg-slate-700 rounded"
                >
                  Next
                </button>
              </div>
            </div>
          </section>

          {/* Center: preview / conversation */}
          <section className="flex-1 bg-white dark:bg-slate-900 border rounded-lg p-4 flex flex-col">
            {!selectedMessage ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <FileText className="w-12 h-12 mb-3" />
                <div className="text-lg font-medium">
                  Select a message to review
                </div>
                <div className="mt-2 text-sm">
                  You will see the message and the recent conversation context
                  here.
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b pb-3 mb-3">
                  <div>
                    <div className="text-sm text-slate-500">Conversation</div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {selectedMessage.groupName ??
                        `${selectedMessage.fromName} ↔ ${selectedMessage.toName}`}
                    </div>
                    <div className="text-xs text-slate-400">
                      {conversationContext.length} messages
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-xs text-slate-400">
                      Message ID: {selectedMessage.id}
                    </div>
                    <div
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        selectedMessage.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : selectedMessage.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {selectedMessage.status}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3">
                  {conversationContext.map((m) => {
                    const mine = m.fromId === selectedMessage.fromId; // not exact, but visual
                    const isCurrent = m.id === selectedMessage.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex ${
                          mine ? "justify-end" : "justify-start"
                        } ${isCurrent ? "animate-pulse" : ""}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-xl ${
                            isCurrent
                              ? "ring-2 ring-sky-400 bg-sky-50 dark:bg-sky-900/30"
                              : mine
                              ? "bg-gradient-to-r from-sky-400 to-blue-500 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                          }`}
                        >
                          <div className="text-xs text-slate-600 dark:text-slate-300 mb-1 font-semibold">
                            {m.fromName}
                            {m.groupName ? ` • ${m.groupName}` : ""}{" "}
                            <span className="ml-2 text-[10px] text-slate-400 font-normal">
                              {new Date(m.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm">{m.content}</div>
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() =>
                                updateMessageStatus(m.id, "approved")
                              }
                              className="text-xs px-2 py-1 rounded bg-green-500 text-white"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                updateMessageStatus(m.id, "rejected")
                              }
                              className="text-xs px-2 py-1 rounded bg-red-500 text-white"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Decision box */}
                <div className="mt-3 border-t pt-3 flex items-center gap-3">
                  <button
                    onClick={() =>
                      selectedMessage &&
                      updateMessageStatus(selectedMessage.id, "approved")
                    }
                    className="px-4 py-2 rounded-lg bg-green-500 text-white"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      selectedMessage &&
                      updateMessageStatus(selectedMessage.id, "rejected")
                    }
                    className="px-4 py-2 rounded-lg bg-red-500 text-white"
                  >
                    Reject
                  </button>

                  <div className="ml-auto text-sm text-slate-500">
                    Reviewer: Admin (demo)
                  </div>
                </div>
              </>
            )}
          </section>

          {/* Right: metadata & actions */}
          <aside className="w-80 bg-white dark:bg-slate-800 border rounded-lg p-4 flex flex-col">
            <div className="text-sm text-slate-500 mb-3">Message Details</div>

            {!selectedMessage ? (
              <div className="text-slate-400 text-sm">
                Select a message to inspect sender, recipients, and timestamps.
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-semibold">
                    {selectedMessage.fromName[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {selectedMessage.fromName}
                    </div>
                    <div className="text-xs text-slate-400">
                      User id: {selectedMessage.fromId}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400">To</div>
                <div className="mb-3 font-medium">
                  {selectedMessage.groupName ?? selectedMessage.toName}
                </div>

                <div className="text-xs text-slate-400">Created</div>
                <div className="mb-3">
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </div>

                <div className="text-xs text-slate-400">Status</div>
                <div className="mb-3">
                  <div
                    className={`inline-block px-2 py-1 rounded-full text-xs ${
                      selectedMessage.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : selectedMessage.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {selectedMessage.status}
                  </div>
                </div>

                <div className="text-xs text-slate-400">Quick actions</div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() =>
                      selectedMessage &&
                      updateMessageStatus(selectedMessage.id, "approved")
                    }
                    className="flex-1 px-3 py-2 rounded bg-green-500 text-white"
                  >
                    <Check className="w-4 h-4 inline mr-1" /> Approve
                  </button>
                  <button
                    onClick={() =>
                      selectedMessage &&
                      updateMessageStatus(selectedMessage.id, "rejected")
                    }
                    className="flex-1 px-3 py-2 rounded bg-red-500 text-white"
                  >
                    <X className="w-4 h-4 inline mr-1" /> Reject
                  </button>
                </div>

                <div className="mt-4 text-xs text-slate-400">Notes</div>
                <textarea
                  placeholder="Add a note for audit / rejection reason..."
                  className="mt-2 p-2 rounded border bg-transparent text-sm h-20 resize-none"
                ></textarea>

                <div className="mt-auto text-xs text-slate-500">
                  Audit log (demo): actions here would be persisted to audit
                  trail.
                </div>
              </>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
