import "./config/keyManager.js";
import dotenv from "dotenv";
dotenv.config();

import https from "https";
import fs from "fs";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

if (process.env.NODE_ENV === "production") {
  // Production - keep using normal HTTP or rely on reverse proxy SSL)
  app.listen(PORT, () => {
    console.log(`Production server running at http://localhost:${PORT}`);
  });
} else {
  //  Development - use mkcert certificates for local HTTPS
  const key = fs.readFileSync("./keys/localhost-key.pem");
  const cert = fs.readFileSync("./keys/localhost.pem");

  https.createServer({ key, cert }, app).listen(PORT, () => {
    console.log(`Local HTTPS server running at https://localhost:${PORT}`);
  });
}
