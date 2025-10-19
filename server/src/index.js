import dotenv from "dotenv";
import app from "./app.js";
import initSocket from "./sockets/initSocket.js";
import { createServer } from "http";
dotenv.config();

const server = createServer(app);

initSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
