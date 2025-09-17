import cron from "node-cron";
import { checkAbsences, markAbsences } from "./services/absence.services.js";

// Runs every 1 minute
cron.schedule("* * * * *", async () => {
  const users = await checkAbsences();
  if (users) {
    await markAbsences(users);
  }
});
