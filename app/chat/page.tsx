"use client";
import { useEffect, useRef, useState } from "react";
import { getSocket } from "../../lib/socket";
import { Socket as SocketClient } from "socket.io-client";
import { useRouter } from "next/navigation";
import { getPreloads } from "@/services/preloadService";
import { getContacts } from "@/services/preloadService";
import { Group, Message } from "./types";
import { User } from "../types/user";
import Header from "./components/Header";
import LeftPanel from "./components/LeftPanel";
import ChatPanel from "./components/ChatPanel";
import RightPanel from "./components/RightPanel";
import GroupModal from "./components/GroupModal";
import { useAuthStore } from "../store/authStore";

export default function ChatPage() {
  const [users, setUsers] = useState<User[]>([]); //  Users are users that are connected (accepted requests from user and to user)

  // <-- FIXED: explicitly type these as User[] so TS knows .map(r => r.id) is valid
  const [contacts, setContacts] = useState<User[]>([]); // ONLY for SEARCH.  Contacts are users which are NOT CONNECTED AND have not sent or received a request.
  const [requestsReceived, setRequestsReceived] = useState<User[]>([]);
  const [requestsSent, setRequestsSent] = useState<User[]>([]);
  // const [pendingRequests, setPendingRequests] = useState<User[]>([]);

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

  const [directMessages, setDirectMessages] = useState<
    Record<string, Message[]>
  >({});
  const [groupMessages, setGroupMessages] = useState<Record<number, Message[]>>(
    {}
  );

  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const socketRef = useRef<SocketClient | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // refs used for comparing in listeners
  const currentUserIdRef = useRef<number | null>(null);
  const selectedUserIdRef = useRef<number | null>(null);
  const selectedGroupIdRef = useRef<number | null>(null);

  // console.log("-------- LINE 45 ---------");
  // console.log(users);
  // console.log(pendingRequests);

  // ---------------------------
  // Preload (initial snapshot)
  // ---------------------------
  // Load users & groups, set current user
  // ---------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getPreloads();
        // console.log("RESPONSE:");
        // console.log(data.pendingRequestsReceived);
        // console.log(data.pendingRequestsSent);

        setUsers(data.users || []);
        setRequestsReceived(data.pendingRequestsReceived || []);
        setRequestsSent(data.pendingRequestsSent || []);
        setGroups(data.groups || []);
        setDirectMessages(data.messages?.direct || {});
        setGroupMessages(data.messages?.groups || {});

        const savedId = user?.id;
        // console.log("----->" + savedId);
        // store demoUserId so other parts of app can use it
        sessionStorage.setItem("demoUserId", String(savedId));

        const chosen: User | undefined = data.users.find(
          (u: User) => String(u.id) === String(savedId)
        );

        // console.log("----->" + chosen);

        if (!chosen) {
          // if user not found, do not set current user (keeps previous behavior)
          console.warn("Chosen user not found from users list:", savedId);
          return;
        }

        const me: User = { ...chosen, name: `${chosen.name} (You)` };
        setCurrentUser(me);
        currentUserIdRef.current = chosen.id;
      } catch (err) {
        console.error("Failed to fetch users/groups:", err);
      }
    };

    fetchData();
    // NOTE: we intentionally run this once; `user` from authStore is read initially.
    // If you expect `user` to change and want to react, add [user] here.
  }, [user?.id]);

  useEffect(() => {
    currentUserIdRef.current = currentUser?.id ?? null;
  }, [currentUser]);

  useEffect(() => {
    selectedUserIdRef.current = selectedUser?.id ?? null;
  }, [selectedUser]);

  useEffect(() => {
    selectedGroupIdRef.current = selectedGroup?.id ?? null;
  }, [selectedGroup]);

  // ---------------------------
  // Socket listeners
  // ---------------------------
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socketRef.current = socket;

    const handleConnect = () => {
      console.log("✅ Socket connected:", socket.id);
      // Attempt to register if currentUser is already available
      if (currentUser?.id) {
        socket.emit("register", currentUser.id);
        console.log("→ emitted register for currentUser:", currentUser.id);
      } else {
        // else store demoUserId register will happen when currentUser becomes available (see below)
        const stored = sessionStorage.getItem("demoUserId");
        if (stored) {
          // try to register with stored id as a fallback
          const nid = Number(stored);
          if (!Number.isNaN(nid)) {
            socket.emit("register", nid);
            console.log("→ emitted register from sessionStorage id:", nid);
          }
        }
      }
    };

    const handleMessage = (msg: Message) => {
      // debug
      // console.log("📩 Incoming message (handleMessage):", msg);

      // If group message
      if (msg.group_id !== undefined && msg.group_id !== null) {
        const groupId = msg.group_id as number; // ✅ ensure TS knows it's a number

        setGroupMessages((prev) => {
          const arr = prev[groupId] ? [...prev[groupId]] : [];
          // avoid duplicates by id
          if (!arr.some((m) => m.id === msg.id)) arr.push(msg);
          return { ...prev, [groupId]: arr };
        });

        // show in open group chat if active
        if (selectedGroupIdRef.current === groupId) {
          setMessages((prev) => {
            if (!prev.some((m) => m.id === msg.id)) return [...prev, msg];
            return prev;
          });
        }

        // mark unread for others
        if (msg.from_user !== currentUserIdRef.current) {
          setUnread((prev) => ({ ...prev, [`group-${groupId}`]: true }));
        }
        return;
      }

      // Direct message (one-to-one)
      if (msg.to_user || msg.from_user) {
        const key = [msg.from_user, msg.to_user].sort().join("-");
        setDirectMessages((prev) => {
          const currentList = prev[key] ? [...prev[key]] : [];
          // dedupe using id if present
          if (!currentList.some((m) => m.id === msg.id)) currentList.push(msg);
          return { ...prev, [key]: currentList };
        });

        // If the recipient currently has this chat open (either direction), append to visible messages
        const isCurrentChatOpen =
          selectedUserIdRef.current !== null &&
          (selectedUserIdRef.current === msg.from_user ||
            selectedUserIdRef.current === msg.to_user) &&
          currentUserIdRef.current !== null &&
          (currentUserIdRef.current === msg.to_user ||
            currentUserIdRef.current === msg.from_user);

        if (isCurrentChatOpen) {
          setMessages((prev) => {
            if (!prev.some((m) => m.id === msg.id)) return [...prev, msg];
            return prev;
          });
        } else {
          // Not open: mark unread if message is from someone else
          if (msg.from_user !== currentUserIdRef.current) {
            setUnread((prev) => ({ ...prev, [`user-${msg.from_user}`]: true }));
          }
        }
      }
    };

    const handleGroupCreated = (group: Group) => {
      setGroups((prev) =>
        prev.some((g) => g.id === group.id) ? prev : [...prev, group]
      );
    };

    socket.on("connect", handleConnect);
    socket.on("message", handleMessage);
    socket.on("groupCreated", handleGroupCreated);

    socket.on("user:updated", (updatedUser: User) => {
      // Function to update single record
      // React style update function
      function updateUserById(users: User[], id: number, userData: User) {
        return users.map((user) =>
          user.id === id ? { ...user, ...userData } : user
        );
      }

      // Example usage in setState
      setUsers((prev) => updateUserById(prev, updatedUser.id, updatedUser));
    });

    socket.on("user:created", (newUser: User) => {
      const jsonString = JSON.stringify(newUser);

      // 🔄 Transform to desired structure
      const transformed = (JSON.parse(jsonString) as User[]).map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        password: u.password,
        role_id: u.role_id,
        phone_number: u.phone_number,
        notes: u.notes,
        created_by: u.created_by,
        presence: u.presence,
        last_seen: u.last_seen,
        account_status: u.account_status,
        profile_image: u.profile_image,
        created_at: u.created_at,
        updated_at: u.updated_at,
      }));

      setUsers((prev) => [...prev, transformed[0]]);
    });

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off("connect", handleConnect);
        socket.off("message", handleMessage);
        socket.off("groupCreated", handleGroupCreated);
        socket.off("user:created");
        socket.off("user:updated");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // ---------------------------
  // Ensure register after currentUser becomes available
  // (fixes race where socket connected before currentUser set)
  // ---------------------------
  useEffect(() => {
    if (!socketRef.current) return;
    if (!currentUser?.id) return;

    if (socketRef.current.connected) {
      socketRef.current.emit("register", currentUser.id);
      console.log("→ emitted register (currentUser ready):", currentUser.id);
    } else {
      // wait for connect event to emit register (connect handler will handle it)
      console.log(
        "Socket not connected yet; register will be emitted on connect"
      );
    }
  }, [currentUser?.id]);

  // ---------------------------
  // Send direct message (emit only, server will echo and update state)
  // ---------------------------
  const sendDirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !currentUser) return;

    const msg: Partial<Message> = {
      from_user: currentUser.id,
      to_user: selectedUser.id,
      text: newMessage.trim(),
    };

    // emit to server; server will save and emit back to both sides
    socketRef.current?.emit("message", msg);
    setNewMessage("");
  };

  // ---------------------------
  // Send group message
  // ---------------------------
  const sendGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup || !currentUser) return;

    const msg: Partial<Message> = {
      from_user: currentUser.id,
      group_id: selectedGroup.id,
      text: newMessage.trim(),
    };

    socketRef.current?.emit("message", msg);
    setNewMessage("");
  };

  // ---------------------------
  // File upload -> emit message with file info
  // ---------------------------
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:4000/api/chat/upload", {
        method: "POST",
        body: formData,
      });
      const uploaded = await res.json();

      const msg: Partial<Message> = {
        from_user: currentUser.id,
        file_url: uploaded.fileUrl,
        file_name: uploaded.fileName,
        ...(selectedUser ? { to_user: selectedUser.id } : {}),
        ...(selectedGroup ? { group_id: selectedGroup.id } : {}),
      };
      socketRef.current?.emit("message", msg);
    } catch (err) {
      console.error("Upload failed", err);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAttachClick = () => fileInputRef.current?.click();

  const handleLogout = () => {
    sessionStorage.removeItem("demoUserId");
    router.push("/login");
  };

  // ---------------------------
  // When selecting a user, load that conversation from directMessages
  // ---------------------------
  const handleSelectUser = (user: User) => {
    if (!currentUser) return;
    setSelectedUser(user);
    setSelectedGroup(null);

    const key = [currentUser.id, user.id].sort().join("-");
    setMessages(directMessages[key] || []);

    // clear unread badge for that user
    setUnread((prev) => {
      const updated = { ...prev };
      delete updated[`user-${user.id}`];
      return updated;
    });
  };

  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group);
    setSelectedUser(null);

    setMessages(groupMessages[group.id] || []);

    setUnread((prev) => {
      const updated = { ...prev };
      delete updated[`group-${group.id}`];
      return updated;
    });
  };

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
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const { data: allContacts } = await getContacts();

        setContacts(() => {
          const excludeIds = [
            ...requestsReceived.map((r) => r.id),
            ...requestsSent.map((r) => r.id),
            ...users.map((r) => r.id),
          ];

          return allContacts.filter((c: User) => !excludeIds.includes(c.id));
        });
      } catch (err) {
        console.error("Failed to preload chat data:", err);
      }
    };
    fetchContacts();
  }, [requestsReceived, requestsSent, users]); // ✅ safe to leave empty now

  ////////////////////////////////////////////////////////////////////////////
  // ✅ Accept / Reject / Delete handlers
  // Accept request
  const handleAccept = (id: number) => {
    const accepted = requestsReceived.find((r) => r.id === id);
    if (!accepted) return;

    // setUsers([...users, accepted]);
    // setRequestsReceived(requestsReceived.filter((r) => r.id !== id));
    if (!user) return; // exit if not logged in

    const socket = getSocket();
    if (socket) {
      socket.emit("users_connections:update", {
        action: "accept",
        from_user_id: accepted.id, // who sent
        to_user_id: user.id, // who accepts
      });
    }
  };

  // Reject request
  const handleReject = (id: number) => {
    const rejected = requestsReceived.find((r) => r.id === id);
    if (!rejected) return;

    // setRequestsReceived((prev) => prev.filter((r) => r.id !== id));
    if (!user) return; // exit if not logged in

    const socket = getSocket();
    if (socket) {
      socket.emit("users_connections:update", {
        action: "reject",
        from_user_id: rejected.id,
        to_user_id: user.id,
      });
    }
  };

  // Delete sent request → back to contacts
  const handleDeleteSent = (id: number) => {
    const deleted = requestsSent.find((r) => r.id === id);
    if (!deleted) return;

    // setRequestsSent((prev) => prev.filter((r) => r.id !== id));
    // setContacts((prev) => [...prev, deleted]);
    if (!user) return; // exit if not logged in

    const socket = getSocket();
    if (socket) {
      socket.emit("users_connections:update", {
        action: "delete",
        // users_connections_id: deleted.users_connections_id,
        from_user_id: user.id,
        to_user_id: deleted.id,
      });
    }
  };

  // Send new request
  const handleSendRequest = (id: number) => {
    // console.log("---------- LINE  483 -----------");
    const contact = contacts.find((c) => c.id === id);
    // console.log("---------- LINE  484 -----------");
    // console.log(contact);
    if (!contact) return;

    // setRequestsSent((prev) => [...prev, contact]);
    // setContacts((prev) => prev.filter((c) => c.id !== id));

    // // console.log(user?.id, contact.id);
    // console.log(user, contact);
    if (!user) return; // exit if not logged in

    const socket = getSocket();
    if (socket) {
      socket.emit("users_connections:update", {
        action: "send",
        from_user_id: user.id,
        to_user_id: contact.id,
      });
    }
  };

  interface ConnectionEvent {
    action: "accept" | "reject" | "delete" | "send";
    from_user_id: number;
    to_user_id: number;
  }

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleConnectionChange = (data: ConnectionEvent) => {
      console.log("Realtime update:", data);

      switch (data.action) {
        case "send":
          if (user && data.to_user_id === user.id) {
            const contact = contacts.find((c) => c.id === data.from_user_id);
            if (contact) {
              setRequestsReceived((prev) => [...prev, contact]);
            }
          } else if (user && data.from_user_id === user.id) {
            const contact = contacts.find((c) => c.id === data.to_user_id);
            if (contact) {
              setRequestsSent((prev) => [...prev, contact]);
            }
          }
          break;

        case "accept":
          if (user && data.from_user_id === user.id) {
            // I sent the request, they accepted
            const contact = requestsSent.find((c) => c.id === data.to_user_id);
            if (contact) {
              setUsers((prev) => [...prev, contact]);
              setRequestsSent((prev) =>
                prev.filter((r) => r.id !== data.to_user_id)
              );
            }
          } else if (user && data.to_user_id === user.id) {
            // I accepted their request
            const contact = requestsReceived.find(
              (c) => c.id === data.from_user_id
            );
            if (contact) {
              setUsers((prev) => [...prev, contact]);
              setRequestsReceived((prev) =>
                prev.filter((r) => r.id !== data.from_user_id)
              );
            }
          }
          break;

        case "reject":
          if (user && data.from_user_id === user.id) {
            setRequestsSent((prev) =>
              prev.filter((r) => r.id !== data.to_user_id)
            );
          } else if (user && data.to_user_id === user.id) {
            setRequestsReceived((prev) =>
              prev.filter((r) => r.id !== data.from_user_id)
            );
          }
          break;

        case "delete":
          if (user && data.from_user_id === user.id) {
            setRequestsSent((prev) =>
              prev.filter((r) => r.id !== data.to_user_id)
            );
          } else if (user && data.to_user_id === user.id) {
            setRequestsReceived((prev) =>
              prev.filter((r) => r.id !== data.from_user_id)
            );
          }
          break;
      }
    };

    socket.on("users_connections:update", handleConnectionChange);
    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off("users_connections:update", handleConnectionChange);
      }
    };
  }, [contacts, requestsReceived, requestsSent, user, user?.id]); // ✅ only depends on contacts + user id

  /////////////////////////////////////////////////////////////////////////////
  // render
  if (!currentUser) return <div>Loading...</div>;

  // console.log("------------- LINE 540 ------------");
  // console.log(requestsReceived);
  // console.log(requestsSent);
  return (
    <div className="flex h-screen bg-blue-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* LEFT */}
      <div className="flex flex-col w-72">
        <Header currentUser={currentUser} onLogout={handleLogout} />
        <LeftPanel
          users={users}
          groups={groups}
          currentUser={currentUser}
          selectedUser={selectedUser}
          selectedGroup={selectedGroup}
          unread={unread}
          onSelectUser={handleSelectUser}
          onSelectGroup={handleSelectGroup}
          onOpenGroupModal={() => setShowGroupModal(true)}
        />
      </div>

      {/* CHAT */}
      <ChatPanel
        currentUser={currentUser}
        selectedUser={selectedUser}
        selectedGroup={selectedGroup}
        messages={messages}
        users={users}
        newMessage={newMessage}
        onSendDirect={sendDirect}
        onSendGroup={sendGroup}
        onFileChange={handleFileChange}
        onAttachClick={handleAttachClick}
        onMessageChange={setNewMessage}
      />

      {/* RIGHT */}
      <RightPanel
        requestsReceived={requestsReceived}
        requestsSent={requestsSent}
        contacts={contacts}
        onAccept={handleAccept}
        onReject={handleReject}
        onDeleteSent={handleDeleteSent}
        onSendRequest={handleSendRequest}
      />

      {/* MODAL */}
      {showGroupModal && (
        <GroupModal
          users={users}
          currentUser={currentUser}
          groupName={groupName}
          groupMembers={groupMembers}
          onClose={() => setShowGroupModal(false)}
          onCreate={handleCreateGroup}
          onGroupNameChange={setGroupName}
          onToggleMember={(id, checked) =>
            setGroupMembers((prev) =>
              checked ? [...prev, id] : prev.filter((m) => m !== id)
            )
          }
        />
      )}
    </div>
  );
}
