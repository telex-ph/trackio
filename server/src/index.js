// index.js
import dotenv from "dotenv";
dotenv.config();

import server from "./app.js";

const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
