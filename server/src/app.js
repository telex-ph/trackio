import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
// For marking absentees
import "./cron.js";

// Routes imports
import announcementRoutes from "../src/routes/announcementRoutes.js";
import recognitionRoutes from "../src/routes/recognitionRoutes.js";
import mediaRoutes from "../src/routes/mediaRoutes.js";
// import scheduleRoutes from "./routes/scheduleRoutes.js";
import serverRoutes from "./routes/serverRoutes.js";
import biometricRoute from "./routes/biometricRoute.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import auditlogsRoutes from "./routes/auditlogsRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import webhook from "./utils/webhook.js";

// New folder strucutre// remove this comment later and ensure older files and folders are deleted
import scheduleRoutes from "./modules/schedule/schedule.route.js";
import userRoutes from "./modules/user/user.route.js";
import courseRoutes from "./modules/course/course.route.js";
import authRoutes from "./modules/auth/auth.route.js";
import attendanceRoutes from "./modules/attendance/attendance.routes.js";
import absenceRoutes from "./modules/absence/absence.route.js";
import accountRoutes from "./modules/account/account.route.js";
import groupRoutes from "./modules/group/group.route.js";
import offenseRoutes from "./modules/offense/offense.route.js";
import requestRoutes from "./modules/request/request.route.js";


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
app.use("/api/courses", courseRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/recognition", recognitionRoutes);
app.use("/api/absence", absenceRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/offenses", offenseRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/server", serverRoutes);
app.use("/api/biometric", biometricRoute);
app.use("/api/leave", leaveRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/auditlogs", auditlogsRoutes);

// Health check
app.get("/", async (req, res) => {
  res.json({
    message: "Trackio API is running",
    status: "success",
    timestamp: new Date().toISOString(),
  });
});

export default app;
