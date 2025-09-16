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

// Helper function to detect iOS Safari
const isIOSSafari = (userAgent) => {
  return /iPad|iPhone|iPod/.test(userAgent) && /WebKit/.test(userAgent) && !/Edge/.test(userAgent);
};

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// CORS should come before session
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://trackio-frontend.vercel.app",
      "https://trackio-a0um.onrender.com"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Session configuration with iOS-specific handling
app.use(
  session({
    secret: process.env.SESSION_SECRET || "telexph", 
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiration on each request
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
    name: 'trackio.sid', // Custom session name
  })
);

app.use((req, res, next) => {
  if (/iPad|iPhone|iPod/.test(req.get('User-Agent'))) {
    console.log('iOS Request:', {
      method: req.method,
      url: req.url,
      sessionId: req.sessionID,
      sessionData: req.session
    });
  }
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/attendance", attendanceRoutes);

export default app;