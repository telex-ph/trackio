import express from "express";
import {
  addSchedules,
  deleteSchedules,
  getSchedules,
} from "../controllers/scheduleControllers.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";
const router = express.Router();

router.post("/upsert-schedules", verifyJWT, addSchedules);

router.delete("/delete-schedules", verifyJWT, deleteSchedules);

router.get("/get-schedules/:id", verifyJWT, getSchedules);

export default router;
