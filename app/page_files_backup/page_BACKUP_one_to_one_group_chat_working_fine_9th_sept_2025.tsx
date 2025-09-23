"use client";

import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
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

const DUMMY_USERS: User[] = [
  { id: "1", name: "Alice Johnson", online: true },
  { id: "2", name: "Farah Qureshi", online: true },
  { id: "3", name: "Gina Torres", online: true },
  { id: "4", name: "Hassan Ali", online: false },
  { id: "5", name: "Ivan Petrov", online: true },
  { id: "6", name: "Julia Roberts", online: true },
  { id: "7", name: "Laura Chen", online: true },
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

  const socketRef = useRef<typeof Socket | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // keep refs
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

  // socket setup
  useEffect(() => {
    const s = io("http://localhost:4000", {
      transports: ["websocket", "polling"],
    });
    socketRef.current = s;

    s.on("connect", () => {
      const id = sessionStorage.getItem("demoUserId");
      if (id) s.emit("register", id);
    });

    s.on("message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);

      const me = currentUserIdRef.current;
      const openUser = selectedUserIdRef.current;
      const openGroup = selectedGroupIdRef.current;
      const isIncoming = msg.from !== me;

      const dmOpen =
        !!openUser &&
        !msg.groupId &&
        (msg.from === openUser || msg.to === openUser);
      const groupOpen = !!openGroup && msg.groupId === openGroup;

      if (isIncoming && !(dmOpen || groupOpen)) {
        const bucketKey = (msg.groupId ?? msg.from) as string;
        setUnread((prev) => ({ ...prev, [bucketKey]: true }));
      }
    });

    s.on("groupCreated", (group: Group) => {
      if (group.members.includes(currentUserIdRef.current!)) {
        setGroups((prev) => [...prev, group]);
      }
    });

    return () => {
      s.disconnect();
    };
  }, []);

  // send direct
  const sendDirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !currentUser) return;
    socketRef.current?.emit("message", {
      from: currentUser.id,
      to: selectedUser.id,
      text: newMessage.trim(),
    });
    setNewMessage("");
  };

  // send group
  const sendGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup || !currentUser) return;
    socketRef.current?.emit("message", {
      from: currentUser.id,
      groupId: selectedGroup.id,
      text: newMessage.trim(),
    });
    setNewMessage("");
  };

  // file send
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    const msg: Message = {
      from: currentUser.id,
      fileUrl: URL.createObjectURL(file),
      fileName: file.name,
    };

    if (selectedUser) msg.to = selectedUser.id;
    if (selectedGroup) msg.groupId = selectedGroup.id;

    socketRef.current?.emit("message", msg);
    e.currentTarget.value = "";
  };

  const handleAttachClick = () => fileInputRef.current?.click();

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

    socketRef.current?.emit("joinGroup", group.id);

    setUnread((prev) => {
      const updated = { ...prev };
      delete updated[group.id];
      return updated;
    });
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || groupMembers.length < 1 || !currentUser) return;
    const newGroup: Group = {
      id: `g${Date.now()}`,
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
    <div className="flex h-screen bg-gray-100">
      {/* LEFT PANEL */}
      <div className="w-72 border-r bg-white flex flex-col">
        <div className="p-4 font-bold border-b text-lg shadow">
          {currentUser.name}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2 font-semibold text-gray-600">Contacts</div>
          {users
            .filter((u) => u.id !== currentUser.id)
            .map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className={`w-full flex items-center justify-between px-4 py-2 rounded hover:bg-gray-100 ${
                  selectedUser?.id === user.id ? "bg-blue-50" : ""
                }`}
              >
                <span
                  className={`truncate ${
                    unread[user.id] ? "font-bold text-blue-700" : ""
                  }`}
                >
                  {user.name}
                </span>
                <div className="flex items-center gap-2">
                  {unread[user.id] && (
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                  <span
                    className={user.online ? "text-green-500" : "text-gray-400"}
                  >
                    ●
                  </span>
                </div>
              </button>
            ))}

          <div className="p-2 font-semibold text-gray-600 flex justify-between items-center">
            Groups
            <button
              onClick={() => setShowGroupModal(true)}
              className="text-blue-500 hover:underline"
            >
              + Add
            </button>
          </div>
          {groups
            .filter((g) => g.members.includes(currentUser.id))
            .map((group) => (
              <button
                key={group.id}
                onClick={() => handleSelectGroup(group)}
                className={`w-full flex items-center justify-between px-4 py-2 rounded hover:bg-gray-100 ${
                  selectedGroup?.id === group.id ? "bg-blue-50" : ""
                }`}
              >
                <span
                  className={`truncate ${
                    unread[group.id] ? "font-bold text-blue-700" : ""
                  }`}
                >
                  {group.name}
                </span>
                {unread[group.id] && (
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                )}
              </button>
            ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-white font-bold">
          {selectedUser
            ? selectedUser.name
            : selectedGroup
            ? selectedGroup.name
            : "Select a chat"}
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-2">
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
                className={`p-2 rounded-lg max-w-xs ${
                  m.from === currentUser.id
                    ? "ml-auto bg-blue-500 text-white"
                    : "mr-auto bg-gray-200"
                }`}
              >
                {m.text && <p>{m.text}</p>}
                {m.fileUrl && (
                  <a
                    href={m.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-1 underline text-sm"
                  >
                    📎 {m.fileName}
                  </a>
                )}
              </div>
            ))}
        </div>

        {(selectedUser || selectedGroup) && (
          <form
            onSubmit={selectedUser ? sendDirect : sendGroup}
            className="p-4 border-t bg-white flex gap-2"
          >
            <button type="button" onClick={handleAttachClick}>
              📎
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
              className="flex-1 border rounded px-3 py-2"
              placeholder="Type a message..."
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Send
            </button>
          </form>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="w-64 border-l bg-white p-4">
        {selectedUser && (
          <>
            <div className="font-bold">{selectedUser.name}</div>
            <div className="text-sm text-gray-500">Private Chat</div>
          </>
        )}
        {selectedGroup && (
          <>
            <div className="font-bold">{selectedGroup.name}</div>
            <div className="text-sm text-gray-500">Group Chat</div>
            <div className="mt-2 text-xs text-gray-400">
              Members:{" "}
              {selectedGroup.members
                .map((id) => users.find((u) => u.id === id)?.name)
                .join(", ")}
            </div>
          </>
        )}
      </div>

      {/* GROUP CREATE MODAL */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
            <h2 className="text-lg font-bold mb-4">Create Group</h2>
            <input
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="border p-2 w-full mb-3 rounded"
            />
            <input
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 w-full mb-3 rounded"
            />
            <div className="max-h-40 overflow-y-auto mb-3">
              {users
                .filter((u) => u.id !== currentUser.id)
                .filter((u) =>
                  u.name.toLowerCase().includes(search.toLowerCase())
                )
                .map((u) => (
                  <label key={u.id} className="flex items-center gap-2 mb-1">
                    <input
                      type="checkbox"
                      checked={groupMembers.includes(u.id)}
                      onChange={(e) =>
                        setGroupMembers((prev) =>
                          e.target.checked
                            ? [...prev, u.id]
                            : prev.filter((id) => id !== u.id)
                        )
                      }
                    />
                    <span>{u.name}</span>
                  </label>
                ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowGroupModal(false)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                className="px-3 py-1 bg-blue-500 text-white rounded"
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
