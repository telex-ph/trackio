import "./config/keyManager.js";
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";  // default import - TAMA!

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at ${PORT}`);
});