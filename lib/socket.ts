// lib/socket.ts
import { io } from "socket.io-client";

export const socket = io("http://localhost:4000", {
  transports: ["polling", "websocket"], // ✅ Firefox often needs polling first
  autoConnect: true,
  withCredentials: false, // can be true if you have cross-origin cookies
});

// Optional: debug connection events
socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err);
});

socket.on("disconnect", (reason) => {
  console.warn("⚠️ Socket disconnected:", reason);
});

socket.on("reconnect_attempt", (attempt) => {
  console.log("🔄 Reconnect attempt:", attempt);
});
