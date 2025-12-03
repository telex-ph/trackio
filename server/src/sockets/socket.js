import { Server } from "socket.io";
import {
  onBreakWatcher,
  overBreakWatcher,
} from "./handlers/statusWatcher.js";
import offenseWatcher from "./handlers/offenseWatcher.js";
import announcementWatcher from "./handlers/announcementWatcher.js";

let io;

export const getIO = () => io;

const socket = async (server, app) => {
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://localhost:5173",
        "https://trackio-frontend.vercel.app",
        "https://telextrackio.com",
      ],
      methods: ["*"],
      credentials: true,
    },
  });

  app.set("io", io);

  io.on("connection", (socket) => {
    // console.log("Client connected:", socket.id);
    socket.on("disconnect", () => {
      // console.log("Client disconnected:", socket.id);
    });
  });

  // Status watcher
  await onBreakWatcher(io);
  await overBreakWatcher(io);
  await offenseWatcher(io);
  await announcementWatcher(io);
};

export default socket;
