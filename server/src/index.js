import dotenv from "dotenv";
import app from "./app.js";
import socket from "./sockets/socket.js";
import { createServer } from "http";
dotenv.config();

const server = createServer(app);

socket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
