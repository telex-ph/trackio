import cron from "node-cron";
import Attendance from "./model/Attendance.js";

// Runs every 1 minute
cron.schedule("* * * * *", async () => {
  const users = await Attendance.checkAbsentees();
  console.log(users);
});
