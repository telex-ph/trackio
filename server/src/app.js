import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";

// Routes imports
import authRoutes from "../src/routes/authRoutes.js";
import accountRoutes from "../src/routes/accountRoutes.js";
import attendanceRoutes from "../src/routes/attendanceRoutes.js";

const app = express();
dotenv.config();

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// CORS configuration - mas specific for iOS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://trackio-frontend.vercel.app",
      "https://trackio-a0um.onrender.com"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);

// Session configuration - mas strict para sa iOS
app.use(
  session({
    secret: process.env.SESSION_SECRET || "telexph", 
    resave: true, // Changed to true for iOS compatibility
    saveUninitialized: false,
    rolling: false, // Changed to false
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      domain: process.env.NODE_ENV === "production" ? ".onrender.com" : undefined,
    },
    name: 'connect.sid', // Use default session name
  })
);

// Debug middleware for iOS
app.use((req, res, next) => {
  if (/iPad|iPhone|iPod/.test(req.get('User-Agent'))) {
    console.log('iOS Request:', {
      method: req.method,
      url: req.url,
      sessionId: req.sessionID,
      hasSessionData: !!req.session.user,
      cookies: req.headers.cookie,
      userAgent: req.get('User-Agent')
    });
  }
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/attendance", attendanceRoutes);

export default app;