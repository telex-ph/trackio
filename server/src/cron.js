import cron from "node-cron";
import { checkAbsences, markAbsences } from "./services/absence.services.js";

// Runs every 1hr
cron.schedule("0 * * * *", async () => {
  const absentees = await checkAbsences();
  if (absentees) {
    await markAbsences(absentees);
  }
});
