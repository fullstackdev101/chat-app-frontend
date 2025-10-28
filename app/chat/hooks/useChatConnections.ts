"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPreloads, getContacts } from "@/services/preloadService";
import { User } from "@/app/types/user";
import { Group, Message } from "../types";

interface Props {
  user: any;
  setUsers: (u: User[]) => void;
  setRequestsReceived: (u: User[]) => void;
  setRequestsSent: (u: User[]) => void;
  setGroups: (g: Group[]) => void;
  setDirectMessages: (d: Record<string, Message[]>) => void;
  setGroupMessages: (d: Record<number, Message[]>) => void;
  setCurrentUser: (u: User | null) => void;
  currentUserIdRef: React.MutableRefObject<number | null>;
  setContacts: (c: User[]) => void;
}

export default function useChatConnections({
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
}: Props) {
  const router = useRouter();

  // redirect if not logged in
  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  // preload users + groups
  useEffect(() => {
    const fetchData = async () => {
      try {
        const selectedIp = user?.sup_admin_selected_ip || user?.user_ip;
        if (selectedIp) {
          const { data } = await getPreloads(selectedIp);
          setUsers(data.users || []);
          setRequestsReceived(data.pendingRequestsReceived || []);
          setRequestsSent(data.pendingRequestsSent || []);
          setGroups(data.groups || []);
          setDirectMessages(data.messages?.direct || {});
          setGroupMessages(data.messages?.groups || {});
          const savedId = user?.id;
          sessionStorage.setItem("demoUserId", String(savedId));
          const chosen = data.users.find(
            (u: User) => String(u.id) === String(savedId)
          );
          if (chosen) {
            const me: User = {
              ...chosen,
              name: `${chosen.name} (${user ? user.office_location : ""})`,
            };
            setCurrentUser(me);
            currentUserIdRef.current = chosen.id;
          }
        }
      } catch (err) {
        console.error("Failed to preload chat:", err);
      }
    };
    fetchData();
  }, [user]);

  // fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const selectedIp = user?.sup_admin_selected_ip || user?.user_ip;
        if (selectedIp) {
          const { data: allContacts } = await getContacts(selectedIp);
          setContacts(allContacts || []);
        }
      } catch (err) {
        console.error("Failed to load contacts:", err);
      }
    };
    fetchContacts();
  }, [user?.sup_admin_selected_ip, user?.user_ip]);
}
