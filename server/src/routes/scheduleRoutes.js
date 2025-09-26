import express from "express";
import {
  addSchedules,
  getSchedules,
} from "../controllers/scheduleControllers.js";
const router = express.Router();

router.post("/add-schedules", addSchedules);

router.get("/get-schedules", getSchedules);

export default router;
