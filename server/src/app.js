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

app.use(
  session({
    secret: process.env.SESSION_SECRET || "telexph", 
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, 
      sameSite: "none", 
    },
  })
);

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

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/attendance", attendanceRoutes);

export default app;
