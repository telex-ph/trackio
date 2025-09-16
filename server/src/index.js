import "./config/keyManager.js";
import dotenv from "dotenv";
dotenv.config();

import { app } from "./app.js";  // named import

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`Local server running at http://localhost:${PORT}`);
});