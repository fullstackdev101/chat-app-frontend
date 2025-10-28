"use client";
import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { User } from "@/app/types/user";
import { Group, Message } from "../types";
import { Socket as SocketClient } from "socket.io-client";

interface Props {
  socketRef: React.MutableRefObject<SocketClient | null>;
  currentUser: User | null;
  currentUserIdRef: React.MutableRefObject<number | null>;
  selectedUserIdRef: React.MutableRefObject<number | null>;
  selectedGroupIdRef: React.MutableRefObject<number | null>;
  setMessages: (fn: (m: Message[]) => Message[]) => void;
  setDirectMessages: (
    fn: (d: Record<string, Message[]>) => Record<string, Message[]>
  ) => void;
  setGroupMessages: (
    fn: (g: Record<number, Message[]>) => Record<number, Message[]>
  ) => void;
  setUnread: (
    fn: (u: Record<string, boolean>) => Record<string, boolean>
  ) => void;
  setUsers: (fn: (u: User[]) => User[]) => void;
  setGroups: (fn: (g: Group[]) => Group[]) => void;
}

export default function useSocketListeners({
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
}: Props) {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socketRef.current = socket;

    const handleConnect = () => {
      console.log("✅ Socket connected:", socket.id);
      const uid =
        currentUser?.id || Number(sessionStorage.getItem("demoUserId"));
      if (uid) socket.emit("register", uid);
    };

    const handleMessage = (msg: Message) => {
      if (msg.group_id) {
        const gid = msg.group_id;
        setGroupMessages((prev) => {
          const arr = prev[gid] ? [...prev[gid]] : [];
          if (!arr.some((m) => m.id === msg.id)) arr.push(msg);
          return { ...prev, [gid]: arr };
        });
        if (selectedGroupIdRef.current === gid)
          setMessages((prev) =>
            !prev.some((m) => m.id === msg.id) ? [...prev, msg] : prev
          );
        if (msg.from_user !== currentUserIdRef.current)
          setUnread((prev) => ({ ...prev, [`group-${gid}`]: true }));
        return;
      }

      const key = [msg.from_user, msg.to_user].sort().join("-");
      setDirectMessages((prev) => {
        const arr = prev[key] ? [...prev[key]] : [];
        if (!arr.some((m) => m.id === msg.id)) arr.push(msg);
        return { ...prev, [key]: arr };
      });
      const isOpen =
        selectedUserIdRef.current &&
        (selectedUserIdRef.current === msg.from_user ||
          selectedUserIdRef.current === msg.to_user);
      if (isOpen)
        setMessages((prev) =>
          !prev.some((m) => m.id === msg.id) ? [...prev, msg] : prev
        );
      else if (msg.from_user !== currentUserIdRef.current)
        setUnread((prev) => ({ ...prev, [`user-${msg.from_user}`]: true }));
    };

    const handleGroupCreated = (group: Group) =>
      setGroups((prev) =>
        prev.some((g) => g.id === group.id) ? prev : [...prev, group]
      );

    socket.on("connect", handleConnect);
    socket.on("message", handleMessage);
    socket.on("groupCreated", handleGroupCreated);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("message", handleMessage);
      socket.off("groupCreated", handleGroupCreated);
    };
  }, [currentUser]);
}
