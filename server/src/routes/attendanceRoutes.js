import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import {
  addAttendance,
  getAttendances,
  getAttendance,
  updateAttendance,
} from "../controllers/attendanceControllers.js";

const router = Router();

router.post("/add-attendance/:id", verifyJWT, addAttendance);

router.get("/get-attendances", verifyJWT, getAttendances);

router.get("/get-attendance/:id", verifyJWT, getAttendance);

router.patch("/update-attendance", verifyJWT, updateAttendance);

export default router;
