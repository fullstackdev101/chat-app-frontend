"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Socket as SocketClient } from "socket.io-client";
import { Group, Message } from "./types";
import { User } from "../types/user";
import Header from "./components/Header";
import LeftPanel from "./components/LeftPanel";
import ChatPanel from "./components/ChatPanel";
import RightPanel from "./components/RightPanel";
import GroupModal from "./components/GroupModal";
import { useAuthStore } from "../store/authStore";
import { getSocket } from "@/lib/socket";
import useChatConnections from "./hooks/useChatConnections";
import useSocketListeners from "./hooks/useSocketListeners";

export default function ChatPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [contacts, setContacts] = useState<User[]>([]);
  const [requestsReceived, setRequestsReceived] = useState<User[]>([]);
  const [requestsSent, setRequestsSent] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [unread, setUnread] = useState<Record<string, boolean>>({});
  const [directMessages, setDirectMessages] = useState<
    Record<string, Message[]>
  >({});
  // const [groupMessages, setGroupMessages] = useState<Record<number, Message[]>>(
  //   {}
  // );
  const [groupMessages, setGroupMessages] = useState<Record<number, Message[]>>(
    {}
  );

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState<number[]>([]);

  const socketRef = useRef<SocketClient | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const currentUserIdRef = useRef<number | null>(null);
  const selectedUserIdRef = useRef<number | null>(null);
  const selectedGroupIdRef = useRef<number | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // handle redirects + preload initial data
  useChatConnections({
    user,
    setUsers,
    setRequestsReceived,
    setRequestsSent,
    setGroups,
    setDirectMessages,
    setGroupMessages,
    setCurrentUser,
    currentUserIdRef,
    setContacts,
  });

  // setup socket listener for real-time updates
  useSocketListeners({
    socketRef,
    currentUser,
    currentUserIdRef,
    selectedUserIdRef,
    selectedGroupIdRef,
    setMessages,
    setDirectMessages,
    setGroupMessages,
    setUnread,
    setUsers,
    setGroups,
  });

  // === MESSAGE RECEIVE LISTENER (real-time update for sender/receiver) ===
  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on("message", (msg: Message) => {
      // handle direct messages
      if (
        msg.to_user &&
        (msg.to_user === currentUser?.id || msg.from_user === currentUser?.id)
      ) {
        const key = [msg.from_user, msg.to_user].sort().join("-");
        setDirectMessages((prev) => ({
          ...prev,
          [key]: [...(prev[key] || []), msg],
        }));

        if (
          selectedUser &&
          (msg.from_user === selectedUser.id || msg.to_user === selectedUser.id)
        ) {
          setMessages((prev) => [...prev, msg]);
        }
      }

      // handle group messages
      if (msg.group_id) {
        const id = msg.group_id; // number
        setGroupMessages((prev) => ({
          ...prev,
          [id]: [...(prev[id] || []), msg],
        }));

        if (selectedGroup && msg.group_id === selectedGroup.id) {
          setMessages((prev) => [...prev, msg]);
        }
      }
    });

    return () => {
      socketRef.current?.off("message");
    };
  }, [selectedUser, selectedGroup, currentUser]);

  // handle selecting file — just store, no upload yet
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "svg",
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "txt",
      "mp3",
      "wav",
      "mp4",
    ];
    const ext = file.name.split(".").pop()?.toLowerCase();
    const maxSizeMB = 10;

    if (!ext || !allowed.includes(ext)) {
      alert("❌ File type not allowed.");
      e.target.value = "";
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`❌ File too large. Max ${maxSizeMB}MB.`);
      e.target.value = "";
      return;
    }

    setSelectedFile(file); // ✅ only set file
  };

  // send direct or group — upload if file selected
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!newMessage.trim() && !selectedFile) return;

    let uploadedFileData: { fileUrl?: string; fileName?: string } = {};

    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/upload`,
        { method: "POST", body: formData }
      );
      uploadedFileData = await res.json();
    }

    const msg: Partial<Message> = {
      from_user: currentUser.id,
      text: newMessage.trim() || "",
      ...(selectedUser ? { to_user: selectedUser.id } : {}),
      ...(selectedGroup ? { group_id: selectedGroup.id } : {}),
      ...(uploadedFileData.fileUrl
        ? {
            file_url: uploadedFileData.fileUrl,
            file_name: uploadedFileData.fileName,
          }
        : {}),
    };

    socketRef.current?.emit("message", msg);

    // 👇 Add this to show sent message immediately
    // setMessages((prev) => [...prev, msg as Message]);

    setNewMessage("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // === SELECTION HANDLERS ===
  const handleSelectUser = (user: User) => {
    if (!currentUser) return;
    setSelectedUser(user);
    setSelectedGroup(null);
    const key = [currentUser.id, user.id].sort().join("-");
    setMessages(directMessages[key] || []);
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

  // === GROUP CREATION ===
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

  const handleLogout = () => {
    sessionStorage.removeItem("demoUserId");
    router.push("/login");
  };

  const goHome = () => router.push("/");

  if (!currentUser) return <div>Loading...</div>;

  return (
    <div className="flex h-screen bg-blue-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* LEFT PANEL */}
      <div className="flex flex-col w-72">
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          goHome={goHome}
        />
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

      {/* CHAT PANEL */}
      {/* <ChatPanel
        currentUser={currentUser}
        selectedUser={selectedUser}
        selectedGroup={selectedGroup}
        messages={messages}
        users={users}
        newMessage={newMessage}
        onSend={sendMessage} // ✅ unified send handler
        onFileChange={handleFileChange}
        onMessageChange={setNewMessage}
        selectedFile={selectedFile}
      /> */}

      <ChatPanel
        currentUser={currentUser}
        selectedUser={selectedUser}
        selectedGroup={selectedGroup}
        messages={messages}
        users={users}
        newMessage={newMessage}
        onSend={handleSend}
        onFileChange={(e) => {
          const file = e.target.files?.[0] || null;
          setSelectedFile(file);
        }}
        onMessageChange={setNewMessage}
        selectedFile={selectedFile}
        onClearFile={() => setSelectedFile(null)} // ✅ this resets file correctly
      />

      {/* RIGHT PANEL */}
      <RightPanel
        requestsReceived={requestsReceived}
        requestsSent={requestsSent}
        contacts={contacts}
        onAccept={(userId) => console.log("Accepted:", userId)}
        onReject={(userId) => console.log("Rejected:", userId)}
        onDeleteSent={(userId) => console.log("Deleted sent:", userId)}
        onSendRequest={(userId) => console.log("Sent request:", userId)}
      />

      {/* GROUP MODAL */}
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
