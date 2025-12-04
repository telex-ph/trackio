import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
// For marking absentees
import "./cron.js";

// Routes imports
import userRoutes from "../src/routes/userRoutes.js";
import authRoutes from "../src/routes/authRoutes.js";
import accountRoutes from "../src/routes/accountRoutes.js";
import attendanceRoutes from "../src/routes/attendanceRoutes.js";
import announcementRoutes from "../src/routes/announcementRoutes.js";
import absenceRoutes from "../src/routes/absenceRoutes.js";
import mediaRoutes from "../src/routes/mediaRoutes.js";
import requestRoutes from "../src/routes/requestRoutes.js";
import offenseRoutes from "./routes/offenseRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import serverRoutes from "./routes/serverRoutes.js";
import biometricRoute from "./routes/biometricRoute.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import webhook from "./utils/webhook.js";

dotenv.config();
const app = express();

// CORS (should come before routes)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://localhost:5173",
      "https://trackio-frontend.vercel.app",
      "https://www.telextrackio.com",
    ],
    credentials: true,
  })
);

// Cookie parser
app.use(cookieParser());

// --- IMPORTANT ---
// Register /api/upload BEFORE body parsers
app.use("/api/upload", uploadRoutes);

// Body parsers (JSON, URL-encoded, text)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.text({ type: "*/*", limit: "50mb" }));

// Other routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/absence", absenceRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/offenses", offenseRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/server", serverRoutes);
app.use("/api/biometric", biometricRoute);

// Health check
app.get("/", async (req, res) => {
  res.json({
    message: "Trackio API is running",
    status: "success",
    timestamp: new Date().toISOString(),
  });
});

export default app;
