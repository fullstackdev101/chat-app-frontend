"use client";

import { Paperclip, Send, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

// Interfaces (match backend schema)
interface User {
  id: number;
  name: string;
  online: boolean;
}

interface Message {
  id?: number;
  from_user: number;
  to_user?: number;
  group_id?: number;
  text?: string;
  file_url?: string;
  file_name?: string;
  created_at?: string;
}

interface Group {
  id: number;
  name: string;
  members: number[];
}

export default function ChatPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [unread, setUnread] = useState<Record<string, boolean>>({});
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState<number[]>([]);
  const [search, setSearch] = useState("");

  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Refs
  const currentUserIdRef = useRef<number | null>(null);
  const selectedUserIdRef = useRef<number | null>(null);
  const selectedGroupIdRef = useRef<number | null>(null);

  // Fetch users & groups from backend
  useEffect(() => {
    const fetchData = async () => {
      const [usersRes, groupsRes] = await Promise.all([
        fetch("http://localhost:4000/users").then((res) => res.json()),
        fetch("http://localhost:4000/groups").then((res) => res.json()),
      ]);
      setUsers(usersRes);
      setGroups(groupsRes);

      // Pick random logged-in user for demo
      let savedId = sessionStorage.getItem("demoUserId");
      let chosen: User | undefined = usersRes.find(
        (u: User) => String(u.id) === savedId
      );

      if (!chosen) {
        chosen = usersRes[Math.floor(Math.random() * usersRes.length)];
        if (!chosen) return; // Guard against empty users array
        sessionStorage.setItem("demoUserId", String(chosen.id));
      }

      const me: User = { ...chosen, name: `${chosen.name} (You)` };
      setCurrentUser(me);
      currentUserIdRef.current = chosen.id;
    };

    fetchData();
  }, []);

  // Sync selected refs
  useEffect(() => {
    currentUserIdRef.current = currentUser?.id ?? null;
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
      if (id) {
        console.log("Registering user:", id);
        s.emit("register", Number(id)); // ✅ Register once
      }
    };

    const onMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);

      const me = currentUserIdRef.current;
      const openUser = selectedUserIdRef.current;
      const openGroup = selectedGroupIdRef.current;
      const isIncoming = msg.from_user !== me;

      const dmOpen =
        !!openUser &&
        !msg.group_id &&
        (msg.from_user === openUser || msg.to_user === openUser);

      const groupOpen =
        !!openGroup && !!msg.group_id && msg.group_id === openGroup;

      if (isIncoming && !(dmOpen || groupOpen)) {
        const bucketKey = String(msg.group_id ?? msg.from_user);
        setUnread((prev) => ({ ...prev, [bucketKey]: true }));
      }
    };

    const onGroupCreated = (group: Group) => {
      setGroups((prev) =>
        prev.some((g) => g.id === group.id) ? prev : [...prev, group]
      );
    };

    s.on("connect", onConnect);
    s.on("message", onMessage);
    s.on("groupCreated", onGroupCreated);

    return () => {
      s.off("connect", onConnect);
      s.off("message", onMessage);
      s.off("groupCreated", onGroupCreated);
      s.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Send DM
  const sendDirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !currentUser) return;
    const msg: Message = {
      from_user: currentUser.id,
      to_user: selectedUser.id,
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
      from_user: currentUser.id,
      group_id: selectedGroup.id,
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
        from_user: currentUser.id,
        file_url: fileUrl,
        file_name: file.name,
        ...(selectedUser ? { to_user: selectedUser.id } : {}),
        ...(selectedGroup ? { group_id: selectedGroup.id } : {}),
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
  const handleCreateGroup = () => {
    if (!groupName.trim() || groupMembers.length < 2 || !currentUser) return;
    const newGroup = {
      name: groupName.trim(),
      members: [currentUser.id, ...groupMembers],
    };
    socketRef.current?.emit("createGroup", newGroup);
    setGroupName("");
    setGroupMembers([]);
    setShowGroupModal(false);
  };

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
        <div className="flex-1 px-6 py-4 overflow-y-auto space-y-4">
          {messages
            .filter((m) =>
              selectedUser
                ? (m.from_user === currentUser.id &&
                    m.to_user === selectedUser.id) ||
                  (m.from_user === selectedUser.id &&
                    m.to_user === currentUser.id)
                : selectedGroup
                ? m.group_id === selectedGroup.id
                : false
            )
            .map((m, idx) => (
              <div
                key={idx}
                className={`mb-2 ${
                  m.from_user === currentUser.id ? "text-right" : "text-left"
                }`}
              >
                {/* Sender name for group messages */}
                {selectedGroup && m.from_user !== currentUser.id && (
                  <div className="text-xs text-gray-500 mb-1">
                    {users.find((u) => u.id === m.from_user)?.name ?? "Unknown"}
                  </div>
                )}

                <div
                  className={`inline-block px-3 py-2 rounded-lg ${
                    m.from_user === currentUser.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  {m.text && <p>{m.text}</p>}
                  {m.file_url && (
                    <a
                      href={m.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline"
                    >
                      📎 {m.file_name || "File"}
                    </a>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Input */}
        {(selectedUser || selectedGroup) && (
          <form
            onSubmit={selectedUser ? sendDirect : sendGroup}
            className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 items-center"
          >
            <button
              type="button"
              onClick={handleAttachClick}
              className="text-gray-500 hover:text-blue-500"
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </form>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="w-72 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
        {selectedUser && (
          <div>
            <div className="text-xl font-bold">{selectedUser.name}</div>
            <div className="text-sm text-gray-500">Private Chat</div>
          </div>
        )}
        {selectedGroup && (
          <div>
            <div className="text-xl font-bold">{selectedGroup.name}</div>
            <div className="text-sm text-gray-500">Group Chat</div>
            <div className="mt-2 text-xs text-gray-400">
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
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-96">
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
