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
import biometricRoute from "./routes/biometricRoute.js"
import webhook from "./utils/webhook.js";

const app = express();
dotenv.config();

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.text({ type: '*/*' }));
app.use(cookieParser());

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
// Routes
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
app.use('/api/biometric', biometricRoute);

app.get("/", async (req, res) => {
  await webhook("testing");

  res.json({
    message: "Trackio API is running",
    status: "success",
    timestamp: new Date().toISOString(),
  });
});

export default app;