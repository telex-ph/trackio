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
import IP from "../../client/src/constants/ip.js";
import User from "./model/User.js";
import Attendance from "./model/Attendance.js";
import { addAttendance, handleBreakPause, handleBreakStart, updateBreakPause, updateBreakStart } from "./controllers/attendanceControllers.js";
import { STATUS } from "../constants/status.js";

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

app.post('/events', async (req, res) => {
  try {
    let data = req.body;

    const jsonStart = data.indexOf('{');
    const jsonEnd = data.lastIndexOf('}');

    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonStr = data.substring(jsonStart, jsonEnd + 1);
      const event = JSON.parse(jsonStr);

      if (event.AccessControllerEvent) {
        const ac = event.AccessControllerEvent;


        if (!ac.employeeNoString && !ac.name && ac.verifyMode === 'invalid') {
          res.status(200).send('OK');
          return;
        }

        if (ac.employeeNoString || (ac.name && ac.name !== 'Unknown')) {
          const ipAddress = event.ipAddress;

          // switch (ipAddress) {
          //   case IP.INDOOR:
          //     console.log(`Bio In! ${ipAddress} event at ${event.dateTime} - Employee: ${ac.employeeNoString}, Name: ${ac.name}`);
          //     break;
          //   case IP.OUTDOOR:
          //     console.log(`Bio Out! ${ipAddress} event at ${event.dateTime} - Employee: ${ac.employeeNoString}, Name: ${ac.name}`);
          //     break;
          //   case IP.ADMINDOOR:
          //     console.log(`Admin Bio! ${ipAddress} event at ${event.dateTime} - Employee: ${ac.employeeNoString}, Name: ${ac.name}`);
          //     break;
          //   default:
          //     break;
          // }

          const user = await User.getById(ac.employeeNoString);

          if (user) {
            const userId = user._id.toString();

            // Get the attendance first, tapos determine if 
            // there is already record
            const [attendance] = await Attendance.getById(userId);
            if (attendance) {
              const attendanceId = attendance._id.toString();
              const breaks = attendance.breaks || [];

              const totalBreak = attendance.totalBreak || 0;
              const status = attendance.status;
              if (status === STATUS.WORKING) {
                await handleBreakStart(attendanceId, breaks, totalBreak);
              }
              if (status === STATUS.ON_BREAK) {
                await handleBreakPause(attendanceId, breaks, totalBreak);
              }
            } else {
              console.log("No record! So, add attendance!");
              await addAttendance(userId);
            }




            // console.log(typeof id);
            // console.log(result);

          }

        }
      }
    }
    res.status(200).send('OK');

  } catch (error) {
    console.error('Error parsing event:', error.message);
    res.status(200).send('OK');
  }
});


export default app;
