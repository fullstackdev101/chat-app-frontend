// lib/socket.ts
import io from "socket.io-client";
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
export interface MinimalSocket {
  on: (...args: unknown[]) => unknown;
  off: (...args: unknown[]) => unknown;
  emit: (...args: unknown[]) => unknown;
  id?: string;
  connected?: boolean;
}

let socket: MinimalSocket | null = null;

// ---------------------------
// Get socket instance (singleton)
// ---------------------------
export const getSocket = (): MinimalSocket | null => {
  // Prevent using socket during SSR
  if (typeof window === "undefined") return null;

  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL as string, {
      transports: ["polling", "websocket"],
      autoConnect: true,
    }) as unknown as MinimalSocket;

    // ---------------------------
    // Debug connection events
    // ---------------------------
    socket.on("connect", () => console.log("✅ Socket connected:", socket?.id));

    socket.on("connect_error", (err: unknown) =>
      console.error("❌ Socket error:", err)
    );

    socket.on("disconnect", (reason: unknown) =>
      console.warn("⚠️ Disconnected:", reason)
    );
  }

  return socket;
};

// Optional backward-compatible export
export { getSocket as socket };
