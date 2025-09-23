"use client";

import { Paperclip, Send, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

interface User {
  id: string;
  name: string;
  online: boolean;
}

interface Message {
  from: string;
  to?: string;
  groupId?: string;
  text?: string;
  fileUrl?: string;
  fileName?: string;
}

interface Group {
  id: string;
  name: string;
  members: string[];
}

// Dummy Users (25)
const DUMMY_USERS: User[] = [
  { id: "1", name: "Alice Johnson", online: true },
  { id: "2", name: "Farah Qureshi", online: true },
  { id: "3", name: "Gina Torres", online: true },
  { id: "4", name: "Hassan Ali", online: false },
  { id: "5", name: "Ivan Petrov", online: true },
  { id: "6", name: "Julia Roberts", online: true },
  { id: "7", name: "Laura Chen", online: true },
  { id: "8", name: "Michael Scott", online: false },
  { id: "9", name: "Pam Beesly", online: true },
  { id: "10", name: "Jim Halpert", online: true },
  { id: "11", name: "Dwight Schrute", online: false },
  { id: "12", name: "Stanley Hudson", online: true },
  { id: "13", name: "Kevin Malone", online: true },
  { id: "14", name: "Angela Martin", online: false },
  { id: "15", name: "Oscar Martinez", online: true },
  { id: "16", name: "Phyllis Vance", online: true },
  { id: "17", name: "Kelly Kapoor", online: true },
  { id: "18", name: "Ryan Howard", online: false },
  { id: "19", name: "Creed Bratton", online: true },
  { id: "20", name: "Toby Flenderson", online: true },
  { id: "21", name: "Meredith Palmer", online: true },
  { id: "22", name: "Darryl Philbin", online: true },
  { id: "23", name: "Jan Levinson", online: false },
  { id: "24", name: "David Wallace", online: true },
  { id: "25", name: "Holly Flax", online: true },
];

export default function ChatPage() {
  const [users] = useState<User[]>(DUMMY_USERS);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [unread, setUnread] = useState<Record<string, boolean>>({});
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Refs
  const currentUserIdRef = useRef<string | null>(null);
  const selectedUserIdRef = useRef<string | null>(null);
  const selectedGroupIdRef = useRef<string | null>(null);

  // Pick random logged-in user
  useEffect(() => {
    const savedId = sessionStorage.getItem("demoUserId");
    let chosen: User | undefined = users.find((u) => u.id === savedId);

    if (!chosen) {
      chosen = users[Math.floor(Math.random() * users.length)];
      sessionStorage.setItem("demoUserId", chosen.id);
    }
    const me: User = { ...chosen, name: `${chosen.name} (You)` };
    setCurrentUser(me);
    currentUserIdRef.current = chosen.id;
  }, [users]);

  // Sync refs
  useEffect(() => {
    currentUserIdRef.current = currentUser?.id ?? null;
    if (currentUser) socketRef.current?.emit("register", currentUser.id);
  }, [currentUser]);

  useEffect(() => {
    selectedUserIdRef.current = selectedUser?.id ?? null;
  }, [selectedUser]);

  useEffect(() => {
    selectedGroupIdRef.current = selectedGroup?.id ?? null;
  }, [selectedGroup]);

  // Socket setup
  useEffect(() => {
    const s = io("http://localhost:4000", {
      transports: ["websocket", "polling"],
    });
    socketRef.current = s;

    const onConnect = () => {
      const id = sessionStorage.getItem("demoUserId");
      if (id) s.emit("register", id);
    };

    const onMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);

      const me = currentUserIdRef.current;
      const openUser = selectedUserIdRef.current;
      const openGroup = selectedGroupIdRef.current;
      const isIncoming = msg.from !== me;

      const dmOpen = !!openUser && !msg.groupId && msg.from === openUser;
      const groupOpen =
        !!openGroup && !!msg.groupId && msg.groupId === openGroup;

      if (isIncoming && !(dmOpen || groupOpen)) {
        const bucketKey = (msg.groupId ?? msg.from) as string;
        setUnread((prev) => ({ ...prev, [bucketKey]: true }));
      }
    };

    const onGroupCreated = (group: Group) => {
      setGroups((prev) => {
        if (prev.some((g) => g.id === group.id)) return prev;
        return [...prev, group];
      });
    };

    s.on("connect", onConnect);
    s.on("message", onMessage);
    s.on("groupCreated", onGroupCreated);

    return () => {
      s.off("connect", onConnect);
      s.off("message", onMessage);
      s.off("group-created", onGroupCreated);
      s.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Send DM
  const sendDirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !currentUser) return;
    const msg: Message = {
      from: currentUser.id,
      to: selectedUser.id,
      text: newMessage.trim(),
    };
    socketRef.current?.emit("message", msg);
    setNewMessage("");
  };

  // Send Group
  const sendGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup || !currentUser) return;
    const msg: Message = {
      from: currentUser.id,
      groupId: selectedGroup.id,
      text: newMessage.trim(),
    };
    socketRef.current?.emit("message", msg);
    setNewMessage("");
  };

  // Handle File Upload → convert to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    const reader = new FileReader();
    reader.onload = () => {
      const fileUrl = reader.result as string;
      const msg: Message = {
        from: currentUser.id,
        fileUrl,
        fileName: file.name,
        ...(selectedUser ? { to: selectedUser.id } : {}),
        ...(selectedGroup ? { groupId: selectedGroup.id } : {}),
      };
      socketRef.current?.emit("message", msg);
    };
    reader.readAsDataURL(file);
    e.currentTarget.value = "";
  };

  const handleAttachClick = () => fileInputRef.current?.click();

  const handleLogout = () => {
    sessionStorage.removeItem("demoUserId");
    window.location.reload();
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSelectedGroup(null);
    selectedGroupIdRef.current = null;
    selectedUserIdRef.current = user.id;
    setUnread((prev) => {
      const updated = { ...prev };
      delete updated[user.id];
      return updated;
    });
  };

  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group);
    setSelectedUser(null);
    selectedUserIdRef.current = null;
    selectedGroupIdRef.current = group.id;
    setUnread((prev) => {
      const updated = { ...prev };
      delete updated[group.id];
      return updated;
    });
  };

  // Create group
  // Create group
  const handleCreateGroup = () => {
    if (!groupName.trim() || groupMembers.length < 2 || !currentUser) return;
    const newGroup: Group = {
      id: crypto.randomUUID(),
      name: groupName.trim(),
      members: [currentUser.id, ...groupMembers],
    };
    socketRef.current?.emit("createGroup", newGroup); // ✅ FIXED
    setGroupName("");
    setGroupMembers([]);
    setShowGroupModal(false);
  };

  // Listen for groups
  useEffect(() => {
    if (!socketRef.current) return;
    const s = socketRef.current;

    const onGroupCreated = (group: Group) => {
      setGroups((prev) => [...prev, group]);
    };

    s.on("groupCreated", onGroupCreated);
    return () => {
      s.off("groupCreated", onGroupCreated);
    };
  }, []);

  if (!currentUser) return <div>Loading...</div>;

  return (
    <div className="flex h-screen bg-blue-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* LEFT PANEL */}
      <div className="w-72 border-r bg-white dark:bg-gray-800 flex flex-col shadow-2xl rounded-r-2xl">
        {/* Current User */}
        <div className="p-4 flex items-center justify-between border-b bg-blue-600 dark:bg-blue-800 text-white shadow-md rounded-tr-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <span className="truncate font-semibold">{currentUser.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-white/20 transition"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Contacts */}
        <div className="flex-[3] overflow-y-auto">
          <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Contacts
          </div>
          <div className="space-y-1 px-2">
            {users
              .filter((u) => u.id !== currentUser.id)
              .map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-xl transition-all ${
                    selectedUser?.id === user.id
                      ? "bg-blue-100 dark:bg-blue-900 font-semibold"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <span
                    className={`truncate ${
                      unread[user.id] ? "font-bold text-blue-600" : ""
                    }`}
                  >
                    {user.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {unread[user.id] && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    )}
                    <span
                      className={`text-sm ${
                        user.online ? "text-green-500" : "text-gray-400"
                      }`}
                    >
                      ●
                    </span>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* Groups */}
        <div className="flex-1 overflow-y-auto border-t">
          <div className="px-4 py-2 flex justify-between items-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Groups
            <button
              onClick={() => setShowGroupModal(true)}
              className="text-blue-600 hover:text-blue-700"
            >
              + Add
            </button>
          </div>
          <div className="space-y-1 px-2">
            {groups
              .filter((g) => g.members.includes(currentUser.id))
              .map((group) => (
                <button
                  key={group.id}
                  onClick={() => handleSelectGroup(group)}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-xl transition-all ${
                    selectedGroup?.id === group.id
                      ? "bg-blue-100 dark:bg-blue-900 font-semibold"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <span
                    className={`truncate ${
                      unread[group.id] ? "font-bold text-blue-600" : ""
                    }`}
                  >
                    {group.name}
                  </span>
                  {unread[group.id] && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md flex items-center justify-between shadow-sm">
          <h2 className="font-semibold text-lg truncate">
            {selectedUser
              ? selectedUser.name
              : selectedGroup
              ? selectedGroup.name
              : "Select a chat"}
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 px-6 py-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-blue-300 dark:scrollbar-thumb-gray-600">
          {messages
            .filter((m) =>
              selectedUser
                ? (m.from === currentUser.id && m.to === selectedUser.id) ||
                  (m.to === currentUser.id && m.from === selectedUser.id)
                : selectedGroup
                ? m.groupId === selectedGroup.id
                : false
            )
            .map((m, i) => (
              <div
                key={i}
                className={`max-w-sm p-3 rounded-2xl shadow-md transition-all ${
                  m.from === currentUser.id
                    ? "ml-auto bg-gradient-to-r from-blue-600 to-blue-500 text-white"
                    : "mr-auto bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                }`}
              >
                {m.text && <p className="text-sm leading-relaxed">{m.text}</p>}
                {m.fileUrl && (
                  <a
                    href={m.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={m.fileName}
                    className="mt-2 text-xs underline flex items-center gap-1"
                  >
                    <Paperclip className="w-4 h-4" /> {m.fileName}
                  </a>
                )}
              </div>
            ))}
        </div>

        {/* Input */}
        {(selectedUser || selectedGroup) && (
          <form
            onSubmit={selectedUser ? sendDirect : sendGroup}
            className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md flex gap-3 items-center shadow-lg"
          >
            <button
              type="button"
              onClick={handleAttachClick}
              className="text-gray-500 hover:text-blue-500 transition"
            >
              <Paperclip className="w-6 h-6" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 border rounded-full px-4 py-2 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-400"
              placeholder="Type a message..."
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full flex items-center gap-2 transition shadow-md"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </form>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="w-72 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 flex flex-col shadow-xl">
        {selectedUser && (
          <div className="space-y-2">
            <div className="text-xl font-bold">{selectedUser.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Private Chat
            </div>
          </div>
        )}
        {selectedGroup && (
          <div className="space-y-3">
            <div className="text-xl font-bold">{selectedGroup.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Group Chat
            </div>
            <div className="mt-2 text-xs text-gray-400 leading-relaxed">
              Members:{" "}
              {selectedGroup.members
                .map((id) => users.find((u) => u.id === id)?.name)
                .join(", ")}
            </div>
          </div>
        )}
      </div>

      {/* GROUP CREATE MODAL */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-96 shadow-2xl">
            <h2 className="text-lg font-bold mb-4">Create Group</h2>
            <input
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="border p-2 w-full mb-3 rounded-lg"
            />
            <input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 w-full mb-3 rounded-lg"
            />
            <div className="max-h-40 overflow-y-auto mb-3">
              {users
                .filter(
                  (u) =>
                    u.id !== currentUser.id &&
                    u.name.toLowerCase().includes(search.toLowerCase())
                )
                .map((u) => (
                  <label key={u.id} className="flex items-center gap-2 mb-1">
                    <input
                      type="checkbox"
                      checked={groupMembers.includes(u.id)}
                      onChange={() =>
                        setGroupMembers((prev) =>
                          prev.includes(u.id)
                            ? prev.filter((id) => id !== u.id)
                            : [...prev, u.id]
                        )
                      }
                    />
                    {u.name}
                  </label>
                ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowGroupModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
