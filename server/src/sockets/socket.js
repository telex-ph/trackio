import { Server } from "socket.io";
import statusHandler from "./handlers/statusHandler.js";

let io;

const socket = async (server) => {
  io = new Server(server, {
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

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // Status watcher
  await statusHandler(io);

};

export default socket;
