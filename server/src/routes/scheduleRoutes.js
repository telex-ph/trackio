import express from "express";
import {
  addSchedules,
  getSchedules,
} from "../controllers/scheduleControllers.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";
const router = express.Router();

router.post("/add-schedules", verifyJWT, addSchedules);

router.get("/get-schedules/:id", verifyJWT, getSchedules);

export default router;
