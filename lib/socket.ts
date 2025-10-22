// lib/socket.ts
import { io, Socket as SocketClient } from "socket.io-client";
import { Message } from "@/app/chat/types";
import { User } from "@/app/types/user";

// ---------------------------
// Server → Client events
// ---------------------------
export interface ServerToClientEvents {
  message: (msg: Message) => void;
  "users_connections:update": (data: {
    action: "accept" | "reject" | "delete" | "send";
    from_user_id: number;
    to_user_id: number;
  }) => void;
  "user:updated": (user: User) => void;
  "user:created": (user: User) => void;
  groupCreated: (group: {
    id: number;
    name: string;
    members: number[];
  }) => void;
}

// ---------------------------
// Client → Server events
// ---------------------------
export interface ClientToServerEvents {
  message: (msg: Partial<Message>) => void;
  "users_connections:update": (data: {
    action: "accept" | "reject" | "delete" | "send";
    from_user_id: number;
    to_user_id: number;
  }) => void;
  register: (userId: number) => void;
  createGroup: (group: { name: string; members: number[] }) => void;
}

// ---------------------------
// Socket instance - initialized only on client side
// ---------------------------
let socket: SocketClient<ServerToClientEvents, ClientToServerEvents> | null =
  null;

export const getSocket = (): SocketClient<
  ServerToClientEvents,
  ClientToServerEvents
> | null => {
  if (typeof window === "undefined") {
    // Return null for SSR - socket should not be used during server-side rendering
    return null;
  }

  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL, {
      transports: ["polling", "websocket"],
      autoConnect: true,
      withCredentials: false,
    });

    // ---------------------------
    // Debug connection events
    // ---------------------------
    socket.on("connect", () => console.log("✅ Socket connected:", socket?.id));
    socket.on("connect_error", (err) => console.error("❌ Socket error:", err));
    socket.on("disconnect", (reason) =>
      console.warn("⚠️ Disconnected:", reason)
    );
  }

  return socket;
};

// Export socket for backward compatibility (but use getSocket() instead)
export { getSocket as socket };
