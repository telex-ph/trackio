// src/utils/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_RENDER_BASE_URL || "http://localhost:3000";

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
});

socket.on("connect", () => {
  console.log("Socket connected with id:", socket.id); // 🔥 Should appear
});

socket.on("connect_error", (err) => {
  console.error("Socket connection error:", err);
});

export default socket;
