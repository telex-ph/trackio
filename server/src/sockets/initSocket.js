import { Server } from "socket.io";
import chatHandler from "./handlers/chatHandler.js";

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://localhost:5173",
        "https://trackio-frontend.vercel.app",
        "http://telextrackio.com/",
      ],
      methods: ["*"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    chatHandler(io, socket);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};

export default initSocket;
