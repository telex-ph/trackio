import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
// For marking absentees
import "./cron.js";

// Routes imports
import authRoutes from "../src/routes/authRoutes.js";
import accountRoutes from "../src/routes/accountRoutes.js";
import attendanceRoutes from "../src/routes/attendanceRoutes.js";
import announcementRoutes from "../src/routes/announcementRoutes.js";
import absenceRoutes from "../src/routes/absenceRoutes.js";
import mediaRoutes from "../src/routes/mediaRoutes.js";
import requestRoutes from "../src/routes/requestRoutes.js";

const app = express();
dotenv.config();

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "https://localhost:5173",
      "https://trackio-frontend.vercel.app",
      "https://www.telextrackio.com",
    ],
    credentials: true,
  })
);
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/absence", absenceRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/requests", requestRoutes);

export default app;
